import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const modules: Record<string, unknown>[] = []

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
