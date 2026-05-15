import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);
type SanityImageSource = Parameters<typeof builder.image>[0];

export const urlFor = (source: SanityImageSource) => builder.image(source);

export function sanityImageOrFileUrl(
  source: unknown,
  fallback = "",
  options?: { width?: number; height?: number; quality?: number; fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min" },
): string {
  if (typeof source === "string") {
    return source.trim() || fallback;
  }

  if (!source) return fallback;

  try {
    let image = urlFor(source as SanityImageSource);
    if (options?.width) image = image.width(options.width);
    if (options?.height) image = image.height(options.height);
    if (options?.fit) image = image.fit(options.fit);
    if (options?.quality) image = image.quality(options.quality);
    return image.url();
  } catch {
    return fallback;
  }
}
