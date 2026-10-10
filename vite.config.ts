import { defineConfig } from "vite";

export default defineConfig({
    // Caminhos relativos: o site funciona mesmo publicado numa subpasta (por exemplo, no GitHub Pages)
    base: "./",
    build: {
        rollupOptions: {
            input: {
                inicio: "index.html",
                simulador: "simulador.html",
            },
        },
    },
});