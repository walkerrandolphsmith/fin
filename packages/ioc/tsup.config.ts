import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.build.json",
  external: ["mongodb", "mongoose", "crypto"],
  noExternal: [],
});
