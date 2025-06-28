/**
 * Script to download SVG icons from a specific SVGRepo collection.
 * 
 * Borrows heavily from the original script by @ @alanrsoares
alanrsoares
  * @see https://gist.github.com/alanrsoares/2a8eb5688c32e611b9757071a2d5f027
 */

import { config } from "dotenv";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { load } from "cheerio";
import { range } from "lodash-es";

// Load environment variables
config();

const COLLECTION_BASE_URL = "https://www.svgrepo.com/collection";

// Get collection configuration from environment variables
const COLLECTION_NAME = process.env.COLLECTION_NAME || "Unknown Collection";
const COLLECTION_SLUG = process.env.COLLECTION_SLUG;
const COLLECTION_PAGE_COUNT = parseInt(process.env.COLLECTION_PAGE_COUNT || "1", 10);
const OUTPUT_DIR = process.env.OUTPUT_DIR || "./public/vectors";

if (!COLLECTION_SLUG) {
  throw new Error("COLLECTION_SLUG environment variable is required");
}

const collectionUrls = range(1, COLLECTION_PAGE_COUNT + 1).map(
  (page) => `${COLLECTION_BASE_URL}/${COLLECTION_SLUG}/${page}`
);

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

interface SVGItem {
  url: string;
  name: string;
}

function extractSVGsFromHTML(html: string): SVGItem[] {
  const $ = load(html);
  const vectors: SVGItem[] = [];

  $('img[itemprop="contentUrl"]').each((_, el) => {
    const url = $(el).attr("src");
    const alt = $(el).attr("alt") ?? "icon";
    if (url) {
      const name =
        alt
          .replace(/[^a-z0-9_-]/gi, "_")
          .toLowerCase()
          .replace(/_svg_file$/, "") + ".svg";
      vectors.push({ url, name });
    }
  });

  return vectors;
}

async function downloadSVG(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  const svg = await res.text();
  await writeFile(join(OUTPUT_DIR, filename), svg);
  console.log(`✅ Saved ${filename}`);
}

async function run() {
  console.log(`📦 Downloading SVGs from collection: ${COLLECTION_NAME}`);
  console.log(`🔗 Collection slug: ${COLLECTION_SLUG}`);
  console.log(`📄 Processing ${COLLECTION_PAGE_COUNT} pages`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  await mkdir(OUTPUT_DIR, { recursive: true });

  const allIcons = [] as SVGItem[];

  for (const url of collectionUrls) {
    const html = await fetchHTML(url);
    const icons = extractSVGsFromHTML(html);
    allIcons.push(...icons);
  }

  for (const { url, name } of allIcons) {
    try {
      await downloadSVG(url, name);
    } catch (err) {
      console.error(`❌ Failed to save ${url}:`, err);
    }
  }
}

run();
