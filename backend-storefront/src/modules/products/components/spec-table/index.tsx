interface SpecRow {
  label: string
  value: string
}

interface SpecTableProps {
  rows: SpecRow[]
  title?: string
}

export default function SpecTable({ rows, title }: SpecTableProps) {
  return (
    <div className="overflow-x-auto rounded-[var(--r-sm)] border border-stone-200">
      {title && (
        <div className="px-[10px] py-2 border-b border-stone-200 bg-stone-50">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-stone-500">
            {title}
          </span>
        </div>
      )}
      <table className="w-full border-collapse text-[12px]">
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}
              style={i > 0 ? { borderTop: "1px solid var(--rule)" } : undefined}
            >
              <td
                className="font-mono text-[10px] uppercase tracking-[0.06em] font-medium text-stone-500 py-[7px] px-[10px]"
                style={{ width: "40%" }}
              >
                {row.label}
              </td>
              <td className="font-mono text-[12px] text-stone-900 py-[7px] px-[10px]">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
