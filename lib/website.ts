import type {WebsiteSummary} from "@/lib/types";

const MAX_HTML_BYTES = 1_500_000;

export async function summarizeWebsite(url: string): Promise<WebsiteSummary> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; UGCVideoAssistant/1.0; +https://example.com/bot)"
      }
    });

    if (!response.ok) {
      throw new Error(`Website returned ${response.status}`);
    }

    const html = (await response.text()).slice(0, MAX_HTML_BYTES);
    ensureFilePolyfill();
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    $("script, style, noscript, svg").remove();

    const title =
      clean($("title").first().text()) ||
      clean($("meta[property='og:title']").attr("content")) ||
      new URL(url).hostname;

    const description =
      clean($("meta[name='description']").attr("content")) ||
      clean($("meta[property='og:description']").attr("content"));

    const headings = $("h1, h2, h3")
      .map((_, element) => clean($(element).text()))
      .get()
      .filter(Boolean)
      .slice(0, 10);

    const bodyCopy = $("main, body")
      .first()
      .text()
      .split(/\n|\. /)
      .map(clean)
      .filter((line) => line.length > 35 && line.length < 220)
      .slice(0, 12);

    return {
      url,
      title,
      description,
      messaging: [...headings, ...bodyCopy].join("\n").slice(0, 4000)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function clean(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function ensureFilePolyfill() {
  if (typeof globalThis.File !== "undefined") return;

  class NodeFile extends Blob {
    name: string;
    lastModified: number;

    constructor(fileBits: BlobPart[], fileName: string, options: FilePropertyBag = {}) {
      super(fileBits, options);
      this.name = fileName;
      this.lastModified = options.lastModified ?? Date.now();
    }
  }

  Object.defineProperty(globalThis, "File", {
    value: NodeFile,
    configurable: true,
    writable: true
  });
}
