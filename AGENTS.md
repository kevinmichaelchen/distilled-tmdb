# TMDB SDK maintenance runbook

- Never edit `specs/distilled-spec-tmdb` or `src/services` by hand.
- Pin spec updates as explicit submodule commits and inspect their raw diff before regeneration.
- Encode confirmed TMDB behavior in focused RFC 6902 patches or the handwritten protocol.
- Keep service modules generated from the official TMDB OpenAPI document.
- Run `bun run check` after every spec, patch, generator, or runtime change.
- Verify Effect 4 APIs from installed source; do not infer them from Effect 3 examples.
- Never log access tokens, authorization headers, or `.env` files.
