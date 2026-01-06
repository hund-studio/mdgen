import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
