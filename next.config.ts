import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the project-owned AGENTS.md guidance stable across dev runs.
  agentRules: false,
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
