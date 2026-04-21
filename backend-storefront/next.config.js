const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

// R2 CDN (media.ardmag.com) and Railway backend (api.ardmag.com)
const R2_HOSTNAME = process.env.NEXT_PUBLIC_R2_HOSTNAME || "pub-28d7a4f80d924560ae8c2fe111240e4a.r2.dev"
const RAILWAY_HOSTNAME = process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || "api.ardmag.surcod.ro"

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: R2_HOSTNAME,
      },
      {
        protocol: "https",
        hostname: RAILWAY_HOSTNAME,
      },
    ],
  },
}

module.exports = nextConfig
