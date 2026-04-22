import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404",
  description: "A apărut o eroare",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-semibold text-slate-800">Pagina nu a fost găsită</h1>
      <p className="text-sm text-slate-600">
        Pagina pe care ai încercat să o accesezi nu există.
      </p>
      <Link
        className="flex gap-x-1 items-center group text-sm text-blue-600 hover:text-blue-700"
        href="/"
      >
        Înapoi la pagina principală
        <svg
          className="w-3.5 h-3.5 group-hover:rotate-45 ease-in-out duration-150"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M3 13L13 3M13 3H7M13 3v6" />
        </svg>
      </Link>
    </div>
  )
}
