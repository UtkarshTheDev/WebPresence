import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/api.ts"],
  format: ["esm"],
  target: "node16", // Lower target for wider compatibility
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: false,
  bundle: true,
  minify: false,
  skipNodeModulesBundle: true,
  shims: true,
  keepNames: true,
  treeshake: true,
  external: ["discord-rpc", "express", "ws", "cors"],
});
