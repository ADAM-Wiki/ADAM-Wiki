export interface CategoryData {
  id: string;
  /** Uppercase label used by the category grid and article cards. */
  title: string;
  url: string;
  /** Sentence-case name for page headings and <title>. */
  label: string;
  /** Short eyebrow above an article's H1. */
  eyebrow: string;
  /** Meta/OG description for the category listing page. */
  description: string;
  /**
   * Listing presentation on the category page. Absent = the standard card
   * grid; "index" = the numbered compact index with the article count line.
   */
  listingStyle?: "index";
}

/**
 * THE category registry - the only hand-written list of categories.
 *
 * Everything else derives from it: the build scripts iterate CATEGORIES to
 * generate meta/search files and emit the META_BY_CATEGORY / SEARCH_BY_CATEGORY
 * indexes, App.tsx builds article routes from it, and check:registry fails the
 * build if any derived artifact misses an entry. Adding a category means one
 * entry here + its content dir + one <Pascal(id)>ArticlePage.tsx component.
 *
 * Kept free of any article/search imports so that components rendering the
 * category grid stay cheap.
 */
export const CATEGORIES: CategoryData[] = [
  {
    id: "ahmedije",
    title: "AHMEDIJE",
    url: "/categories/ahmedije",
    label: "Ahmedije",
    eyebrow: "AHMEDIJE",
    description:
      "Analiza i opovrgavanje ahmedijskih (kadijanskih) učenja, sa izvorima.",
  },
  {
    id: "ateizam",
    title: "ATEIZAM",
    url: "/categories/ateizam",
    label: "Ateizam",
    eyebrow: "ATEIZAM",
    description:
      "Odgovori na ateističke prigovore o Bogu, moralu i poreklu svemira.",
  },
  {
    id: "hadis",
    title: "HADISKE NAUKE",
    url: "/categories/hadis",
    label: "Hadiske nauke",
    eyebrow: "HADISKE NAUKE",
    description:
      "Islamski hadisi i njihova naučna objašnjenja. Istražite autentične hadise Poslanika Muhammeda s.a.v.s.",
  },
  {
    id: "hinduizam",
    title: "HINDUIZAM",
    url: "/categories/hinduizam",
    label: "Hinduizam",
    eyebrow: "HINDUIZAM",
    description:
      "Uporedna analiza hinduističkih učenja i odgovori na česta pitanja.",
  },
  {
    id: "hriscanstvo",
    title: "HRIŠĆANSTVO",
    url: "/categories/hriscanstvo",
    label: "Hrišćanstvo",
    eyebrow: "HRIŠĆANSTVO",
    description:
      "Odgovori hrišćanima - biblijski tekst, doktrina i istorijski kontekst.",
  },
  {
    id: "islam",
    title: "ISLAM",
    url: "/categories/islam",
    label: "Islam",
    eyebrow: "ISLAM",
    description:
      "Osnove islamskog verovanja, izvori i objašnjenja ključnih pojmova.",
  },
  {
    id: "istorija",
    title: "ISTORIJA",
    url: "/categories/istorija",
    label: "Istorija",
    eyebrow: "ISTORIJA",
    description: "Istorija religija i ranog islama na osnovu primarnih izvora.",
  },
  {
    id: "muhammed",
    title: "MUHAMMED ﷺ",
    url: "/categories/muhammed",
    label: "Muhammed ﷺ",
    eyebrow: "MUHAMMED",
    description: "Život, poslanstvo i predanja o poslaniku Muhammedu ﷺ.",
  },
  {
    id: "nauka",
    title: "NAUKA I ISLAM",
    url: "/categories/nauka",
    label: "Nauka",
    eyebrow: "NAUKA",
    description: "Odnos nauke i islama - tvrdnje, provere i naučna literatura.",
  },
  {
    id: "odgovori",
    title: "ODGOVORI NA SUMNJE",
    url: "/categories/odgovori",
    label: "Odgovori",
    eyebrow: "ODGOVORI",
    description: "Odgovori na najčešće sumnje i prigovore upućene islamu.",
  },
  {
    id: "opovrgavanje",
    title: "OPOVRGAVANJE SIJA",
    url: "/categories/opovrgavanje",
    label: "Opovrgavanje Šija",
    eyebrow: "OPOVRGAVANJE",
    description:
      "Kritička analiza šiitskih učenja sa osloncem na izvorne tekstove.",
  },
  {
    id: "spisi",
    title: "MUHAMMED ﷺ U RANIJIM SPISIMA",
    url: "/categories/spisi",
    label: "Muhammed ﷺ u ranijim spisima",
    eyebrow: "RANIJI SPISI",
    description:
      "Najave poslanika Muhammeda ﷺ u ranijim objavama - hebrejski tekst, rukopisi i jezička analiza.",
    listingStyle: "index",
  },
  {
    id: "kuran",
    title: "OČUVANJE KUR'ANA",
    url: "/categories/kuran",
    label: "Očuvanje Kur'ana",
    eyebrow: "OČUVANJE KUR'ANA",
    description:
      "Očuvanje kur'anskog teksta - kiraeti, osmanski mushaf, rani rukopisi i odgovori na prigovore.",
  },
];

export const topics: string[] = CATEGORIES.map((category) => category.title);

/**
 * Every article in a category lives at `${articleBasePath(id)}/<slug>`.
 * The one place the URL shape is written down - search worker, routes and the
 * article index all used to spell it out separately.
 */
export const articleBasePath = (id: string): string =>
  `/categories/${id}/article`;

const BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));

export function getAllCategories(): string[] {
  return topics;
}

export function getCategoryById(id: string): CategoryData | undefined {
  return BY_ID.get(id);
}

export function getCategoryByTitle(title: string): CategoryData | undefined {
  const needle = title.trim().toLowerCase();
  return CATEGORIES.find((category) => category.title.toLowerCase() === needle);
}