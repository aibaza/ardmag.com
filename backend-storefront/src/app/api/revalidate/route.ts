import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_TAGS = ["products", "categories"]
const DEFAULT_PATHS = [
  "/",
  "/[countryCode]",
  "/produse",
  "/promotii",
  "/categories/[...category]",
  "/products/[handle]",
]

function runRevalidation(tag?: string | null, path?: string | null) {
  if (tag) {
    revalidateTag(tag)
    return { revalidated: true, tag }
  }

  if (path) {
    revalidatePath(path, "page")
    return { revalidated: true, path }
  }

  for (const defaultTag of DEFAULT_TAGS) {
    revalidateTag(defaultTag)
  }
  for (const defaultPath of DEFAULT_PATHS) {
    revalidatePath(defaultPath, "page")
  }

  return { revalidated: true, tags: DEFAULT_TAGS, paths: DEFAULT_PATHS }
}

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const secret = body.secret ?? req.headers.get("x-revalidate-secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return unauthorized()
  }

  return NextResponse.json(runRevalidation(body.tag, body.path))
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return unauthorized()
  }

  return NextResponse.json(
    runRevalidation(
      req.nextUrl.searchParams.get("tag"),
      req.nextUrl.searchParams.get("path")
    )
  )
}
