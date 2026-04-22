export function generateStaticParams() {
  return [{ countryCode: "ro" }]
}

export default function PageLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>
}
