"use client"

import Image from 'next/image'
import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'
import { TrustBanner } from '@modules/@shared/components/trust-banner'

interface SiteFooterProps {
  countryCode?: string
  categoriesHref?: string
}

export function SiteFooter({ countryCode = "ro", categoriesHref }: SiteFooterProps) {
  const allHref = categoriesHref ?? `/produse`
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="brand-col">
          <a className="logo" href="/"><Image src="/logo-white.png" alt="ardmag" className="logo-img" width={1367} height={208} loading="lazy" sizes="200px" /><div className="tag">25 de ani pe piatra</div></a>
          <p>Distribuitor autorizat Tenax, Sait, Woosuk. Scule profesionale pentru prelucrarea pietrei naturale, marmură și granit.</p>
          <div className="contact"><div className="phone">Tel. <strong>+40 722 155 441</strong></div><div>office@arcromdiamonds.ro</div><div>Calea Baciului 1-3 · Cluj-Napoca</div></div>
        </div>
        <div><h3>Magazin</h3><ul><li><a href={allHref}>Toate categoriile</a></li><li><a href="/promotii">Promoții</a></li></ul></div>
        <div><h3>Cont &amp; comenzi</h3><ul><li><a href="/account">Contul meu</a></li><li><a href="/account/orders">Comenzi &amp; facturi</a></li></ul></div>
        <div><h3>Info</h3><ul><li><a href={`/despre-noi`}>Despre noi</a></li><li><a href={`/livrare-si-plata`}>Livrare &amp; plată</a></li><li><a href={`/contact`}>Contact</a></li></ul></div>
        <div className="news-col">
          <h3>Newsletter</h3>
          <p>Promoții, stocuri noi, ghiduri tehnice. Maxim 2 emailuri pe lună.</p>
          <form className="news-form" onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="email@firma.ro" aria-label="email" suppressHydrationWarning /><button type="submit">Abonează-mă</button></form>
          <label className="news-consent"><input type="checkbox" defaultChecked /><span>Sunt de acord cu <a href={`/confidentialitate`} style={{ color: 'var(--stone-300)', textDecoration: 'underline' }}>prelucrarea datelor</a> pentru comunicări comerciale.</span></label>
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
