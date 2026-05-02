import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  revalidateTag("categories")
  revalidatePath("/")
  revalidatePath("/[countryCode]", "page")
  return NextResponse.json({ revalidated: true })
}
