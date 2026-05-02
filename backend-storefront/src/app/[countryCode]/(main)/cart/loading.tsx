import { OrbitalLoader } from "@modules/@shared/components/disc-loader/OrbitalLoader"

export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
      <OrbitalLoader size={72} />
    </div>
  )
}
