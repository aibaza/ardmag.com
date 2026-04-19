import { Metadata } from "next"
import { AuthForm } from "@modules/account/components/AuthForm"

export const metadata: Metadata = {
  title: "Autentificare | ardmag.com",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function LoginPage({ params }: Props) {
  const { countryCode } = await params

  return (
    <div style={{ maxWidth: 480, margin: '48px auto', padding: '0 24px' }}>
      <AuthForm countryCode={countryCode} />
    </div>
  )
}
