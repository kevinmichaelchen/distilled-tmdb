import { describe, expect, test } from "bun:test";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { accessTokenCredentials } from "../src/credentials.ts";
import {
  movieDetails,
  MovieDetailsInput,
} from "../src/services/movie.ts";
import coverage from "../src/services/coverage.json";

describe("TMDB service generation", () => {
  test("generates the complete official operation surface", () => {
    expect(coverage.operations.total).toBe(152);
    expect(coverage.operations.generated).toBe(152);
    expect(coverage.operations.failed).toBe(0);
    expect(typeof movieDetails).toBe("function");
  });

  test("decodes the movie details request boundary", () => {
    expect(
      Schema.decodeUnknownSync(MovieDetailsInput)({
        movie_id: 550,
        language: "en-US",
      }),
    ).toEqual({ movie_id: 550, language: "en-US" });
  });

  test("redacts access tokens and normalizes the API base URL", () => {
    const credentials = accessTokenCredentials({
      token: "secret",
      apiBaseUrl: "https://example.test/",
    });

    expect(credentials.apiBaseUrl).toBe("https://example.test");
    expect(Redacted.isRedacted(credentials.token)).toBe(true);
    expect(String(credentials.token)).not.toContain("secret");
  });
});
