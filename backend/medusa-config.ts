import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const modules: Record<string, unknown>[] = []

if (process.env.STRIPE_API_KEY) {
  modules.push({
    resolve: "@medusajs/payment-stripe",
    options: {
      apiKey: process.env.STRIPE_API_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      capture: true,
    },
  })
}

if (process.env.SMTP2GO_API_KEY) {
  modules.push({
    resolve: "./src/modules/notification-smtp2go",
    options: {
      apiKey: process.env.SMTP2GO_API_KEY,
      fromEmail: process.env.SMTP_FROM || "office@arcromdiamonds.ro",
      fromName: "ardmag.com",
    },
  })
}

module.exports = defineConfig({
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
  modules,
})
