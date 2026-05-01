import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const modules: Record<string, unknown>[] = []

// Redis event bus (productie) sau in-memory (dev fara REDIS_URL)
if (process.env.REDIS_URL) {
  modules.push({
    resolve: "@medusajs/medusa/event-bus-redis",
    options: { redisUrl: process.env.REDIS_URL },
  })
  modules.push({
    resolve: "@medusajs/medusa/cache-redis",
    options: { redisUrl: process.env.REDIS_URL, ttl: 30 },
  })
  modules.push({
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: { redis: { redisUrl: process.env.REDIS_URL } },
  })
}

// File storage: R2 (S3-compatible) daca sunt setate credentialele, altfel local
if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  modules.push({
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "./src/modules/file-r2-variants",
          id: "r2-variants",
          options: {
            file_url: process.env.R2_PUBLIC_URL,
            access_key_id: process.env.R2_ACCESS_KEY_ID,
            secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
            region: "auto",
            bucket: process.env.R2_BUCKET,
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          },
        },
      ],
    },
  })
}

const paymentProviders: Record<string, unknown>[] = []
if (process.env.STRIPE_API_KEY) {
  paymentProviders.push({
    resolve: "@medusajs/payment-stripe",
    id: "stripe",
    options: {
      apiKey: process.env.STRIPE_API_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      capture: true,
    },
  })
}
if (paymentProviders.length > 0) {
  modules.push({
    resolve: "@medusajs/medusa/payment",
    options: { providers: paymentProviders },
  })
}

modules.push({
  resolve: "@medusajs/medusa/fulfillment",
  options: {
    providers: [
      { resolve: "@medusajs/medusa/fulfillment-manual", id: "manual" },
      { resolve: "./src/modules/fulfillment-fan-courier", id: "fan-courier" },
    ],
  },
})

if (process.env.SMTP2GO_API_KEY || process.env.SMTP_HOST) {
  modules.push({
    resolve: "./src/modules/notification-smtp2go",
    options: {
      apiKey: process.env.SMTP2GO_API_KEY,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      smtpUser: process.env.SMTP_USERNAME,
      smtpPass: process.env.SMTP_PASSWORD,
      fromEmail: process.env.SMTP_FROM || "ardmag@surcod.ro",
      fromName: "ardmag.com",
    },
  })
}

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  modules,
})
