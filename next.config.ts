import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully static: `next build` writes plain HTML, CSS and JS to `out/`,
  // which is what Netlify publishes.
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
