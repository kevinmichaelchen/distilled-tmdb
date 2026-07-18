import { join } from "node:path";
import { generateFromOpenAPI } from "@kevinmichaelchen/distilled/openapi/generate";

const root = join(import.meta.dir, "..");
await generateFromOpenAPI({
  specPath: join(root, "specs", "distilled-spec-tmdb", "specs", "openapi.json"),
  patchDir: join(root, "patches"),
  outputDir: join(root, "src", "services"),
  importPrefix: "..",
  apiImport: "@kevinmichaelchen/distilled/api",
  schemaImport: "@kevinmichaelchen/distilled/schema",
  traitsImport: "../traits",
  protocolImport: "../protocol",
  protocolName: "TmdbProtocol",
  operationErrorType: "TmdbOpError",
  operationContextType: "TmdbOpContext",
  retryImport: "../retry",
  errorsImport: "../errors",
  includeOperationErrors: true,
  skipDeprecated: true,
});
