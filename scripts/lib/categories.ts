import type { CategoryConfig } from "./generate-category-meta";

/**
 * Every article category that has generated metadata.
 *
 * `typeName` is kept verbatim (including the lowercase "h" in
 * GeneratedhriscanstvoMeta) so that existing imports across src/ keep resolving.
 */
export const CATEGORIES: CategoryConfig[] = [
  { key: "hadis", typeName: "GeneratedHadisMeta" },
  { key: "ateizam", typeName: "GeneratedAteizamMeta" },
  { key: "hriscanstvo", typeName: "GeneratedhriscanstvoMeta" },
  { key: "hinduizam", typeName: "GeneratedHinduizamMeta" },
  { key: "islam", typeName: "GeneratedIslamMeta" },
  { key: "istorija", typeName: "GeneratedIstorijaMeta" },
  { key: "ahmedije", typeName: "GeneratedAhmedijeMeta" },
  { key: "odgovori", typeName: "GeneratedOdgovoriMeta" },
  { key: "opovrgavanje", typeName: "GeneratedOpovrgavanjeMeta" },
  { key: "nauka", typeName: "GeneratedNaukaMeta" },
  { key: "muhammed", typeName: "GeneratedMuhammedMeta" },
  { key: "spisi", typeName: "GeneratedSpisiMeta" },
];

export function getCategory(key: string): CategoryConfig {
  const category = CATEGORIES.find((entry) => entry.key === key);
  if (!category) throw new Error(`Unknown category: ${key}`);
  return category;
}
