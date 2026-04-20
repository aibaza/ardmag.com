import { getBaseURL } from "@lib/util/env"

export function OrganizationJsonLd() {
  const baseUrl = getBaseURL()
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Arcrom Diamonds / ARDMAG",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+40-722-155-441",
      contactType: "customer service",
      email: "office@arcromdiamonds.ro",
      availableLanguage: ["Romanian"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calea Baciului 1-3",
      addressLocality: "Cluj-Napoca",
      postalCode: "400230",
      addressCountry: "RO",
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteJsonLd() {
  const baseUrl = getBaseURL()
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ARDMAG",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/ro/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbListJsonLd({ items, current }: { items: { label: string; href?: string }[]; current: string }) {
  const baseUrl = getBaseURL()
  const allItems = [...items, { label: current }]
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...((item as any).href ? { item: `${baseUrl}${(item as any).href}` } : {}),
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  brand,
  price,
  currency = "RON",
  inStock = true,
  url,
}: {
  name: string
  description?: string
  image?: string
  sku?: string
  brand?: string
  price?: number
  currency?: string
  inStock?: boolean
  url: string
}) {
  const baseUrl = getBaseURL()
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description && { description }),
    ...(image && { image }),
    ...(sku && { sku }),
    ...(brand && { brand: { "@type": "Brand", name: brand } }),
    offers: {
      "@type": "Offer",
      ...(price != null && { price: (price / 100).toFixed(2), priceCurrency: currency }),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `${baseUrl}${url}`,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
