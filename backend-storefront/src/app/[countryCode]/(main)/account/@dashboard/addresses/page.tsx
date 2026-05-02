import { retrieveCustomer } from "@lib/data/customer"
import { AddressCard } from "@modules/account/components/AddressCard"
import { AddAddressForm } from "@modules/account/components/AddAddressForm"
import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function AddressesPage({ params }: Props) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()

  if (!customer) redirect(`/account`)

  const addresses = customer.addresses ?? []

  return (
    <div>
      <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
        Adresele mele
      </h2>
      <p style={{ fontFamily: "var(--f-sans)", fontSize: 13, color: "var(--fg-muted)", marginBottom: 24 }}>
        Adresele salvate aici se completeaza automat la checkout.
      </p>

      <AddAddressForm countryCode={countryCode} isFirstAddress={addresses.length === 0} />

      {addresses.length === 0 ? (
        <p style={{ color: "var(--fg-muted)", fontFamily: "var(--f-sans)" }}>
          Nu ai adrese salvate inca.
        </p>
      ) : (
        <div>
          {addresses.map((addr, i) => (
            <AddressCard key={addr.id} address={addr} index={i} countryCode={countryCode} />
          ))}
        </div>
      )}
    </div>
  )
}
