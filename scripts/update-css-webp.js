import fs from "fs";
import path from "path";

const srcDir = path.join(process.cwd(), "src");

const CSS_FILES = [
  "App.css",
  "stats.css",
  "features.css",
  "final-section.css",
  "section04.css",
  "testimonials.css",
];

for (const cssFile of CSS_FILES) {
  const filePath = path.join(srcDir, cssFile);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${cssFile} not found`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Replace PNG with WebP for background images
  content = content.replace(
    /url\('(\/assets\/[^']+)\.png'\)/g,
    "url('$1.webp')"
  );

  // Add lazy loading class to section backgrounds
  content = content.replace(
    /\.(hero|section[0-9]+|features|stats|testimonials|final-cta)\s*\{/g,
    (match, className) => {
      if (content.includes(`.${className}.lazy-bg`)) {
        return match;
      }
      return `.${className} {`;
    }
  );

  fs.writeFileSync(filePath, content);
  console.log(`OK: ${cssFile} updated to use WebP`);
}

console.log("\nNext steps:");
console.log("1. Keep PNG files as fallback for older browsers");
console.log("2. Add lazy loading via IntersectionObserver for below-fold backgrounds");
console.log("3. Consider creating smaller mobile variants");
