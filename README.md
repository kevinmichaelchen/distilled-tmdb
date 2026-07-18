# distilled-tmdb

An Effect 4-native TMDB v3 SDK generated from TMDB's official OpenAPI 3.1 document. Operations use Distilled's trait-driven protocol runtime and preserve TMDB's vendor-native request and response shapes.

Install the SDK with Effect beta 99 and set TMDB's API Read Access Token:

```sh
bun add @kevinmichaelchen/distilled-tmdb@0.1.1 effect@4.0.0-beta.99
export TMDB_API_READ_ACCESS_TOKEN="your-api-read-access-token"
```

The SDK deliberately supports bearer-token authentication only. It does not read `TMDB_API_KEY` or send TMDB's separate `api_key` query parameter.

```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsFromEnv } from "@kevinmichaelchen/distilled-tmdb";
import { movieDetails } from "@kevinmichaelchen/distilled-tmdb/movie";

const TmdbLive = Layer.mergeAll(FetchHttpClient.layer, CredentialsFromEnv);
await Effect.runPromise(
  Effect.provide(movieDetails({ movie_id: 550 }), TmdbLive),
);
```
