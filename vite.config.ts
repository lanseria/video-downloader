import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { join } from "path";
import { VitePluginElectronBuilder } from "./plugin";
import { compileFile } from "bytenode";
import { writeFileSync } from "fs";
import { UserConfig } from "vite";
import { ConfigEnv } from "vite";
import { loadEnv } from "vite";

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  console.log(env.VITE_ELECTRON_BUILDER_CONFIG);
  return {
    root: join(__dirname, "src/render"),
    plugins: [
      vue(),
      VitePluginElectronBuilder({
        root: root,
        tsconfig: "./tsconfig.main.json",
        electronBuilderConfig: process.env.VITE_ELECTRON_BUILDER_CONFIG,
        afterEsbuildBuild: async () => {
          await compileFile({
            filename: "./dist/main/index.js",
            output: "./dist/main/main.jsc",
            electron: true,
          });

          writeFileSync(
            "./dist/main/index.js",
            "require('bytenode');require('./main.jsc')"
          );
        },
      }),
    ],
    resolve: {
      alias: {
        "@render": join(__dirname, "src/render"),
        "@main": join(__dirname, "src/main"),
        "@common": join(__dirname, "src/common"),
      },
    },
    base: "./",
    build: {
      outDir: join(__dirname, "dist/render"),
      emptyOutDir: true,
    },
    optimizeDeps: {
      include: [
        "@vueuse/core",
        "@vicons/ionicons5",
        "nanoid",
        "indexeddb-export-import",
      ],
    },
  };
};
