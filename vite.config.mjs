import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    root: "./src",
    build: {
        outDir: "../dist",
    },

    server: {
        host: true,
    },

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
