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
}

/**
 * The canonical category list. Kept free of any article/search imports so that
 * components rendering the category grid stay cheap.
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
  },
];

export const topics: string[] = CATEGORIES.map((category) => category.title);

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