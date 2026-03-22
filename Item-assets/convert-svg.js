import sharp from "sharp";
import fs from "fs";
import path from "path";

// 1. Your raw SVG code

const assetName = "health-potion";
const svgPath = path.join(process.cwd(), "Item-assets", `${assetName}.svg`);

if (!fs.existsSync(svgPath)) {
  console.error(`❌ Error: ${svgPath} not found.`);
  process.exit(1);
}

const svgCode = fs.readFileSync(svgPath, "utf8");

const svgBuffer = Buffer.from(svgCode);

// 2. Define your asset name and sizes
const sizes = [32, 64, 128, 256];

// 3. Create the directory if it doesn't exist
const outputDir = path.join(process.cwd(), assetName);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
  console.log(`📁 Created folder: ${assetName}`);
}

// 4. Async function to process all sizes
async function generateSprites() {
  console.log(`Brewing your ${assetName}s...`);

  for (const size of sizes) {
    try {
      // Define the exact path where the file will be saved inside the new folder
      const outputPath = path.join(
        outputDir,
        `${assetName}-${size}x${size}.png`,
      );

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: "contain",
          kernel: sharp.kernel.nearest,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Success: ${assetName}/${assetName}-${size}x${size}.png`);
    } catch (err) {
      console.error(`❌ Error creating ${size}x${size} PNG:`, err);
    }
  }

  console.log("All sprites finished rendering!");
}

// Execute the function
generateSprites();
