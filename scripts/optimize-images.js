import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, "public", "assets");

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 75;

function getOutputPath(inputPath) {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

function createPlaceholder(width = 20, height = 10) {
  const size = Math.max(width, height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size / 2}"><rect width="100%" height="100%" fill="#f1f5f9"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const instructions = `
IMAGE OPTIMIZATION GUIDE
========================

Your public/assets folder contains many large PNGs (>1MB each).
To improve load times, convert them to WebP or AVIF and serve smaller variants.

Recommended steps:
1. Install Sharp: npm install -g sharp
2. Run a bulk conversion script like:
   - npx @squoosh/cli --input "public/assets/**/*.png" --output "public/assets" --webp
3. Replace CSS background-image URLs with WebP versions
4. Add lazy loading for below-the-fold backgrounds
5. Use responsive image sets for different screen sizes

Current large files (top 5):
${fs
  .readdirSync(assetsDir, { recursive: true })
  .filter((file) => file.endsWith(".png") || file.endsWith(".jpg"))
  .map((file) => {
    const fullPath = path.join(assetsDir, file);
    const stats = fs.statSync(fullPath);
    return `${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`;
  })
  .sort((a, b) => parseFloat(b.split(": ")[1]) - parseFloat(a.split(": ")[1])
  .slice(0, 5)
  .join("\n")}
`;

console.log(instructions);
