const fs = require('fs');
const Jimp = require('jimp');

async function optimizePill() {
  console.log("Reading pill.json...");
  const data = fs.readFileSync('./assets/animation/pill.json', 'utf8');
  const json = JSON.parse(data);

  if (json.assets && json.assets.length > 0) {
    for (let i = 0; i < json.assets.length; i++) {
      let asset = json.assets[i];
      if (asset.p && asset.p.startsWith('data:image')) {
        console.log(`Processing asset ${asset.id}, current size: ${asset.w}x${asset.h}`);
        if (asset.w > 1000 || asset.h > 1000) {
          const base64Data = asset.p.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          
          console.log("Decoding image...");
          const image = await Jimp.read(buffer);
          
          console.log("Resizing image to max 512x512...");
          image.scaleToFit(512, 512);
          
          console.log("Encoding back to base64...");
          const newBase64 = await image.getBase64Async(Jimp.MIME_PNG);
          
          asset.p = newBase64;
          asset.w = image.bitmap.width;
          asset.h = image.bitmap.height;
          console.log(`Asset ${asset.id} optimized to: ${asset.w}x${asset.h}`);
        }
      }
    }
    
    console.log("Saving pill-optimized.json...");
    fs.writeFileSync('./assets/animation/pill-optimized.json', JSON.stringify(json));
    console.log("Done!");
  } else {
    console.log("No assets found.");
  }
}

optimizePill().catch(console.error);
