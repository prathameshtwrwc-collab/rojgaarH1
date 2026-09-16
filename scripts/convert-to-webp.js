import sharp from "sharp";
import fs from "fs";
import path from "path";

const assetsDir = path.join(process.cwd(), "public", "assets");

const IMAGE_FILES = [
  "foremployers/foremployers.png",
  "foremployers/foremployers2.png",
  "foremployers/foremployersmobilebg.png",
  "foremployers/job-seeker-infobg.png",
  "forJobseekers/jobseekerbgsection2.png",
  "forJobseekers/jobseekerbgsection3.png",
  "forJobseekers/jobseekerbgsection4.png",
  "forJobseekers/jobseekerbgsection5.png",
  "forJobseekers/jobseekerbgsection6.png",
  "hero/RH_Bg.png",
  "hero/hero_mobile.png",
  "section2/section2bg.png",
  "section2/section2bgmobile.png",
  "section3/section3bg.png",
  "section3/section3bgmobile.png",
  "section4/section4bg.png",
  "section4/section4bgmobile.png",
  "section5/section5bg.png",
  "section6/section6bg.png",
  "section6/section6bgmobile.png",
  "section7/section7bg.png",
  "section7/section7bgmobile.png",
  "section8/section8bg.png",
  "section8/section8mobile.png",
];

async function optimizeImages() {
  for (const file of IMAGE_FILES) {
    const inputPath = path.join(assetsDir, file);
    const webpPath = inputPath.replace(/\.png$/, ".webp");

    if (!fs.existsSync(inputPath)) {
      console.log(`SKIP: ${file} not found`);
      continue;
    }

    try {
      await sharp(inputPath)
        .webp({ quality: 75, effort: 4 })
        .toFile(webpPath);

      const originalSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(webpPath).size;
      const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

      console.log(`OK: ${file} -> ${path.basename(webpPath)} (${(originalSize/1024/1024).toFixed(2)}MB -> ${(webpSize/1024/1024).toFixed(2)}MB, saved ${savings}%)`);
    } catch (error) {
      console.error(`FAIL: ${file}`, error);
    }
  }
}

optimizeImages().catch(console.error);
