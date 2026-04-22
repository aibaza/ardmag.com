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
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
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

nextConfig.headers = async () => [
  {
    source: "/:path*\\.(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
    headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
  },
]

module.exports = nextConfig
