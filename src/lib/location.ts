/**
 * Location keys for filtering. "Mumbai", "mumbai" and " MUMBAI  " all give the same key,
 * so they count as one location.
 */
export function locationKey(value: string | null | undefined): string {
  return (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Readable form of a location: "navi mumbai" -> "Navi Mumbai". */
export function locationLabel(value: string): string {
  return locationKey(value).replace(/(^|[\s/-])(\p{L})/gu, (_m, sep, ch) => sep + ch.toUpperCase());
}
