import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { ProfileEditSection } from "@modules/account/components/ProfileEditSection"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Profilul meu",
  description: "Vizualizeaza si editeaza datele contului tau.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()

  if (!customer) {
    redirect(`/account`)
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--f-sans)",
          fontWeight: 600,
          fontSize: 20,
          marginBottom: 24,
        }}
      >
        Profilul meu
      </h2>

      <ProfileEditSection
        label="Prenume"
        currentValue={customer.first_name ?? ""}
        fieldName="first_name"
      />
      <ProfileEditSection
        label="Nume"
        currentValue={customer.last_name ?? ""}
        fieldName="last_name"
      />
      {/* Email is read-only -- StoreUpdateCustomer does not expose an email field */}
      <div className="panel" style={{ marginBottom: 12 }}>
        <div
          className="panel-head"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <span style={{ fontFamily: "var(--f-sans)", fontWeight: 500, fontSize: 14 }}>
            Email
          </span>
        </div>
        <div className="panel-body" style={{ padding: "16px 20px" }}>
          <div style={{ fontFamily: "var(--f-sans)", color: "var(--fg)", fontSize: 14 }}>
            {customer.email}
          </div>
        </div>
      </div>
      <ProfileEditSection
        label="Telefon"
        currentValue={customer.phone ?? ""}
        fieldName="phone"
        type="tel"
      />

      {/* DESIGN PENDING: sectiune schimbare parola -- necesita flux cu verificare parola curenta */}
    </div>
  )
}
