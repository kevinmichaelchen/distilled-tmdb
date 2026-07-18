# distilled-tmdb

An Effect 4-native TMDB v3 SDK generated from TMDB's official OpenAPI 3.1 document. Operations use Distilled's trait-driven protocol runtime and preserve TMDB's vendor-native request and response shapes.

Set `TMDB_API_READ_ACCESS_TOKEN`. `TMDB_API_KEY` remains accepted as a migration fallback for `movie-effect` users.

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
