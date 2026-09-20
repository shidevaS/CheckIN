/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tuiton/shared", "@tuiton/db"],
  experimental: { serverActions: { bodySizeLimit: "2mb" } }
};
module.exports = nextConfig;
