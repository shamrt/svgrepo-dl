/**
 * Script to download SVG icons from a specific SVGRepo collection.
 * 
 * Borrows heavily from the original script by @ @alanrsoares
alanrsoares
  * @see https://gist.github.com/alanrsoares/2a8eb5688c32e611b9757071a2d5f027
 */

import { config } from "dotenv";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { load } from "cheerio";
import { range } from "lodash-es";

// Load environment variables
config();

const COLLECTION_BASE_URL = "https://www.svgrepo.com/collection";

// Get collection configuration from environment variables
const COLLECTION_NAME = process.env.COLLECTION_NAME || "Unknown Collection";
const COLLECTION_SLUG = process.env.COLLECTION_SLUG;
const COLLECTION_PAGE_START = parseInt(process.env.COLLECTION_PAGE_START || "1", 10);
const COLLECTION_PAGE_END = parseInt(process.env.COLLECTION_PAGE_END || "1", 10);
const BASE_OUTPUT_DIR = process.env.OUTPUT_DIR || "./public/vectors";

if (!COLLECTION_SLUG) {
  throw new Error("COLLECTION_SLUG environment variable is required");
}

// Include collection slug in output directory
const OUTPUT_DIR = join(BASE_OUTPUT_DIR, COLLECTION_SLUG);

if (COLLECTION_PAGE_START > COLLECTION_PAGE_END) {
  throw new Error("COLLECTION_PAGE_START must be less than or equal to COLLECTION_PAGE_END");
}

const collectionUrls = range(COLLECTION_PAGE_START, COLLECTION_PAGE_END + 1).map(
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
  console.log(`📄 Processing pages ${COLLECTION_PAGE_START} to ${COLLECTION_PAGE_END} (${COLLECTION_PAGE_END - COLLECTION_PAGE_START + 1} total)`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  // Check if output directory already exists
  if (existsSync(OUTPUT_DIR)) {
    console.warn(`⚠️  WARNING: Output directory '${OUTPUT_DIR}' already exists!`);
    console.warn(`   This may overwrite existing files. Exiting to prevent data loss.`);
    console.warn(`   Please remove the directory or choose a different collection/output path.`);
    process.exit(1);
  }
  
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
