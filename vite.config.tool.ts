import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

const { version } = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"));

export default defineConfig({
  define: {
    // Footer version, embedded at build time from package.json.
    __MDGEN_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      "@static": resolve(__dirname, "src/static"),
    },
  },
  publicDir: "public",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    allowedHosts: ["a371c6a6a84e.ngrok-free.app"],
  },
  build: {
    emptyOutDir: true,
  },
});
