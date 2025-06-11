import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    root: "./src",
    build: {
        outDir: resolve(__dirname, "dist"),
    },

    server: {
        host: true,
    },
});
