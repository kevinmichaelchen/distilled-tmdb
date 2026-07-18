export {
  BadGateway,
  BadRequest,
  Conflict,
  ConfigError,
  Forbidden,
  GatewayTimeout,
  InternalServerError,
  Locked,
  NotFound,
  ServiceUnavailable,
  TooManyRequests,
  Unauthorized,
  UnprocessableEntity,
  HTTP_STATUS_MAP,
  DEFAULT_ERRORS,
  API_ERRORS,
} from "@kevinmichaelchen/distilled/errors";

import * as Category from "@kevinmichaelchen/distilled/category";
import type { DefaultErrors as CoreDefaultErrors } from "@kevinmichaelchen/distilled/errors";
import * as Schema from "effect/Schema";

export class UnknownTmdbError extends Schema.TaggedErrorClass<UnknownTmdbError>()(
  "UnknownTmdbError",
  {
    status: Schema.Number,
    statusCode: Schema.optional(Schema.Number),
    message: Schema.String,
    body: Schema.Unknown,
  },
).pipe(Category.withServerError) {}

export class TmdbParseError extends Schema.TaggedErrorClass<TmdbParseError>()(
  "TmdbParseError",
  { body: Schema.Unknown, cause: Schema.Defect() },
).pipe(Category.withParseError) {}

export type ClientErrors = UnknownTmdbError | TmdbParseError;
export type DefaultErrors = CoreDefaultErrors | ClientErrors;
