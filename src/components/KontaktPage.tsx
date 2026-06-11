import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME } from "../utils/siteConfig";

export default function KontaktPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const form = e.currentTarget;
  const data = new FormData(form);

  const res = await fetch("https://formspree.io/f/mgoqvalo", { // ← paste your ID
    method: "POST",
    body: data,
    headers: { Accept: "application/json" },
  });

  setLoading(false);
  if (res.ok) {
    setSent(true);
    form.reset();
  }
};

  return (
    <div className="min-h-screen bg-brand-bg">
      <Helmet>
        <title>Kontakt | {SITE_NAME}</title>
      </Helmet>
      <Navbar onSearch={() => {}} />
      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-mono text-brand-dim">KONTAKT</span>
              <h1 className="text-3xl font-serif font-medium">Pišite nam</h1>
            </div>

            {sent ? (
              <div className="border border-white/10 rounded-lg p-8 text-center">
                <div className="text-3xl mb-4">✓</div>
                <h2 className="text-white font-medium mb-2">Poruka poslana</h2>
                <p className="text-brand-dim text-sm">Odgovorićemo vam u najkraćem mogućem roku.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-dim mb-2">Ime</label>
                  <input
                    required
                    type="text"
                    name="ime"
                    placeholder="Vase ime"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-brand-dim outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-dim mb-2">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="vasa@email.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-brand-dim outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-dim mb-2">Poruka</label>
                  <textarea
                    required
                    rows={5}
                    name="poruka"
                    placeholder="Vasa poruka..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-brand-dim outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white text-sm rounded-lg hover:bg-white/10 hover:border-white/30 transition-colors disabled:opacity-50"
                >
                  {loading ? "Slanje..." : "Pošalji poruku"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}