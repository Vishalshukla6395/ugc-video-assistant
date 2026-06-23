import {put} from "@vercel/blob";
import {randomUUID} from "node:crypto";
import {readFile} from "node:fs/promises";
import {mkdir, unlink} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type {AssetBundle, MarketingStrategy} from "@/lib/types";

export async function renderUgcVideo(strategy: MarketingStrategy, assets: AssetBundle) {
  assertBlobConfigured();

  const id = `${Date.now()}-${randomUUID()}-${slugify(strategy.productName)}`;
  const workDir = path.join(os.tmpdir(), "ugc-video-assistant");
  await mkdir(workDir, {recursive: true});

  const outputPath = path.join(workDir, `${id}.mp4`);

  try {
    await renderToFile(outputPath, strategy, assets);
    const video = await readFile(outputPath);
    const blob = await put(`ugc-videos/${id}.mp4`, video, {
      access: "public",
      contentType: "video/mp4"
    });

    return blob.url;
  } finally {
    await Promise.allSettled([unlink(outputPath)]);
  }
}

async function renderToFile(outputPath: string, strategy: MarketingStrategy, assets: AssetBundle) {
  const [{bundle}, {renderMedia, selectComposition}] = await Promise.all([
    import("@remotion/bundler"),
    import("@remotion/renderer")
  ]);

  const inputProps = {
    strategy,
    assets
  };

  const serveUrl = await bundle({
    entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
    webpackOverride: (config) => config
  });

  const composition = await selectComposition({
    serveUrl,
    id: "UgcVideo",
    inputProps
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    chromiumOptions: {
      gl: "angle"
    }
  });
}

function assertBlobConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN. Configure Vercel Blob before generating videos.");
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "video";
}
