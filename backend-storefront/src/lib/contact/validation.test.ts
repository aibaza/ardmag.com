import { describe, expect, it } from "vitest"
import { readContactBody, validateContact } from "./validation"
const valid = { name: "Andrei", email: "review@example.invalid", message: "Test" }
describe("contact validation", () => {
  it("accepts valid text and optional phone", () => {
    expect(validateContact(valid)).toEqual({ ...valid, phone: "" })
  })
  it.each([null, [], { ...valid, email: "bad" }, { ...valid, name: {} },
    { ...valid, name: "a\r\nb" }, { ...valid, message: " " },
    { ...valid, message: "x".repeat(5001) }, { ...valid, email: "x".repeat(255) }])
    ("rejects invalid or excessive fields", (value) => expect(validateContact(value)).toBeNull())
  it("bounds streamed bodies even without Content-Length", async () => {
    const request = new Request("https://test.ardmag.ro/api/contact", {
      method: "POST", body: JSON.stringify({ ...valid, message: "x".repeat(17000) }) })
    await expect(readContactBody(request)).rejects.toThrow("Body too large")
  })
})
