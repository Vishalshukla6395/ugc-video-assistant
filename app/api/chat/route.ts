import {NextResponse} from "next/server";
import {fetchAssets} from "@/lib/assets";
import {answerGeneralMessage, createMarketingStrategy} from "@/lib/claude";
import {summarizeWebsite} from "@/lib/website";
import {extractUrl} from "@/lib/url";
import {renderUgcVideo} from "@/lib/video";
import type {ChatMessage} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {messages?: ChatMessage[]};
    const messages = body.messages ?? [];
    const latest = messages.at(-1);

    if (!latest?.content) {
      return NextResponse.json({error: "Missing message content."}, {status: 400});
    }

    const url = extractUrl(latest.content);
    if (!url) {
      const content = await answerGeneralMessage(messages);
      return NextResponse.json({
        message: assistantMessage(content)
      });
    }

    const summary = await summarizeWebsite(url);
    const strategy = await createMarketingStrategy(summary);
    const assets = await fetchAssets(strategy);
    const videoUrl = await renderUgcVideo(strategy, assets);
    const hook = strategy.ugcCaption.split("\n")[0]?.replace(/^['"]|['"]$/g, "") || strategy.ugcCaption;

    return NextResponse.json({
      message: assistantMessage(
        `✅ Your UGC video is ready.\n\nProduct: ${strategy.productName}\n\nHook:\n'${hook}'\n\nVideo:\n${videoUrl}`,
        {
          url: videoUrl,
          productName: strategy.productName,
          hook
        }
      )
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({error: message}, {status: 500});
  }
}

function assistantMessage(content: string, video?: ChatMessage["video"]): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
    video
  };
}
