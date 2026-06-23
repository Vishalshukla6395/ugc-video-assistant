import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";
import {readFile} from "node:fs/promises";
import path from "node:path";
import type {AssetBundle, MarketingStrategy} from "../lib/types";

type RenderJob = {
  outputPath: string;
  strategy: MarketingStrategy;
  assets: AssetBundle;
};

async function main() {
  const jobPath = process.argv[2];
  if (!jobPath) {
    throw new Error("Missing render job path.");
  }

  const job = JSON.parse(await readFile(jobPath, "utf8")) as RenderJob;
  const inputProps = {
    strategy: job.strategy,
    assets: job.assets
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
    outputLocation: job.outputPath,
    inputProps,
    chromiumOptions: {
      gl: "angle"
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
