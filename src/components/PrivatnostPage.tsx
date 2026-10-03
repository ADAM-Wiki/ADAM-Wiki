import { Link } from "react-router-dom";
import LegalPage from "./LegalPage";

const LINK_CLASS =
  "text-brand-accent underline decoration-brand-accent/40 underline-offset-4 transition-colors hover:decoration-brand-accent";

export default function PrivatnostPage() {
  return (
    <LegalPage
      title="Politika Privatnosti"
      description="Koje podatke ovaj sajt prikuplja, gde odlaze i šta ostaje na vašem uređaju."
      path="/privatnost"
      sections={[
        {
          title: "Prikupljanje podataka",
          body: "Ova stranica ne prikuplja lične podatke automatski. Nema registracije, korisničkih naloga ni profila posetilaca.",
        },
        {
          title: "Kontakt forma",
          body: (
            <>
              Jedini podaci koje nam šaljete su oni koje sami unesete u{" "}
              <Link to="/kontakt" className={LINK_CLASS}>
                kontakt formu
              </Link>{" "}
              — ime, email adresa i tekst poruke. Formu obrađuje servis
              Formspree, koji nam poruku prosleđuje na email. Te podatke
              koristimo isključivo da bismo vam odgovorili.
            </>
          ),
        },
        {
          title: "Kolačići i lokalno skladište",
          body: (
            <>
              Ne postavljamo sopstvene kolačiće. Vaš pretraživač lokalno pamti
              izabranu temu i nedavne pretrage, i ti podaci ostaju na vašem
              uređaju. Detaljnije u{" "}
              <Link to="/kolacici" className={LINK_CLASS}>
                Politici kolačića
              </Link>
              .
            </>
          ),
        },
        {
          title: "Analitika",
          body: "Trenutno ne koristimo nikakve analitičke alate. Ako se to promeni, koristili bismo isključivo anonimne podatke, i to u svrhu poboljšanja sadržaja.",
        },
        {
          title: "Pitanja o privatnosti",
          body: (
            <>
              Za sva pitanja vezana za privatnost,{" "}
              <Link to="/kontakt" className={LINK_CLASS}>
                kontaktirajte nas
              </Link>
              .
            </>
          ),
        },
      ]}
    />
  );
}
