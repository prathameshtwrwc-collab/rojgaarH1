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

const SECTION_CLASSES = [
  ".hero",
  ".job-seeker",
  ".employer",
  ".how-it-works",
  ".features",
  ".stats",
  ".testimonials",
  ".final-cta",
  ".section",
];

for (const cssFile of CSS_FILES) {
  const filePath = path.join(srcDir, cssFile);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${cssFile} not found`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  for (const sectionClass of SECTION_CLASSES) {
    const regex = new RegExp(`(${sectionClass.replace(".", "\\.")}\\s*\\{)`, "g");
    content = content.replace(regex, (match, className) => {
      if (match.includes("content-visibility")) {
        return match;
      }
      return `${className.split("{")[0]} {\n  content-visibility: auto;`;
    });
  }

  fs.writeFileSync(filePath, content);
  console.log(`OK: ${cssFile} updated with content-visibility`);
}

console.log("\nDone adding content-visibility to major sections.");
