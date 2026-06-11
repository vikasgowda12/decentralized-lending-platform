import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storePath = path.resolve(__dirname, "../data/store.json");

export async function readStore() {
  const raw = await fs.readFile(storePath, "utf-8");
  return JSON.parse(raw);
}

export async function writeStore(data) {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
  return data;
}

