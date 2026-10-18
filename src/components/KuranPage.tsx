import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  FileText,
  Gift,
  Mail,
  ShieldCheck,
  Truck,
} from "lucide-react";

import PageShell from "./PageShell";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import { KURAN_PATH } from "../utils/kuranPromo";

const FACEBOOK_URL = "https://www.facebook.com/asocijacijaadam";

/** The same translation, readable in the browser while the post is on its way. */
const SCRIBD_URL =
  "https://www.scribd.com/document/694745386/Kur-an-na-srpskom-jeziku";

/** Where the requests land. Published here on purpose, so change with care. */
const CONTACT_EMAIL = "adammonoteizam@gmail.com";

/** Not in lucide, so the mark is an inline path - same source as ArticleShare. */
const FACEBOOK_ICON =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";

const DESCRIPTION =
  "Primerak Kur'ana na ćirilici na poklon — knjigu ne naplaćujemo. Iznos poštarine i mogućnost slanja potvrđujemo nakon što nam se javite.";

const PROMISES = [
  {
    icon: Gift,
    title: "Knjiga je besplatna",
    body: "Primerak ne naplaćujemo. Jedini trošak je poštarina, koju plaćate pri preuzimanju pošiljke.",
  },
  {
    icon: Truck,
    title: "Šaljemo poštom",
    body: "Kada nam se javite, potvrđujemo da li možemo da pošaljemo na vašu adresu i koliki je iznos poštarine.",
  },
  {
    icon: ShieldCheck,
    title: "Bez formulara",
    body: "Adresu ne tražimo preko sajta i nigde je ne čuvamo — dogovor ide direktno porukom.",
  },
];

/**
 * Landing page for the free Cyrillic Qur'an.
 *
 * There is deliberately no form here. Collecting postal addresses would mean
 * routing them through a third-party form service and storing them there, and
 * for a giveaway run by hand that is more exposure of other people's data than
 * the convenience is worth. A message on Facebook or by email reaches the same
 * inbox and leaves nothing on this site.
 */
export default function KuranPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Besplatan Kur'an na ćirilici",
  )}&body=${encodeURIComponent(
    "Ime i prezime:\nAdresa i broj:\nGrad i poštanski broj:\nTelefon:\n",
  )}`;

  return (
    <PageShell>
      <Helmet>
        <title>{`Besplatan Kur'an na ćirilici | ${SITE_NAME}`}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          property="og:title"
          content={`Besplatan Kur'an na ćirilici | ${SITE_NAME}`}
        />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${KURAN_PATH}`} />
      </Helmet>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <header className="max-w-2xl">
              <div className="page-rise mb-4">
                <h1 className="text-3xl font-serif font-medium text-brand-heading">
                  Kur&rsquo;an na ćirilici — besplatno
                </h1>
              </div>
              <p className="page-rise mb-8 max-w-2xl text-sm leading-relaxed text-brand-dim">
                Prevod značenja Kur&rsquo;ana na srpskom jeziku, štampan
                ćirilicom. Javite nam se da proverimo slanje na vašu adresu i
                potvrdimo iznos poštarine. Knjigu ne naplaćujemo; poštarinu
                plaćate pri preuzimanju.
              </p>
            </header>

            <div className="page-rise mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {PROMISES.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-xl border border-brand-border bg-brand-surface/80 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-brand-border bg-brand-bg/60 text-brand-dim">
                      <Icon aria-hidden className="h-4 w-4 shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xs font-medium uppercase tracking-widest text-brand-heading">
                        {title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-brand-dim">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-16 border-t border-brand-border pt-8">
              <h2 className="mb-6 font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                Kako da dođete do primerka
              </h2>

              {/* min-h-11 and full width below sm: these two links are the whole
                point of the page, so they are the easiest thing to hit on it. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-11 flex-col rounded-xl border border-brand-border bg-brand-surface/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border-strong hover:bg-brand-surface-hover"
                >
                  <span className="flex items-center gap-2.5">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 shrink-0 text-brand-accent"
                    >
                      <path d={FACEBOOK_ICON} />
                    </svg>
                    <span className="font-medium text-brand-heading">
                      Poruka na Facebooku
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="ml-auto h-4 w-4 shrink-0 text-brand-border-strong transition-colors group-hover:text-brand-accent"
                    />
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-brand-dim">
                    Pišite nam na stranicu Asocijacija Adam — najbrži način da
                    se javite.
                  </span>
                </a>

                <a
                  href={mailto}
                  className="group flex min-h-11 flex-col rounded-xl border border-brand-border bg-brand-surface/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border-strong hover:bg-brand-surface-hover"
                >
                  <span className="flex items-center gap-2.5">
                    <Mail
                      aria-hidden
                      className="h-5 w-5 shrink-0 text-brand-accent"
                    />
                    <span className="font-medium text-brand-heading">
                      Pošaljite email
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="ml-auto h-4 w-4 shrink-0 text-brand-border-strong transition-colors group-hover:text-brand-accent"
                    />
                  </span>
                  <span className="mt-3 break-words text-sm leading-relaxed text-brand-dim">
                    {CONTACT_EMAIL}
                  </span>
                </a>
              </div>

              <div className="mt-6 rounded-lg border border-dashed border-brand-border p-5">
                <h3 className="text-sm font-medium text-brand-heading">
                  Šta da napišete u poruci
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-brand-dim">
                  <li>Ime i prezime primaoca</li>
                  <li>Adresu i broj, grad i poštanski broj</li>
                  <li>Broj telefona — kurir ga traži pri isporuci</li>
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-brand-dim">
                  Te podatke koristimo samo da vam pošaljemo primerak. Ne
                  unosimo ih na sajt i ne prosleđujemo ih nikome.
                </p>
              </div>
            </section>

            {/* Waiting for the post is the one cost of a free book, and for a
              reader who simply wants to start there is no reason to impose it. */}
            <section className="mt-10 max-w-2xl">
              <a
                href={SCRIBD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-11 flex-col rounded-xl border border-brand-border bg-brand-surface/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border-strong hover:bg-brand-surface-hover"
              >
                <span className="flex items-center gap-2.5">
                  <FileText
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-brand-accent"
                  />
                  <span className="font-medium text-brand-heading">
                    Ili čitajte odmah, na internetu
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="ml-auto h-4 w-4 shrink-0 text-brand-border-strong transition-colors group-hover:text-brand-accent"
                  />
                </span>
                <span className="mt-3 text-sm leading-relaxed text-brand-dim">
                  Isti prevod dostupan je i za čitanje u pretraživaču, dok
                  čekate pošiljku. Otvara se na Scribd-u, u novoj kartici.
                </span>
              </a>
            </section>

            <div className="mt-16 border-t border-brand-border pt-8">
              <p className="text-sm leading-relaxed text-brand-dim">
                Zanima vas kako je Kur&rsquo;anski tekst sačuvan?{" "}
                <Link
                  to="/categories/kuran"
                  className="text-brand-accent underline decoration-brand-accent/40 underline-offset-4 transition-colors hover:decoration-brand-accent"
                >
                  Pročitajte članke o očuvanju Kur&rsquo;ana
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
    </PageShell>
  );
}
