import { SimpleLoader } from "@modules/@shared/components/disc-loader/SimpleLoader"

export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
      <SimpleLoader size={72} />
    </div>
  )
}
