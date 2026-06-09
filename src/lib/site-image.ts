import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export async function getSiteImageDataUrl() {
  const file = join(process.cwd(), "public", site.image.replace(/^\//, ""));
  const buffer = await readFile(file);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
