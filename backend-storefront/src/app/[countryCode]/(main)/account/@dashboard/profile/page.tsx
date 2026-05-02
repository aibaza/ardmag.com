import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { redirect } from "next/navigation"
import { NameRow } from "@modules/account/components/NameRow"
import { ProfileEditSection } from "@modules/account/components/ProfileEditSection"

export const metadata: Metadata = {
  title: "Profilul meu",
  description: "Vizualizeaza si editeaza datele contului tau.",
}

export default async function ProfilePage({ params }: { params: Promise<{ countryCode: string }> }) {
  await params
  const customer = await retrieveCustomer()
  if (!customer) redirect(`/account`)

  return (
    <div>
      <h2 style={{ fontFamily: "var(--f-sans)", fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
        Profilul meu
      </h2>

      <div className="panel">
        <NameRow firstName={customer.first_name ?? ""} lastName={customer.last_name ?? ""} />

        {/* Email -- StoreUpdateCustomer nu expune campul email; schimbarea necesita flux separat de verificare */}
        <div data-testid="profile-row-email" style={{ borderTop: "1px solid var(--rule)", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div className="field" style={{ flex: 1, minWidth: 0 }}>
              <label>Email</label>
              <div style={{ fontSize: 14, color: "var(--fg)", paddingTop: 2 }}>{customer.email}</div>
            </div>
            <span
              className="badge"
              style={{
                background: "var(--stone-100)",
                color: "var(--stone-600)",
                border: "1px solid var(--rule)",
                flexShrink: 0,
              }}
            >
              citire-doar
            </span>
          </div>
        </div>

        <ProfileEditSection
          label="Telefon"
          currentValue={customer.phone ?? ""}
          fieldName="phone"
          type="tel"
        />
      </div>

      {/* DESIGN PENDING: sectiune schimbare parola -- necesita flux cu verificare parola curenta */}
    </div>
  )
}
