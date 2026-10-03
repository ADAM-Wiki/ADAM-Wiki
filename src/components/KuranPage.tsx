import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpenText,
  FileText,
  Gift,
  Mail,
  ShieldCheck,
  Truck,
} from "lucide-react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
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
  "Primerak Kur'ana na ćirilici na poklon — knjigu ne naplaćujemo, plaćate samo poštarinu. Javite nam se porukom na Facebooku ili emailom.";

const PROMISES = [
  {
    icon: Gift,
    title: "Knjiga je besplatna",
    body: "Primerak ne naplaćujemo. Jedini trošak je poštarina, koju plaćate pri preuzimanju pošiljke.",
  },
  {
    icon: Truck,
    title: "Šaljemo poštom",
    body: "Kada se dogovorimo oko adrese, pošiljku šaljemo poštom na vaše ime.",
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
    <div className="page-no-grid min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-on-accent">
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

      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1} className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <header className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
              Besplatna podela
            </span>
            <h1 className="mt-2 font-serif text-3xl font-medium leading-tight text-brand-heading sm:text-4xl">
              Kur&rsquo;an na ćirilici — besplatno
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-dim">
              Prevod značenja Kur&rsquo;ana na srpskom jeziku, štampan
              ćirilicom. Javite nam se porukom i dogovaramo slanje. Knjigu ne
              naplaćujemo — plaćate samo poštarinu.
            </p>
          </header>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-lg border border-brand-border bg-brand-surface p-5"
              >
                <Icon
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-brand-accent"
                />
                <h2 className="mt-3 text-sm font-medium text-brand-heading">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-dim">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-14">
            <div className="mb-6 flex items-center gap-3">
              <BookOpenText
                aria-hidden
                className="h-5 w-5 shrink-0 text-brand-accent"
              />
              <h2 className="font-serif text-xl text-brand-heading">
                Kako da dođete do primerka
              </h2>
            </div>

            {/* min-h-11 and full width below sm: these two links are the whole
                point of the page, so they are the easiest thing to hit on it. */}
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-11 flex-col rounded-lg border border-brand-border bg-brand-surface p-6 transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover"
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
                  Pišite nam na stranicu Asocijacija Adam — najbrži način da se
                  javite.
                </span>
              </a>

              <a
                href={mailto}
                className="group flex min-h-11 flex-col rounded-lg border border-brand-border bg-brand-surface p-6 transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover"
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
                Te podatke koristimo samo da vam pošaljemo primerak. Ne unosimo
                ih na sajt i ne prosleđujemo ih nikome.
              </p>
            </div>
          </section>

          {/* Waiting for the post is the one cost of a free book, and for a
              reader who simply wants to start there is no reason to impose it. */}
          <section className="mt-10">
            <a
              href={SCRIBD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-11 flex-col rounded-lg border border-brand-border bg-brand-surface p-6 transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover"
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
                Isti prevod dostupan je i za čitanje u pretraživaču, dok čekate
                pošiljku. Otvara se na Scribd-u, u novoj kartici.
              </span>
            </a>
          </section>

          <div className="mt-12 border-t border-brand-border pt-8 text-center">
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
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
