import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Info, Quote, Link as LinkIcon, TriangleAlert } from "lucide-react";
import { hadisArticles } from "../utils/articlesData";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import BackToTop from "./BackToTop";

// ─── Constants ────────────────────────────────────────────────────────────────

const WORDS_PER_MINUTE = 200;

// ─── Utilities ────────────────────────────────────────────────────────────────

const calculateWordCount = (content: string[]): number =>
  content.reduce((count, p) => count + p.trim().split(/\s+/).length, 0);

const calculateReadingTime = (wordCount: number): string =>
  `${Math.ceil(wordCount / WORDS_PER_MINUTE)} min čitanja`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("sr-Latn-RS", options).format(date);
};

const truncateDescription = (text: string, maxLength = 155): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
};

const getRelatedArticles = (currentSlug: string, currentTags: string[] = []) => {
  return hadisArticles
    .filter(a => a.slug !== currentSlug)
    .map(a => ({
      ...a,
      matchCount: a.tags?.filter(t => currentTags.includes(t)).length ?? 0,
    }))
    .filter(a => a.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3);
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HadisArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // ✅ All hooks at the top — before any early return
  const [lightboxData, setLightboxData] = useState<{ url: string; caption: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const article = hadisArticles.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // ── Not found ──
  if (!article) {
    return (
      <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
        <Helmet>
          <title>Članak nije pronađen | {SITE_NAME}</title>
          <meta name="description" content="Traženi članak nije dostupan." />
        </Helmet>
        <Navbar onSearch={() => {}} />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h1 className="text-3xl font-serif font-medium text-white mb-4">Članak nije pronađen</h1>
            <p className="text-brand-dim mb-8">Traženi članak nije dostupan ili URL nije ispravan.</p>
            <button
              onClick={() => navigate("/hadis")}
              className="px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-white/10 transition"
            >
              Povratak na Hadis stranicu
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Article is defined below this point ──
  const { title, summary, tags } = article;
  const metaDescription = truncateDescription(summary ?? title);
  const wordCount = calculateWordCount(article.content);
  const related = getRelatedArticles(slug ?? "", tags ?? []);
  const articleUrl = `${SITE_URL}/hadis/article/${article.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title} — ${articleUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">

      <Helmet>
        <title>{title} | {SITE_NAME}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:image" content={`${SITE_URL}/images/og-default.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>

      <Navbar onSearch={() => {}} />

      <main className="pt-20">
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-mono text-brand-dim">HADIS</span>
              <h1 className="text-3xl font-serif font-medium">{title}</h1>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <span className="text-[11px] uppercase tracking-widest text-brand-dim font-medium">
                {formatDate(article.dateCreated)}
              </span>

              <span className="text-white/10">·</span>

              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white">
                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {calculateReadingTime(wordCount)}
              </span>

              <span className="text-white/10">·</span>

              <span className="text-[11px] uppercase tracking-widest text-brand-dim font-medium">
                {wordCount} REČI
              </span>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {tags.map(tag => (
                  <span
                    key={tag}
                    onClick={() => navigate(`/tags#${tag}`)}
                    className="text-xs text-brand-dim border border-white/5 px-3 py-1 rounded-full hover:border-white/20 hover:text-white transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert max-w-none space-y-8">
              {article.content.map((paragraph, index) => {

                if (paragraph.startsWith("[IMPORTANT]")) {
                  const text = paragraph.replace("[IMPORTANT]", "");
                  return (
                    <div key={index} className="border-t-4 border-[#4adf80] bg-[#162211] px-5 py-4 rounded-lg inline-block">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-5 h-5 text-[#4adf80]" />
                        <span className="font-semibold text-[#4adf80] tracking-wide">Sažetak Odgovora</span>
                      </div>
                      <p className="leading-relaxed">{text}</p>
                    </div>
                  );
                }

                if (paragraph.startsWith("[QUOTE]")) {
                  const text = paragraph.replace("[QUOTE]", "");
                  return (
                    <div key={index} className="border-t-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 rounded-lg inline-block">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="w-5 h-5 text-brand-dim" />
                      </div>
                      <p className="leading-relaxed">{text}</p>
                    </div>
                  );
                }

                if (paragraph.startsWith("[WARNING]")) {
                  const text = paragraph.replace("[WARNING]", "");
                  return (
                    <div key={index} className="border-t-4 border-amber-500/40 bg-amber-500/10 text-amber-200 px-5 py-4 rounded-lg inline-block">
                      <div className="flex items-center gap-2 mb-2">
                        <TriangleAlert className="w-5 h-5" />
                        <span className="font-semibold text-sm tracking-wide">Napomena</span>
                      </div>
                      <p className="leading-relaxed">{text}</p>
                    </div>
                  );
                }

                if (paragraph.startsWith("[LINK]")) {
                  const content = paragraph.replace("[LINK]", "");
                  const [label, url] = content.includes("|") ? content.split("|") : [content, content];
                  return (
                    <div key={index} className="flex">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-t-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 rounded-lg inline-block"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <LinkIcon className="w-5 h-5" />
                          <span className="font-semibold text-sm tracking-wide">Link</span>
                        </div>
                        <span>{label}</span>
                      </a>
                    </div>
                  );
                }

                if (paragraph.startsWith("[IMAGE]")) {
                  const content = paragraph.replace("[IMAGE]", "");
                  const [url, caption] = content.includes("|") ? content.split("|") : [content, ""];
                  const autoCaption = caption || url.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
                  return (
                    <div key={index} className="my-4">
                      <img
                        src={url}
                        alt={autoCaption || "slika"}
                        loading="lazy"
                        decoding="async"
                        onClick={() => setLightboxData({ url, caption: autoCaption })}
                        className="rounded-lg w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      {autoCaption && (
                        <p className="text-brand-dim text-xs mt-2 text-center">{autoCaption}</p>
                      )}
                    </div>
                  );
                }

                return <p key={index}>{paragraph}</p>;
              })}
            </div>

            {/* Share */}
            <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-4">
              <span className="text-xs font-mono text-brand-dim uppercase tracking-widest">Podeli</span>

              <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 text-brand-dim hover:text-white hover:border-white/30 rounded-lg transition-colors"
            >
              {copied ? (
                <><span>✓</span><span>Kopirano</span></>
              ) : (
                <><LinkIcon className="w-4 h-4" /><span>Kopiraj link</span></>
              )}
            </button>

              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 text-brand-dim hover:text-white hover:border-white/30 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.554 4.1 1.523 5.828L.057 23.428a.75.75 0 00.916.916l5.6-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.502-5.198-1.38l-.374-.217-3.878 1.016 1.017-3.772-.232-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>

          </div>
        </section>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 pb-20">
            <div className="border-t border-white/5 pt-12">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-xs font-mono text-brand-dim">SLIČNO</span>
                <h2 className="text-lg font-serif font-medium">Povezani članci</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map(rel => (
                  <div
                    key={rel.slug}
                    onClick={() => {
                      navigate(`/hadis/article/${rel.slug}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="p-5 border border-white/5 bg-white/[0.01] rounded-lg hover:border-white/20 transition-all cursor-pointer group"
                  >
                    <h3 className="text-sm font-medium text-white group-hover:text-brand-accent transition-colors leading-snug mb-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-brand-dim leading-relaxed line-clamp-2">
                      {rel.summary}
                    </p>
                    {rel.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {rel.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] text-brand-dim border border-white/5 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Lightbox */}
      {lightboxData && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxData(null)}
        >
          <div
            className="relative max-w-4xl w-full border border-brand-dim bg-[#1A1A1A]/70 px-5 py-5 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxData(null)}
              className="absolute top-2 right-2 text-brand-text bg-brand-bg hover:text-white transition-colors text-sm leading-none rounded-full border border-brand-dim hover:border-white w-7 h-7 flex items-center justify-center"
            >
              ✕
            </button>
            <img
              src={lightboxData.url}
              alt={lightboxData.caption}
              className="rounded-lg w-full object-contain max-h-[85vh] mt-6"
            />
            {lightboxData.caption && (
              <p className="text-brand-dim text-xs mt-3 text-center">{lightboxData.caption}</p>
            )}
          </div>
        </div>
      )}

      <BackToTop />
      <Footer />
    </div>
  );
}