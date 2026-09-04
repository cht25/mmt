import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        // Landing page at "/"
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        // App (installable PWA) at "/app.html"
        app: fileURLToPath(new URL("./app.html", import.meta.url)),
      },
    },
  },
});
