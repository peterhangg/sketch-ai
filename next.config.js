/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      "replicate.com",
      "replicate.delivery",
      "sketch-ai.s3.us-east-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
