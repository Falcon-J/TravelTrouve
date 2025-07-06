/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only ignore during development, not production
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  images: {
    unoptimized: true,
    domains: ["ui-avatars.com"],
  },
  // Production optimizations
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
