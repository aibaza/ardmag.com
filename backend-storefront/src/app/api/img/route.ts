import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const CACHE_DIR = path.join(process.cwd(), '.image-cache')

const VARIANT_WIDTHS: Record<string, number> = {
  card: 400,
  thumb: 200,
}

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('src')
  const variant = req.nextUrl.searchParams.get('v') || 'card'

  if (!src || !VARIANT_WIDTHS[variant]) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  const cacheKey = crypto
    .createHash('md5')
    .update(`${src}__${variant}`)
    .digest('hex')
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.jpg`)

  if (fs.existsSync(cachePath)) {
    const ab = fs.readFileSync(cachePath).buffer as ArrayBuffer
    return new NextResponse(ab, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'HIT',
      },
    })
  }

  const sourceUrl = src.startsWith('http') ? src : `${BACKEND_URL}${src}`
  let sourceAb: ArrayBuffer
  try {
    const res = await fetch(sourceUrl)
    if (!res.ok) return new NextResponse('Source Not Found', { status: 404 })
    sourceAb = await res.arrayBuffer()
  } catch {
    return new NextResponse('Failed to fetch source', { status: 502 })
  }

  const processed = await sharp(Buffer.from(sourceAb))
    .trim({ threshold: 15 })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(VARIANT_WIDTHS[variant], null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(cachePath, new Uint8Array(processed))

  const resultAb = processed.buffer.slice(
    processed.byteOffset,
    processed.byteOffset + processed.byteLength
  ) as ArrayBuffer

  return new NextResponse(resultAb, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Cache': 'MISS',
    },
  })
}
