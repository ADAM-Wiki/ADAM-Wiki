import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import remarkGfm from "remark-gfm";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: "/ADAM-Wiki/",
    plugins: [
      mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkGfm], // ← add this
      }),
      react(),
      tailwindcss(),
    ],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      // Frozen at build rather than read from the clock.
      //
      // The copyright year was `new Date().getFullYear()`, which the
      // prerenderer evaluates at build time and the browser evaluates again on
      // every visit. From 1 January those two disagree and React hydrates onto
      // markup that no longer matches. Substituting a literal makes the
      // prerendered HTML and the client bundle identical by construction.
      __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
    },
  };
});
