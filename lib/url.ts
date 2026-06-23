const urlPattern =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,12}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)?/i;

export function extractUrl(input: string): string | null {
  const match = input.match(urlPattern);
  if (!match?.[0]) return null;

  try {
    const url = new URL(match[0]);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
