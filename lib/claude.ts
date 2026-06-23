import Anthropic from "@anthropic-ai/sdk";
import {z} from "zod";
import type {ChatMessage, MarketingStrategy, WebsiteSummary} from "@/lib/types";

const StrategySchema = z.object({
  productName: z.string().min(1),
  productDescription: z.string().min(1),
  targetAudience: z.string().min(1),
  marketingAngle: z.string().min(1),
  ugcCaption: z.string().min(1),
  gifSearchTerm: z.string().min(1),
  backgroundSearchTerm: z.string().min(1),
  audioMood: z.string().min(1)
});

const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function answerGeneralMessage(messages: ChatMessage[]): Promise<string> {
  const latest = messages.at(-1)?.content.toLowerCase() ?? "";
  if (!process.env.ANTHROPIC_API_KEY) {
    return answerWithoutClaude(latest);
  }

  const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 250,
    temperature: 0.5,
    system:
      "You are a concise, friendly assistant for a UGC video generator. If users ask what you do, explain that you analyze product websites and create short-form UGC marketing videos. Keep responses natural and under 80 words.",
    messages: messages
      .filter((message) => message.id !== "welcome")
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content
      }))
  });

  return textFromClaude(response) || "Send me a product URL and I'll turn it into a short UGC video.";
}

function answerWithoutClaude(latest: string): string {
  if (/\b(hi|hello|hey|yo)\b/.test(latest)) {
    return "Hey 👋 I'm your UGC video assistant. Send me a product URL and I'll create a short-form marketing video.";
  }

  if (latest.includes("what") || latest.includes("do") || latest.includes("capable")) {
    return "I can analyze websites and automatically generate engaging UGC-style marketing videos.";
  }

  if (latest.includes("joke")) {
    return "Why did the landing page start doing squats? It wanted better conversion lift. Send me a product URL and I'll turn it into a UGC-style video.";
  }

  if (latest.includes("how are you")) {
    return "I'm doing well and ready to make product marketing feel less painfully corporate. Paste a product URL whenever you're ready.";
  }

  if (latest.includes("building") || latest.includes("saas") || latest.includes("app")) {
    return "Nice. Tell me what it does, or send the product website, and I can turn the positioning into a short meme-style UGC video hook.";
  }

  return "Got it. I can chat normally, and when you send a product URL I'll analyze it and generate a short UGC-style marketing video.";
}

export async function createMarketingStrategy(summary: WebsiteSummary): Promise<MarketingStrategy> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackStrategy(summary);
  }

  const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 900,
    temperature: 0.8,
    system:
      "You are a viral UGC strategist. Return only strict JSON with these keys: productName, productDescription, targetAudience, marketingAngle, ugcCaption, gifSearchTerm, backgroundSearchTerm, audioMood. Captions must feel like TikTok/Reels meme hooks, not generic ads.",
    messages: [
      {
        role: "user",
        content: `Analyze this product website and create a short UGC video strategy.

URL: ${summary.url}
Title: ${summary.title}
Meta description: ${summary.description}
Main product messaging:
${summary.messaging}

The ugcCaption should be two punchy lines separated by a newline.`
      }
    ]
  });

  try {
    const raw = textFromClaude(response);
    const json = extractJson(raw);
    const parsed = StrategySchema.safeParse(JSON.parse(json));
    if (parsed.success) {
      return parsed.data;
    }
    return fallbackStrategy(summary);
  } catch {
    return fallbackStrategy(summary);
  }
}

function textFromClaude(response: Anthropic.Messages.Message) {
  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

function extractJson(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Claude did not return JSON.");
  }
  return text.slice(first, last + 1);
}

function fallbackStrategy(summary: WebsiteSummary): MarketingStrategy {
  const host = new URL(summary.url).hostname.replace(/^www\./, "");
  const productName = summary.title.split(/[|-]/)[0]?.trim() || host;
  return {
    productName,
    productDescription: summary.description || `A product from ${host}`,
    targetAudience: "busy people who want a simpler workflow",
    marketingAngle: "replace annoying manual work with a fast, satisfying shortcut",
    ugcCaption: `me doing it manually for 20 minutes\nwhile ${productName} does it in 2 seconds`,
    gifSearchTerm: "confused math lady",
    backgroundSearchTerm: "creator desk phone",
    audioMood: "upbeat playful"
  };
}
