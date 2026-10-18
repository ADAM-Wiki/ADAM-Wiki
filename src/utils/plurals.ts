/**
 * Serbian noun form for a count: 1 clanak, 2-4 clanka, 5+ clanaka, with the
 * 11-14 exception (5 clanaka, 11 clanaka, 12 clanaka, 21 clanak, 22 clanka).
 * Callers own the noun; this owns the rule. Was copied by hand into five
 * components before living here.
 */
export function pluralForm(
  count: number,
  forms: readonly [string, string, string],
): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  const last = count % 10;
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

/** The site's article noun, in its three count forms. */
export const CLANAK = ["članak", "članka", "članaka"] as const;
