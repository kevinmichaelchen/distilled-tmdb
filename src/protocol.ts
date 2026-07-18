import * as API from "@kevinmichaelchen/distilled/api";
import {
  ConfigError,
  HTTP_STATUS_MAP,
  InternalServerError,
} from "@kevinmichaelchen/distilled/errors";
import {
  buildOutput,
  buildRequest,
  matchTypedError,
} from "@kevinmichaelchen/distilled/protocol-http";
import { parseRetryAfterForStatus } from "@kevinmichaelchen/distilled/retry-after";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import type * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { Credentials, type ResolvedCredentials } from "./credentials.ts";
import { TmdbParseError, type DefaultErrors, UnknownTmdbError } from "./errors.ts";

export type TmdbOpError =
  | DefaultErrors
  | ConfigError
  | HttpClientError.HttpClientError;

export type TmdbOpContext = Credentials | HttpClient.HttpClient;

const ErrorEnvelope = Schema.Struct({
  status_code: Schema.optional(Schema.Number),
  status_message: Schema.optional(Schema.String),
});

const decodeErrorEnvelope = Schema.decodeUnknownOption(ErrorEnvelope);
const decodeJson = Schema.decodeUnknownEffect(Schema.UnknownFromJsonString);

const fail = (error: unknown): Effect.Effect<never> =>
  Effect.fail(error) as Effect.Effect<never>;

const encode = ({
  input,
  inputAst,
}: {
  readonly input: unknown;
  readonly inputAst: AST.AST;
}) =>
  Effect.gen(function* () {
    const resolveCredentials = yield* Credentials;
    const credentials =
      yield* resolveCredentials as Effect.Effect<ResolvedCredentials>;
    return buildRequest({
      input,
      inputAst,
      baseUrl: credentials.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${Redacted.value(credentials.token)}`,
      },
    });
  });

const decode = ({
  response,
  outputAst,
  errors,
}: {
  readonly response: HttpClientResponse.HttpClientResponse;
  readonly outputAst: AST.AST;
  readonly errors: ReadonlyArray<unknown>;
}) =>
  Effect.gen(function* () {
    const text = (yield* response.text.pipe(Effect.orDie)) ?? "";
    const body = text.trim().length === 0
      ? undefined
      : yield* decodeJson(text).pipe(
          Effect.mapError((cause) => new TmdbParseError({ body: text, cause })),
        ) as Effect.Effect<unknown>;

    if (response.status >= 400) {
      const envelope = decodeErrorEnvelope(body);
      const message = Option.match(envelope, {
        onNone: () => text || `HTTP ${response.status}`,
        onSome: (value) =>
          value.status_message ?? (text || `HTTP ${response.status}`),
      });
      const typed = matchTypedError(errors, response.status, [{ message }]);
      if (typed !== undefined) return yield* fail(typed);
      const ErrorClass =
        HTTP_STATUS_MAP[response.status as keyof typeof HTTP_STATUS_MAP];
      if (ErrorClass) {
        return yield* fail(
          new ErrorClass({
            message,
            retryAfter: parseRetryAfterForStatus(
              response.status,
              response.headers,
            ),
          } as never),
        );
      }
      if (response.status >= 500) {
        return yield* fail(
          new InternalServerError({
            message,
            retryAfter: parseRetryAfterForStatus(
              response.status,
              response.headers,
            ),
          }),
        );
      }
      return yield* fail(
        new UnknownTmdbError({
          status: response.status,
          statusCode: Option.flatMap(envelope, (value) =>
            Option.fromNullishOr(value.status_code),
          ).pipe(Option.getOrUndefined),
          message,
          body,
        }),
      );
    }

    return buildOutput({
      value: body,
      outputAst,
      headers: response.headers,
      status: response.status,
    });
  });

export const TmdbProtocol: Layer.Layer<API.Protocol> = Layer.succeed(
  API.Protocol,
  API.Protocol.of({
    encode: (args) =>
      encode(args) as Effect.Effect<HttpClientRequest.HttpClientRequest>,
    decode,
  }),
);
