import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const tag = req.nextUrl.searchParams.get("tag")
  const path = req.nextUrl.searchParams.get("path")

  if (tag) {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag })
  }
  if (path) {
    revalidatePath(path, "page")
    return NextResponse.json({ revalidated: true, path })
  }

  revalidateTag("categories")
  revalidateTag("products")
  revalidatePath("/")
  revalidatePath("/[countryCode]", "page")
  return NextResponse.json({ revalidated: true, default: true })
}
