import { Link } from "react-router-dom";
import LegalPage from "./LegalPage";

export default function KolaciciPage() {
  return (
    <LegalPage
      title="Politika Kolačića"
      description="Šta ovaj sajt čuva na vašem uređaju i kako to možete obrisati."
      path="/kolacici"
      sections={[
        {
          title: "Šta su kolačići?",
          body: "Kolačići su male tekstualne datoteke koje web stranice pohranjuju na vašem uređaju kako bi zapamtile određene informacije o vašoj poseti.",
        },
        {
          title: "Da li ovaj sajt koristi kolačiće?",
          body: "Ne. Ovaj sajt ne postavlja sopstvene kolačiće — ni funkcionalne, ni analitičke, ni reklamne. Umesto njih koristimo lokalno skladište pretraživača, opisano u nastavku.",
        },
        {
          title: "Lokalno skladište",
          body: "Lokalno skladište (localStorage) čuva tri stvari, i to isključivo na vašem uređaju: izabranu temu — svetlu ili tamnu — vaše nedavne pretrage, i podatak da ste zatvorili obaveštenje o besplatnom Kur’anu, kako vam se ne bi ponovo prikazivalo. Ti podaci se ne šalju nigde, nisu vezani za vaš identitet i ne koriste se za praćenje.",
        },
        {
          title: "Upravljanje podacima",
          body: (
            <>
              Nedavne pretrage možete obrisati u svakom trenutku dugmetom
              „Obriši istoriju“ na{" "}
              <Link
                to="/search"
                className="text-brand-accent underline decoration-brand-accent/40 underline-offset-4 transition-colors hover:decoration-brand-accent"
              >
                stranici za pretragu
              </Link>
              . Sve ostalo brišete čišćenjem podataka sajta u postavkama vašeg
              pretraživača — time se vraća i podrazumevana tema.
            </>
          ),
        },
      ]}
    />
  );
}
