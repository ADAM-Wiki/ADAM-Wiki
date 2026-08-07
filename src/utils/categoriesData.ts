export interface CategoryData {
  id: string;
  title: string;
  url: string;
}

/**
 * The canonical category list. Kept free of any article/search imports so that
 * components rendering the category grid stay cheap.
 */
export const CATEGORIES: CategoryData[] = [
  { id: "ahmedije", title: "AHMEDIJE", url: "/categories/ahmedije" },
  { id: "ateizam", title: "ATEIZAM", url: "/categories/ateizam" },
  { id: "hadis", title: "HADISKE NAUKE", url: "/categories/hadis" },
  { id: "hinduizam", title: "HINDUIZAM", url: "/categories/hinduizam" },
  { id: "hriscanstvo", title: "HRIŠĆANSTVO", url: "/categories/hriscanstvo" },
  { id: "islam", title: "ISLAM", url: "/categories/islam" },
  { id: "istorija", title: "ISTORIJA", url: "/categories/istorija" },
  { id: "muhammed", title: "MUHAMMED ﷺ", url: "/categories/muhammed" },
  { id: "nauka", title: "NAUKA I ISLAM", url: "/categories/nauka" },
  { id: "odgovori", title: "ODGOVORI NA SUMNJE", url: "/categories/odgovori" },
  {
    id: "opovrgavanje",
    title: "OPOVRGAVANJE SIJA",
    url: "/categories/opovrgavanje",
  },
];

export const topics: string[] = CATEGORIES.map((category) => category.title);

export function getAllCategories(): string[] {
  return topics;
}

export function getCategoryByTitle(title: string): CategoryData | undefined {
  const needle = title.trim().toLowerCase();
  return CATEGORIES.find(
    (category) => category.title.toLowerCase() === needle,
  );
}
