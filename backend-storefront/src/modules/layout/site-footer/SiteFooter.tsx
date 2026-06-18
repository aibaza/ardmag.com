"use client"

import Image from 'next/image'
import { useTransition, useRef, useState } from 'react'
import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustBanner } from '@modules/@shared/components/trust-banner'

interface SiteFooterProps {
  countryCode?: string
  categoriesHref?: string
}

function NewsletterForm({ privacyHref }: { privacyHref: string }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = inputRef.current?.value?.trim()
    if (!email) return

    startTransition(async () => {
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (data.ok) {
          if (data.status === "already_confirmed") {
            setMessage("Ești deja abonat.")
          } else {
            setMessage("Verifică-ți inboxul pentru confirmare.")
            if (inputRef.current) inputRef.current.value = ""
          }
        } else {
          setMessage("A apărut o eroare. Încearcă din nou.")
        }
      } catch {
        setMessage("A apărut o eroare. Încearcă din nou.")
      }
    })
  }

  if (message) {
    return <p style={{ color: 'var(--stone-300)', fontSize: 14, margin: '8px 0 0' }}>{message}</p>
  }

  return (
    <>
      <form className="news-form" onSubmit={handleSubmit}>
        <input ref={inputRef} type="email" placeholder="email@firma.ro" aria-label="email" required disabled={isPending} suppressHydrationWarning />
        <button type="submit" disabled={isPending}>{isPending ? "..." : "Abonează-mă"}</button>
      </form>
      <label className="news-consent">
        <input type="checkbox" defaultChecked />
        <span>Sunt de acord cu <a href={privacyHref} style={{ color: 'var(--stone-300)', textDecoration: 'underline' }}>prelucrarea datelor</a> pentru comunicări comerciale.</span>
      </label>
    </>
  )
}

export function SiteFooter({ countryCode = "ro", categoriesHref }: SiteFooterProps) {
  const allHref = categoriesHref ?? `/produse`
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="brand-col">
          <a className="logo" href="/"><Image src="/logo-white.png" alt="ardmag" className="logo-img" width={1367} height={208} loading="lazy" sizes="200px" /><div className="tag">Experți în piatră de peste 25 de ani</div></a>
          <p>ARDmag.ro este magazinul online al <strong>Arc Rom Diamonds</strong>, cel mai mare distribuitor Tenax din România, pe piață din 2001. Scule profesionale pentru prelucrarea pietrei naturale, marmură și granit.</p>
          <div className="contact"><div className="phone">Tel. <strong>+40 722 155 441</strong></div><div>office@ardmag.ro</div><div>Calea Baciului 1-3 · Cluj-Napoca</div></div>
        </div>
        <div><h3>Magazin</h3><ul><li><a href={allHref}>Toate produsele</a></li><li><a href="/promotii">Promoții</a></li></ul></div>
        <div><h3>Cont &amp; comenzi</h3><ul><li><a href="/account">Contul meu</a></li><li><a href="/account/orders">Comenzi &amp; facturi</a></li></ul></div>
        <div><h3>Info</h3><ul><li><a href={`/despre-noi`}>Despre noi</a></li><li><a href={`/livrare-si-plata`}>Livrare &amp; plată</a></li><li><a href={`/contact`}>Contact</a></li><li><a href="/blog">Blog</a></li></ul></div>
        <div className="news-col">
          <h3>Newsletter</h3>
          <p>Promoții, stocuri noi, ghiduri tehnice. Maxim 2 emailuri pe lună.</p>
          <NewsletterForm privacyHref={`/confidentialitate`} />
        </div>
      </div>
      <div className="footer-mid">
        <TrustBanner variant="strip" items={[
          { icon: <ReturnIcon />, title: "14 zile retur", subtitle: "fără întrebări" },
          { icon: <TruckIcon />, title: "Livrare 24-48h", subtitle: "țara întreagă" },
          { icon: <SecureIcon />, title: "Plată securizată", subtitle: "3DSecure · SSL" },
          { icon: <SupportIcon />, title: "Suport tehnic", subtitle: "L–V 08–16 · RO" },
        ]} />
        <div className="pay-strip"><span className="pay-chip">Visa</span><span className="pay-chip">Mastercard</span><span className="pay-chip">Netopia</span><span className="pay-chip">Ramburs</span><span className="pay-chip">OP B2B</span></div>
      </div>
      <div className="footer-bot"><div className="wrap"><div className="legal"><a href={`/termeni`}>Termeni &amp; condiții</a><a href={`/confidentialitate`}>Politică confidențialitate</a><a href={`/cookie-policy`}>Politică cookies</a><a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">ANPC</a><a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">Soluționare litigii</a></div><span className="cr">© 2001–2026 Arcrom Diamonds SRL</span></div></div>
    </footer>
  )
}
