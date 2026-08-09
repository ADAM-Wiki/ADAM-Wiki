import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Check, AlertCircle, Youtube, Send } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";

const FORM_ENDPOINT = "https://formspree.io/f/mgoqvalo";

const DESCRIPTION =
  "Pišite nam — za pitanja, predloge, ispravke ili saradnju na Adam-Wiki projektu.";

type Status = "idle" | "sending" | "sent" | "error";

// text-base below sm: iOS Safari zooms the whole page in when a focused field
// is under 16px, and leaves it zoomed after the keyboard closes.
const FIELD_CLASS =
  "w-full rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-base sm:text-sm text-brand-heading outline-none transition-colors placeholder:text-brand-dim focus:border-brand-accent";

export default function KontaktPage() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        // Previously a rejected submission left the form silently unchanged.
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      // Offline or blocked request: without this the button stayed on
      // "Slanje..." forever because setLoading(false) never ran.
      setStatus("error");
    }
  };

  const sending = status === "sending";

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`Kontakt | ${SITE_NAME}`}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={`Kontakt | ${SITE_NAME}`} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/kontakt`} />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-xl px-6">
          <header className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
              KONTAKT
            </span>
            <h1 className="mt-2 font-serif text-3xl font-medium text-brand-heading">
              Pišite nam
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-dim">
              Za pitanja, predloge, ispravke u tekstovima ili saradnju.
              Odgovaramo na svaku poruku.
            </p>
          </header>

          <div className="mt-12">
            {status === "sent" ? (
              <div className="rounded-lg border border-brand-border bg-brand-surface p-8 text-center">
                <Check
                  aria-hidden
                  className="mx-auto h-8 w-8 text-brand-accent"
                />
                <h2 className="mt-4 font-serif text-xl text-brand-heading">
                  Poruka poslata
                </h2>
                <p className="mt-2 text-sm text-brand-dim">
                  Odgovorićemo vam u najkraćem mogućem roku.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="rounded-lg border border-brand-border px-4 py-2 text-xs font-medium uppercase tracking-widest text-brand-dim transition-colors hover:border-brand-border-strong hover:text-brand-heading"
                  >
                    Pošalji još jednu
                  </button>
                  <Link
                    to="/"
                    className="rounded-lg border border-brand-border px-4 py-2 text-xs font-medium uppercase tracking-widest text-brand-dim transition-colors hover:border-brand-border-strong hover:text-brand-heading"
                  >
                    Nazad na početnu
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                <div>
                  <label
                    htmlFor="ime"
                    className="mb-2 block text-xs uppercase tracking-widest text-brand-dim"
                  >
                    Ime
                  </label>
                  <input
                    required
                    id="ime"
                    name="ime"
                    type="text"
                    autoComplete="name"
                    placeholder="Vaše ime"
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs uppercase tracking-widest text-brand-dim"
                  >
                    Email
                  </label>
                  <input
                    required
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vasa@email.com"
                    className={FIELD_CLASS}
                  />
                </div>

                <div>
                  <label
                    htmlFor="poruka"
                    className="mb-2 block text-xs uppercase tracking-widest text-brand-dim"
                  >
                    Poruka
                  </label>
                  <textarea
                    required
                    id="poruka"
                    name="poruka"
                    rows={6}
                    placeholder="Vaša poruka..."
                    className={`${FIELD_CLASS} resize-none`}
                  />
                </div>

                {/* Formspree honeypot: bots fill it, people never see it. */}
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="hidden"
                />

                {status === "error" && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-brand-bible-fg/40 bg-brand-surface p-4"
                  >
                    <AlertCircle
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-bible-fg"
                    />
                    <p className="text-sm leading-relaxed text-brand-text">
                      Slanje nije uspelo. Proverite internet konekciju i pokušajte
                      ponovo — ili nam pišite direktno preko YouTube kanala.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-accent py-3.5 text-xs font-medium uppercase tracking-widest text-brand-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send aria-hidden className="h-4 w-4 shrink-0" />
                  {sending ? "Slanje..." : "Pošalji poruku"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-10 border-t border-brand-border pt-8 text-center">
            <p className="text-xs uppercase tracking-widest text-brand-dim">
              Ili nas pronađite ovde
            </p>
            <a
              href="https://www.youtube.com/@asocijacija-adam"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-brand-dim transition-colors hover:text-brand-accent"
            >
              <Youtube aria-hidden className="h-4 w-4 shrink-0" />
              YouTube kanal
            </a>
          </div>
        </div>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
