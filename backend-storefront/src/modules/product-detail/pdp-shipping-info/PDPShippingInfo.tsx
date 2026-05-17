import { TruckIcon, ReturnIcon, SecureIcon, SupportIcon } from '@modules/@shared/icons/TrustIcons'

const ITEMS = [
  {
    icon: <TruckIcon fill="none" strokeLinecap="round" />,
    title: "Livrare 24-48h în toată țara",
    desc: "Transport prin Fan Courier. Comenzile plasate până la ora 14:00 in zilele lucratoare se expediaza in aceeasi zi din depozitul Cluj-Napoca.",
  },
  {
    icon: <SecureIcon fill="none" strokeLinecap="round" />,
    title: "Livrare gratuită peste 500 Lei",
    desc: "Transport gratuit pentru comenzile cu valoare de peste 500 Lei. Sub acest prag, costul este calculat automat la checkout in functie de greutate si destinatie.",
  },
  {
    icon: <ReturnIcon fill="none" strokeLinecap="round" />,
    title: "14 zile retur",
    desc: "Drept legal de retur in 14 zile de la primirea coletului, fara intrebari. Produsul trebuie sa fie in starea originala, nefolosit.",
  },
  {
    icon: <SupportIcon fill="none" strokeLinecap="round" />,
    title: "Suport tehnic L-V 08-16",
    desc: "Pentru intrebari despre alegerea sculei sau compatibilitate, contactati-ne la +40 722 155 441 sau office@arcromdiamonds.ro.",
  },
]

export function PDPShippingInfo() {
  return (
    <div className="pdp-shipping-info">
      {ITEMS.map((item, i) => (
        <div key={i} className="row">
          <div className="icon" aria-hidden="true">{item.icon}</div>
          <div className="text">
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
