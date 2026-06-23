import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@rspack/binding",
    "@rspack/core",
    "esbuild"
  ]
};

export default nextConfig;
