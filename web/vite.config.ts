import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Static build for Netlify: every route is prerendered to HTML (so each page ships
// its own <head> for search engines), with an SPA shell as the fallback.
// Forms talk to the Express API on Fly.io — there are no server functions.
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
      "/auth": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // The shell is rendered at an unused path so it doesn't replace the home page's index.html.
      // Pages are de-duplicated by path, so the shell gets its own path (same route as "/")
      // or it would replace the home page's index.html.
      spa: { enabled: true, maskPath: "/?spa-shell" },
      prerender: {
        enabled: true,
        // Skip query-string variants (e.g. /apply?conversation=…) and trailing-slash duplicates.
        filter: ({ path }) =>
          path === "/?spa-shell" || (!path.includes("?") && (path === "/" || !path.endsWith("/"))),
        crawlLinks: true,
        autoStaticPathsDiscovery: true,
        failOnError: true,
        retryCount: 2,
        retryDelay: 1000,
      },
      // sitemap.xml is written by scripts/sitemap.mjs after the build.
      pages: [{ path: "/" }, { path: "/qr" }, { path: "/survey" }, { path: "/portal" }],
    }),
    viteReact(),
  ],
});
