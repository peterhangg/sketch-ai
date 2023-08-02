/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "replicate.com",
      "replicate.delivery",
      "pbxt.replicate.delivery",
      "sketch-ai.s3.us-east-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
