import {fetchAssets} from "../lib/assets";
import {renderUgcVideo} from "../lib/video";
import type {MarketingStrategy} from "../lib/types";

const strategy: MarketingStrategy = {
  productName: "CalAI",
  productDescription: "A calorie tracking app that logs meals without spreadsheet energy.",
  targetAudience: "people tracking calories and macros",
  marketingAngle: "manual macro math is exhausting",
  ugcCaption: "when your coach asks for macros\nand you're still using spreadsheets",
  gifSearchTerm: "confused math lady",
  backgroundSearchTerm: "fitness gym",
  audioMood: "upbeat playful"
};

async function main() {
  const assets = await fetchAssets(strategy);
  const url = await renderUgcVideo(strategy, assets);
  console.log(`Rendered ${url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
