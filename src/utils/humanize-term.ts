/**
 * humanize-term.ts — render frontmatter taxonomy terms as prose.
 *
 * Tags and categories are authored in Title-Case-With-Dashes because Obsidian
 * requires the dash form for its tag syntax — `Near-Future-Anticipation`, not
 * `Near Future Anticipation`. That constraint belongs to the authoring tool,
 * not to the reader, so the dashes come out at render time.
 *
 * 230 of the 330 distinct tags in this site's content carry at least one dash,
 * so this is the common case rather than the exception.
 *
 * The stored value stays canonical: it is the filter key, the sort key, and
 * what any future tag index would be built from. Only the *label* is
 * humanized. Never humanize before comparing, grouping, or generating a URL.
 */

/** `Near-Future-Anticipation` → `Near Future Anticipation`. */
export function humanizeTerm(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/-/g, ' ');
}

/** Map humanizeTerm over a list, dropping empties. */
export function humanizeTerms(values: readonly (string | null | undefined)[] = []): string[] {
  return values.map(humanizeTerm).filter(Boolean);
}
