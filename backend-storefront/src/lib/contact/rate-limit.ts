import "server-only"
import { createHmac } from "crypto"
import { Pool } from "pg"

let pool: Pool | undefined

export async function admitContact(
  ip: string,
  email: string
): Promise<boolean> {
  const connectionString = process.env.CONTACT_RATE_LIMIT_DATABASE_URL
  const secret = process.env.CONTACT_RATE_LIMIT_SECRET
  if (!connectionString || !secret)
    throw new Error("Contact rate limit not configured")
  pool ??= new Pool({
    connectionString,
    // Railway's private certificate uses localhost; authenticate with the pinned target CA.
    ...(process.env.CONTACT_RATE_LIMIT_TLS_CA ? { ssl: {
      ca: process.env.CONTACT_RATE_LIMIT_TLS_CA,
      rejectUnauthorized: true,
      checkServerIdentity: () => undefined,
    } } : {}),
    max: 2,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000,
    statement_timeout: 3000,
  })
  const hash = (value: string) =>
    createHmac("sha256", secret).update(value).digest("hex")
  const buckets = [
    { key: hash(`ip:${ip}`), limit: 5, seconds: 900 },
    { key: hash(`email:${email.toLowerCase()}`), limit: 3, seconds: 3600 },
    { key: hash("global"), limit: 60, seconds: 3600 },
  ].sort((a, b) => a.key.localeCompare(b.key))
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    for (const bucket of buckets) {
      const result = await client.query(
        `
        INSERT INTO ardmag_contact.rate_limits AS current (key, count, expires_at)
        VALUES ($1, 1, now() + $3 * interval '1 second')
        ON CONFLICT (key) DO UPDATE SET
          count = CASE WHEN current.expires_at <= now() THEN 1 ELSE current.count + 1 END,
          expires_at = CASE WHEN current.expires_at <= now()
            THEN now() + $3 * interval '1 second' ELSE current.expires_at END
        WHERE current.expires_at <= now() OR current.count < $2
        RETURNING count`,
        [bucket.key, bucket.limit, bucket.seconds]
      )
      if (!result.rowCount) {
        await client.query("ROLLBACK")
        return false
      }
    }
    await client.query(`DELETE FROM ardmag_contact.rate_limits WHERE key IN (
      SELECT key FROM ardmag_contact.rate_limits
      WHERE expires_at < now() - interval '1 hour'
      ORDER BY expires_at LIMIT 100 FOR UPDATE SKIP LOCKED
    )`)
    await client.query("COMMIT")
    return true
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}
