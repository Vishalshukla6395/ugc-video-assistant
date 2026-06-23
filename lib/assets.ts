import type {AssetBundle, MarketingStrategy} from "@/lib/types";

const fallbackGif =
  "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif";
const fallbackBackground =
  "https://images.pexels.com/photos/5077047/pexels-photo-5077047.jpeg?auto=compress&cs=tinysrgb&w=1080";

export async function fetchAssets(strategy: MarketingStrategy): Promise<AssetBundle> {
  const [gifUrl, backgroundUrl] = await Promise.all([
    fetchGif(strategy.gifSearchTerm),
    fetchBackground(strategy.backgroundSearchTerm)
  ]);

  return {
    gifUrl,
    backgroundUrl,
    audioUrl: process.env.DEFAULT_AUDIO_URL || undefined
  };
}

async function fetchGif(query: string) {
  if (!process.env.GIPHY_API_KEY) return fallbackGif;

  const params = new URLSearchParams({
    api_key: process.env.GIPHY_API_KEY,
    q: query,
    limit: "1",
    rating: "pg-13"
  });
  const response = await fetch(`https://api.giphy.com/v1/gifs/search?${params}`);
  if (!response.ok) return fallbackGif;

  const data = (await response.json()) as {
    data?: Array<{images?: {downsized_medium?: {url?: string}; original?: {url?: string}}}>;
  };
  return data.data?.[0]?.images?.downsized_medium?.url ?? data.data?.[0]?.images?.original?.url ?? fallbackGif;
}

async function fetchBackground(query: string) {
  if (!process.env.PEXELS_API_KEY) return fallbackBackground;

  const params = new URLSearchParams({
    query,
    orientation: "portrait",
    per_page: "1"
  });
  const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: {Authorization: process.env.PEXELS_API_KEY}
  });
  if (!response.ok) return fallbackBackground;

  const data = (await response.json()) as {
    photos?: Array<{src?: {portrait?: string; large2x?: string; large?: string}}>;
  };
  return data.photos?.[0]?.src?.portrait ?? data.photos?.[0]?.src?.large2x ?? data.photos?.[0]?.src?.large ?? fallbackBackground;
}
