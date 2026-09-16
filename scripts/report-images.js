import fs from "fs";
import path from "path";

const assetsDir = path.join(process.cwd(), "public", "assets");

const PNG_PATTERNS = [
  "/assets/foremployers/foremployers.png",
  "/assets/foremployers/foremployers2.png",
  "/assets/foremployers/foremployersmobilebg.png",
  "/assets/foremployers/job-seeker-infobg.png",
  "/assets/forJobseekers/jobseekerbgsection2.png",
  "/assets/forJobseekers/jobseekerbgsection3.png",
  "/assets/forJobseekers/jobseekerbgsection4.png",
  "/assets/forJobseekers/jobseekerbgsection5.png",
  "/assets/forJobseekers/jobseekerbgsection6.png",
  "/assets/hero/RH_Bg.png",
  "/assets/hero/hero_mobile.png",
  "/assets/section2/section2bg.png",
  "/assets/section2/section2bgmobile.png",
  "/assets/section3/section3bg.png",
  "/assets/section3/section3bgmobile.png",
  "/assets/section4/section4bg.png",
  "/assets/section4/section4bgmobile.png",
  "/assets/section5/section5bg.png",
  "/assets/section6/section6bg.png",
  "/assets/section6/section6bgmobile.png",
  "/assets/section7/section7bg.png",
  "/assets/section7/section7bgmobile.png",
  "/assets/section8/section8bg.png",
  "/assets/section8/section8mobile.png",
];

const targets = PNG_PATTERNS.map((p) => path.join(assetsDir, p.replace("/assets/", "")));

const report = targets.map((file) => {
  if (!fs.existsSync(file)) {
    return { file, status: "missing" };
  }
  const size = fs.statSync(file).size;
  const sizeInMB = (size / 1024 / 1024).toFixed(2);
  const webp = file.replace(/\.png$/, ".webp");
  const avif = file.replace(/\.png$/, ".avif");
  return {
    file: path.basename(file),
    size: sizeInMB,
    status: "ok",
    webp: fs.existsSync(webp) ? "exists" : "missing",
    avif: fs.existsSync(avif) ? "exists" : "missing",
  };
});

console.log("Image Optimization Report");
console.log("==========================");
console.table(report);

console.log("\nRecommended actions:");
console.log("1. Convert PNGs to WebP using: npx @squoosh/cli --input 'public/assets/**/*.png' --output 'public/assets' --webp");
console.log("2. Consider creating smaller variants for mobile (e.g., 50% width/height)");
console.log("3. Add lazy loading for below-the-fold background images");
