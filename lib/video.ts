import {spawn} from "node:child_process";
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import type {AssetBundle, MarketingStrategy} from "@/lib/types";

export async function renderUgcVideo(strategy: MarketingStrategy, assets: AssetBundle) {
  const outputDir = path.join(process.cwd(), "public", "generated");
  const jobsDir = path.join(process.cwd(), ".next", "render-jobs");
  await mkdir(outputDir, {recursive: true});
  await mkdir(jobsDir, {recursive: true});

  const id = `${Date.now()}-${slugify(strategy.productName)}`;
  const outputPath = path.join(outputDir, `${id}.mp4`);
  const publicUrl = `/generated/${id}.mp4`;
  const jobPath = path.join(jobsDir, `${id}.json`);

  await writeFile(
    jobPath,
    JSON.stringify({
      outputPath,
      strategy,
      assets
    }),
    "utf8"
  );

  await runRenderWorker(jobPath);

  return publicUrl;
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "video";
}
