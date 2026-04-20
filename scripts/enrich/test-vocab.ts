import {
  BRAND_MATCHERS,
  BAND_TYPE_MATCHERS,
  MATERIAL_MATCHERS,
  THREAD_MATCHERS,
  matchAll,
  extractDiameters,
  normalize,
} from "./vocab"

interface TestCase {
  handle: string
  title: string
  collection: string
  description: string
  option_names: string[]
  option_values: string[]
  expected: {
    brand: string | null
    materials: string[]
    band_types: string[]
    diameters_mm: number[]
  }
}

const TEST_CASES: TestCase[] = [
  {
    handle: "mastic-lichid",
    title: "MASTIC LICHID",
    collection: "MASTICI TENAX",
    description: "Adeziv bicomponent epoxidic. Folosit pentru piatră naturală, Cuarț. Rezistență la umiditate.",
    option_names: ["CULOARE", "CANTITATE"],
    option_values: ["TRANSPARENT;BEJ", "1 LITRU"],
    expected: {
      brand: "tenax",
      materials: ["piatra-naturala", "cuart"],
      band_types: [],
      diameters_mm: [],
    },
  },
  {
    handle: "discuri-de-taiere-diamantate",
    title: "DISCURI DE TAIERE DIAMANTATE",
    collection: "DISCURI DE TAIERE",
    description:
      "Discuri diamantate WOOSUK. Tip bandă: TURBO CURB, TURBO EXTRA CLASS, SEGMENTAT. Pentru granit, marmură și beton.",
    option_names: ["TIP PIATRĂ", "TIP DISC", "DIAMETRU"],
    option_values: ["MARMURĂ;GRANIT", "TURBO;TURBO CURB", "115;125;180;230"],
    expected: {
      brand: "woosuk",
      materials: ["beton", "granit", "marmura"],
      band_types: ["curb", "segmentata", "turbo", "turbo-curb", "turbo-extra-class"],
      diameters_mm: [115, 125, 180, 230],
    },
  },
  {
    handle: "dischete-de-slefuit-diamantate",
    title: "DISCHETE DE SLEFUIT DIAMANTATE",
    collection: "SLEFUIRE PIATRA",
    description: "Dischete diamantate pentru slefuire granit, marmura, travertin. Grit 50 la 3000.",
    option_names: ["GRANULATIE"],
    option_values: ["50;100;200;400;800;1500;3000"],
    expected: {
      brand: null,
      materials: ["granit", "marmura", "travertin"],
      band_types: [],
      diameters_mm: [50, 100, 200, 400, 800, 1500, 3000],
    },
  },
  {
    handle: "delta-research-turbo-115",
    title: "DISC DIAMANTAT TURBO Ø115 DELTA RESEARCH",
    collection: "DISCURI DE TAIERE",
    description: "Disc turbo continuu pentru granit. Diametru 115 mm. Filet M14. Marca Delta Research.",
    option_names: ["DIAMETRU"],
    option_values: ["115"],
    expected: {
      brand: "delta-research",
      materials: ["granit"],
      band_types: ["continua", "turbo"],
      diameters_mm: [115],
    },
  },
  {
    handle: "sait-disc-abraziv",
    title: "DISC ABRAZIV SAITDISC",
    collection: "ABRAZIVI",
    description: "Disc abraziv SAITDISC pentru piatra naturala si beton armat. Diametru 115mm, 125mm.",
    option_names: ["DIAMETRU"],
    option_values: ["115;125"],
    expected: {
      brand: "sait",
      materials: ["beton", "beton-armat", "piatra-naturala"],
      band_types: [],
      diameters_mm: [115, 125],
    },
  },
]

function extractDiamsFromOptions(optionValues: string[]): number[] {
  const nums = new Set<number>()
  for (const val of optionValues) {
    for (const seg of val.split(";")) {
      const n = parseInt(seg.trim(), 10)
      if (!isNaN(n) && n >= 50 && n <= 3000) {
        nums.add(n)
      }
    }
  }
  return [...nums].sort((a, b) => a - b)
}

function runTest(tc: TestCase): { passed: boolean; issues: string[] } {
  const issues: string[] = []

  const combinedText = [tc.title, tc.collection, tc.description, tc.option_values.join(" ")].join(" ")

  const foundBrand = matchAll(combinedText, BRAND_MATCHERS)[0] || null
  if (foundBrand !== tc.expected.brand) {
    issues.push(`brand mismatch: got ${JSON.stringify(foundBrand)}, expected ${JSON.stringify(tc.expected.brand)}`)
  }

  const foundMaterials = matchAll(combinedText, MATERIAL_MATCHERS)
  const expectedMatStr = tc.expected.materials.sort().join(",")
  const foundMatStr = foundMaterials.sort().join(",")
  if (foundMatStr !== expectedMatStr) {
    issues.push(`materials mismatch: got [${foundMatStr}], expected [${expectedMatStr}]`)
  }

  const foundBandTypes = matchAll(combinedText, BAND_TYPE_MATCHERS)
  const expectedBtStr = tc.expected.band_types.sort().join(",")
  const foundBtStr = foundBandTypes.sort().join(",")
  if (foundBtStr !== expectedBtStr) {
    issues.push(`band_types mismatch: got [${foundBtStr}], expected [${expectedBtStr}]`)
  }


  const foundDiams = extractDiamsFromOptions(tc.option_values)
  const expectedDiamStr = tc.expected.diameters_mm.sort((a, b) => a - b).join(",")
  const foundDiamStr = foundDiams.join(",")
  if (foundDiamStr !== expectedDiamStr) {
    issues.push(`diameters mismatch: got [${foundDiamStr}], expected [${expectedDiamStr}]`)
  }

  return {
    passed: issues.length === 0,
    issues,
  }
}

async function main() {
  console.log("Running vocab matcher tests on 5 sample products...\n")

  let passCount = 0
  const totalTests = TEST_CASES.length

  for (const tc of TEST_CASES) {
    const result = runTest(tc)
    const status = result.passed ? "PASS" : "FAIL"

    console.log(`[${status}] ${tc.handle}`)
    if (!result.passed) {
      for (const issue of result.issues) {
        console.log(`      - ${issue}`)
      }
    }

    if (result.passed) passCount++
  }

  console.log(`\n${passCount}/${totalTests} tests passed`)

  if (passCount === totalTests) {
    console.log("All tests passed!")
    process.exit(0)
  } else {
    console.log(`${totalTests - passCount} test(s) failed`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
