import { ConfigError } from "@kevinmichaelchen/distilled/errors";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";

export interface AccessTokenConfig {
  readonly token: string;
  readonly apiBaseUrl?: string;
}

export interface ResolvedCredentials {
  readonly apiBaseUrl: string;
  readonly token: Redacted.Redacted<string>;
}

export class Credentials extends Context.Service<
  Credentials,
  Effect.Effect<ResolvedCredentials, ConfigError>
>()("TmdbCredentials") {}

export const accessTokenCredentials = (
  config: AccessTokenConfig,
): ResolvedCredentials => ({
  apiBaseUrl: (config.apiBaseUrl ?? "https://api.themoviedb.org").replace(
    /\/$/,
    "",
  ),
  token: Redacted.make(config.token),
});

export const fromAccessToken = (
  config: AccessTokenConfig,
): Layer.Layer<Credentials> =>
  Layer.succeed(Credentials, Effect.succeed(accessTokenCredentials(config)));

const fromConfigError = (message: string) => () => new ConfigError({ message });

const tokenConfig = Config.string("TMDB_API_READ_ACCESS_TOKEN").pipe(
  Config.orElse(() => Config.string("TMDB_API_KEY")),
);

const envConfig = Config.all({
  token: tokenConfig,
  apiBaseUrl: Config.option(Config.string("TMDB_API_URL")),
});

export const resolveFromEnv: Effect.Effect<ResolvedCredentials, ConfigError> =
  envConfig.pipe(
    Effect.mapError(
      fromConfigError(
        "Failed to load a TMDB token from TMDB_API_READ_ACCESS_TOKEN or TMDB_API_KEY",
      ),
    ),
    Effect.map((config) =>
      accessTokenCredentials({
        token: config.token,
        apiBaseUrl: Option.getOrUndefined(config.apiBaseUrl),
      }),
    ),
  );

export const fromEnv = (): Layer.Layer<Credentials> =>
  Layer.succeed(Credentials, resolveFromEnv);

export const CredentialsFromEnv = fromEnv();
