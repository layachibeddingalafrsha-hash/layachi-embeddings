/**
 * URL-safe slug generation.
 *
 * Pure string helpers with no Node-only imports, so they can be shared between
 * server route handlers and client components.
 *
 * Slugs are persisted in MongoDB and embedded directly in `/products/<slug>`
 * URLs, so they must survive a full URL encode/decode round-trip. That means
 * lowercase ASCII `[a-z0-9-]` only: no spaces, no accents, no punctuation and
 * no non-Latin scripts. Names containing those characters are folded down, and
 * names with no Latin content at all fall back to an id-derived slug.
 */

/** Strip diacritics so "Orthopédique" folds to "orthopedique". */
function foldDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Build a URL-safe slug from arbitrary text.
 *
 * @param source Text to derive the slug from (usually the product name).
 * @param fallbackId Used when `source` contains no usable characters, e.g. an
 *   Arabic-only name. A short, stable token is appended so the result is unique.
 */
export function slugify(source: string, fallbackId?: string): string {
  const folded = foldDiacritics(String(source ?? ""));

  const base = folded
    .toLowerCase()
    // "&" reads as "and" rather than being dropped outright.
    .replace(/&/g, " and ")
    // Everything outside [a-z0-9] becomes a separator: spaces, curly quotes,
    // dashes, ampersands and non-Latin scripts all collapse here.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  if (base) return base;

  // No Latin characters survived (e.g. an Arabic-only product name).
  const token = (fallbackId ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(-8).toLowerCase();
  return token ? `product-${token}` : "product";
}

/** True when `slug` is already safe to embed in a URL path. */
export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Resolve the slug to persist: normalize any admin-supplied value, falling back
 * to one derived from `name`.
 *
 * @returns The normalized slug, or `null` when no safe slug can be produced.
 */
export function resolveSlug(input: unknown, name: unknown, fallbackId?: string): string | null {
  const candidate = typeof input === "string" ? input : "";
  const fromInput = slugify(candidate, fallbackId);
  if (fromInput) return fromInput;

  const fromName = slugify(typeof name === "string" ? name : "", fallbackId);
  return fromName || null;
}