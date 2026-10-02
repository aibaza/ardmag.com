import { assertTenaxEnvironment } from "../policy"

describe("verified Tenax deployment environments", () => {
  it.each(["c47689f6-eaf2-48ac-8eae-bdcf11e7c27c", "7f5d3fcc-e6f7-4196-8dd5-20c28faf3ee7"])("accepts verified environment %s", environment => {
    expect(() => assertTenaxEnvironment(environment)).not.toThrow()
  })
  it.each([undefined, "", "production", "unrelated-environment"])("rejects unverified environment %s", environment => {
    expect(() => assertTenaxEnvironment(environment)).toThrow("verified ARDmag environments")
  })
})
