import { defineConfig } from "tsup";

const bundleWorkspacePackagesPattern = /^@fin\//;

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.json",
  noExternal: [bundleWorkspacePackagesPattern],
  esbuildOptions(options) {
    options.resolveExtensions = [".ts", ".tsx", ".js", ".jsx", ".json"];
  },
  external: [
    "chalk",
    "ora",
    "inquirer",
    "commander",
    "cross-env",
    "mongoose",
    "pdf-parse",
    "tesseract.js",
    "pdf2pic",
    "pdf-poppler",
  ],
});
