import { DiscLoader } from "@modules/@shared/components/disc-loader/DiscLoader"

export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
      <DiscLoader size={72} />
    </div>
  )
}
