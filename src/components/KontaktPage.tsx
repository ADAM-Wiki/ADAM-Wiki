import { useEffect, useState } from "react";
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
// No `outline-none`: it suppressed the global :focus-visible ring, leaving the
// border tint as the only indication of which field you are in.
const FIELD_CLASS =
  "w-full rounded-lg border bg-brand-surface px-4 py-3 text-base sm:text-sm text-brand-heading transition-colors placeholder:text-brand-dim focus:border-brand-accent";

/** A field in error carries the tint too, so the message is not the only cue. */
const fieldClass = (error?: string) =>
  `${FIELD_CLASS} ${error ? "border-brand-bible-fg" : "border-brand-border"}`;

function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={`${name}-greska`}
      className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-brand-bible-fg"
    >
      <AlertCircle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

type FieldName = "ime" | "email" | "poruka";

const FIELD_ORDER: FieldName[] = ["ime", "email", "poruka"];

/**
 * Serbian messages for the browser's own validity flags.
 *
 * The native bubble says what is wrong but not what to do, appears in the
 * browser's language rather than the page's, and vanishes on the next click.
 * These are rendered inline beside the field instead, and each one names the
 * fix rather than just the fault.
 */
function describeValidity(
  field: FieldName,
  input: HTMLInputElement | HTMLTextAreaElement,
): string {
  const { validity } = input;

  if (validity.valueMissing) {
    return field === "ime"
      ? "Unesite vaše ime."
      : field === "email"
        ? "Unesite email adresu da bismo mogli da odgovorimo."
        : "Napišite poruku pre slanja.";
  }

  if (validity.typeMismatch && field === "email") {
    return "Proverite adresu — nedostaje @ ili domen.";
  }

  return "Proverite ovo polje.";
}

export default function KontaktPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [dirty, setDirty] = useState(false);

  // A half-written message is worth a confirmation prompt; an untouched form or
  // one already sent is not.
  useEffect(() => {
    if (!dirty || status === "sent") return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Legacy assignment: Firefox still needs returnValue set to prompt.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, status]);

  /** Collects validity for every field and focuses the first that failed. */
  const validate = (form: HTMLFormElement): boolean => {
    const found: Partial<Record<FieldName, string>> = {};

    for (const name of FIELD_ORDER) {
      const input = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;

      if (input && !input.checkValidity()) {
        found[name] = describeValidity(name, input);
      }
    }

    setErrors(found);

    const firstBad = FIELD_ORDER.find((name) => found[name]);
    if (firstBad) {
      (form.elements.namedItem(firstBad) as HTMLElement | null)?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!validate(form)) return;

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
      setDirty(false);
      setErrors({});
      setStatus("sent");
    } catch {
      // Offline or blocked request: without this the button stayed on
      // "Slanje…" forever because setLoading(false) never ran.
      setStatus("error");
    }
  };

  /** Clears a field's error as soon as it becomes valid again. */
  const handleFieldInput = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setDirty(true);

    const input = event.currentTarget;
    const name = input.name as FieldName;
    if (!errors[name] || !input.checkValidity()) return;

    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const fieldProps = (name: FieldName) => ({
    name,
    id: name,
    onInput: handleFieldInput,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-greska` : undefined,
  });

  const sending = status === "sending";

  return (
    <div className="page-no-grid min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`Kontakt | ${SITE_NAME}`}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={`Kontakt | ${SITE_NAME}`} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/kontakt`} />
      </Helmet>

      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1} className="pt-24 pb-20">
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
              // The form is replaced wholesale on success, which is silent to a
              // screen reader; role="status" announces the outcome.
              <div
                role="status"
                className="rounded-lg border border-brand-border bg-brand-surface p-8 text-center"
              >
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
              // noValidate: the browser's own bubble stops at the first bad
              // field, speaks the browser's language rather than the page's,
              // and disappears on the next click. Validation still uses the
              // native constraints - only the reporting is ours.
              <form noValidate onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="ime"
                    className="mb-2 block text-xs uppercase tracking-widest text-brand-dim"
                  >
                    Ime
                  </label>
                  <input
                    required
                    {...fieldProps("ime")}
                    type="text"
                    autoComplete="name"
                    placeholder="Vaše ime"
                    className={fieldClass(errors.ime)}
                  />
                  <FieldError name="ime" message={errors.ime} />
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
                    {...fieldProps("email")}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    // An address is not prose; autocorrect on a phone mangles it.
                    spellCheck={false}
                    autoCapitalize="none"
                    placeholder="vasa@email.com"
                    className={fieldClass(errors.email)}
                  />
                  <FieldError name="email" message={errors.email} />
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
                    {...fieldProps("poruka")}
                    rows={6}
                    placeholder="Vaša poruka…"
                    className={`${fieldClass(errors.poruka)} resize-none`}
                  />
                  <FieldError name="poruka" message={errors.poruka} />
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
                      Slanje nije uspelo. Proverite internet konekciju i
                      pokušajte ponovo — ili nam pišite direktno preko YouTube
                      kanala.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-accent py-3.5 text-xs font-medium uppercase tracking-widest text-brand-on-accent transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send aria-hidden className="h-4 w-4 shrink-0" />
                  {sending ? "Slanje…" : "Pošalji poruku"}
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
