import LegalPage from "./LegalPage";

export default function UsloviPage() {
  return (
    <LegalPage
      title="Uslovi Korišćenja"
      description="Pod kojim uslovima možete koristiti i deliti sadržaj sa ovog sajta."
      path="/uslovi"
      sections={[
        {
          title: "Upotreba sadržaja",
          body: "Sav sadržaj na ovoj stranici je namijenjen isključivo u informativne i edukativne svrhe. Dozvoljeno je kopiranje i redistribucija bez navođenja izvora.",
        },
        {
          title: "Odgovornost",
          body: "Trudimo se da svi podaci budu tačni i provereni. Čitaoci se pozivaju da sami provere navedene izvore.",
        },
        {
          title: "Izmene",
          body: "Zadržavamo pravo izmene ovih uslova u bilo kom trenutku. Nastavak korištenja sajta podrazumeva prihvatanje izmenjenih uslova.",
        },
      ]}
    />
  );
}
