import {put} from "@vercel/blob";
import {spawn} from "node:child_process";
import {randomUUID} from "node:crypto";
import {readFile} from "node:fs/promises";
import {mkdir, unlink, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type {AssetBundle, MarketingStrategy} from "@/lib/types";

export async function renderUgcVideo(strategy: MarketingStrategy, assets: AssetBundle) {
  assertBlobConfigured();

  const id = `${Date.now()}-${randomUUID()}-${slugify(strategy.productName)}`;
  const workDir = path.join(os.tmpdir(), "ugc-video-assistant");
  await mkdir(workDir, {recursive: true});

  const outputPath = path.join(workDir, `${id}.mp4`);
  const jobPath = path.join(workDir, `${id}.json`);

  await writeFile(
    jobPath,
    JSON.stringify({
      outputPath,
      strategy,
      assets
    }),
    "utf8"
  );

  try {
    await runRenderWorker(jobPath);
    const video = await readFile(outputPath);
    const blob = await put(`ugc-videos/${id}.mp4`, video, {
      access: "public",
      contentType: "video/mp4"
    });

    return blob.url;
  } finally {
    await Promise.allSettled([unlink(jobPath), unlink(outputPath)]);
  }
}

async function runRenderWorker(jobPath: string) {
  const tsxBin = path.join(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");
  const workerPath = path.join(process.cwd(), "scripts", "render-job.ts");

  await new Promise<void>((resolve, reject) => {
    const child = spawn(tsxBin, [workerPath, jobPath], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr || `Render worker exited with code ${code}`));
    });
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
