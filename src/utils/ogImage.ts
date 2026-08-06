import { OG_IMAGES } from "../lib/generated/ogImages";
import { SITE_URL } from "./siteConfig";

const DEFAULT_OG_IMAGE = "/images/og-default.png";

/**
 * Absolute URL of the Open Graph card for an article.
 *
 * Social crawlers reject relative URLs, so this must always be absolute. Falls
 * back to the site-wide card if an article has no generated image yet.
 */
export function getOgImage(category: string, slug: string): string {
  const image = OG_IMAGES[`${category}/${slug}`] ?? DEFAULT_OG_IMAGE;
  return `${SITE_URL}${image}`;
}

export function getDefaultOgImage(): string {
  return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
}
