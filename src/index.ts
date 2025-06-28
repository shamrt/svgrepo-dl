import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { load } from "cheerio";
import { range } from "lodash-es";

const COLLECTION_BASE_URL = "https://www.svgrepo.com/collection";
const Collection = {
  name: "Twemoji Emojis",
  slug: "twemoji-emojis",
  pageCount: 72,
};
const collectionUrls = range(1, Collection.pageCount + 1).map(
  (page) => `${COLLECTION_BASE_URL}/${Collection.slug}/${page}`
);
const OUTPUT_DIR = "./public/vectors";

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
