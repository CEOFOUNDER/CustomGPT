const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "data", "card_manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const localSourceDir = path.join(root, "assets", "card-sources");
const siteSourceDir = path.join(root, "site", "assets", "card-sources");
const localOutputDir = path.join(root, "assets", "cards");
const siteOutputDir = path.join(root, "site", "assets", "cards");

for (const dir of [localSourceDir, siteSourceDir, localOutputDir, siteOutputDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

  for (const card of manifest) {
    const html = cardHtml(card);
    const sourceName = path.basename(card.sourceFile);
    const outputName = path.basename(card.outputFile);
    const localSource = path.join(localSourceDir, sourceName);
    const siteSource = path.join(siteSourceDir, sourceName);
    const localOutput = path.join(localOutputDir, outputName);
    const siteOutput = path.join(siteOutputDir, outputName);

    fs.writeFileSync(localSource, html);
    fs.writeFileSync(siteSource, html);
    await page.goto(pathToFileURL(localSource).href);
    await page.screenshot({ path: localOutput, type: "png", clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    fs.copyFileSync(localOutput, siteOutput);
  }

  await browser.close();
  console.log(`Rendered ${manifest.length} PNG card assets.`);
}

function cardHtml(card) {
  const title = escapeHtml(card.topic);
  const problem = escapeHtml(card.problem);
  const niche = escapeHtml(card.niche);
  const coupon = escapeHtml(card.coupon);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { width: 1080px; height: 1350px; margin: 0; background: #f6f8fb; color: #101828; font-family: Inter, Arial, Helvetica, sans-serif; overflow: hidden; }
    .card { position: relative; width: 992px; height: 1262px; margin: 44px; padding: 54px; border: 2px solid #d9e1ec; border-radius: 34px; background: #ffffff; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 32px; }
    .brand { display: inline-flex; align-items: center; height: 54px; padding: 0 30px; border-radius: 27px; background: #eef8f6; color: #0f8f80; font-size: 25px; font-weight: 800; }
    .niche { max-width: 360px; color: #667085; font-size: 24px; font-weight: 800; text-align: right; }
    h1 { width: 850px; margin: 68px 0 0; font-size: 72px; line-height: 1.02; letter-spacing: 0; }
    .problem { width: 790px; margin: 52px 0 0; color: #475467; font-size: 34px; line-height: 1.33; font-weight: 500; }
    .demo { position: absolute; left: 54px; right: 54px; bottom: 156px; height: 360px; border-radius: 28px; background: #111827; overflow: hidden; }
    .pill { position: absolute; left: 40px; top: 50px; height: 34px; padding: 6px 20px; border-radius: 17px; background: #2dd4bf; color: #062f2c; font-size: 19px; font-weight: 800; }
    .question { position: absolute; left: 40px; top: 126px; width: 505px; height: 68px; display: flex; align-items: center; padding: 0 32px; border-radius: 18px; background: rgba(255,255,255,.12); color: #ffffff; font-size: 25px; font-weight: 800; }
    .answer { position: absolute; right: 40px; bottom: 47px; width: 682px; height: 86px; padding: 18px 80px 16px 34px; border-radius: 22px; background: #ffffff; }
    .answer strong { display: block; font-size: 24px; line-height: 1.15; }
    .answer span { display: block; margin-top: 6px; color: #667085; font-size: 20px; }
    .check { position: absolute; right: 32px; top: 25px; width: 48px; height: 48px; display: grid; place-items: center; border-radius: 24px; background: #12b76a; color: #ffffff; font-size: 31px; font-weight: 900; }
    .bottom-pill { position: absolute; left: 54px; bottom: 94px; height: 58px; padding: 14px 30px; border-radius: 29px; background: #eef2ff; color: #3538cd; font-size: 24px; font-weight: 800; }
    .footer { position: absolute; left: 54px; bottom: 34px; color: #667085; font-size: 22px; font-weight: 500; }
  </style>
</head>
<body>
  <article class="card">
    <div class="top"><div class="brand">CustomGPT.ai</div><div class="niche">${niche}</div></div>
    <h1>${title}</h1>
    <p class="problem">${problem}</p>
    <section class="demo"><div class="pill">Website-trained assistant</div><div class="question">Can I return this after opening?</div><div class="answer"><strong>Answer from approved content</strong><span>FAQs, policies, docs, product pages</span><div class="check">&#10003;</div></div></section>
    <div class="bottom-pill">No-code AI support test</div>
    <div class="footer">Offer details on landing page. Coupon: ${coupon}</div>
  </article>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
