const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "config", "campaign.json"), "utf8"));
const base = config.siteBaseUrl.replace(/\/$/, "");
const dirs = [
  "site", "site/pages", "site/use-cases", "site/exports", "site/reports",
  "site/assets/cards", "site/assets/card-sources", "data", "assets/cards",
  "assets/card-sources", "exports/scheduler", "reports"
];
dirs.forEach((dir) => fs.mkdirSync(path.join(root, dir), { recursive: true }));

const topics = [
  ["faq-ai-assistant", "Turn your FAQ page into an AI assistant", "Visitors leave when simple questions take too long to answer.", "Your FAQ page should not just sit there. It can answer customers instantly."],
  ["shipping-questions", "Answer shipping questions instantly", "Shipping uncertainty creates support tickets and hesitation at checkout.", "If customers keep asking where, when, and how much, your shipping page can do more."],
  ["return-policy-chatbot", "Make your return policy easier to understand", "Policy pages are often ignored until the customer is already frustrated.", "Turn your return policy into clear answers customers can ask in plain English."],
  ["product-question-chatbot", "Help customers choose the right product", "Product confusion slows buying decisions.", "An AI assistant trained on your product pages can answer fit, feature, and use-case questions."],
  ["support-ticket-deflection", "Reduce repetitive support tickets", "Small teams lose hours answering the same questions.", "Train an assistant on your help docs so routine answers happen before a ticket is opened."],
  ["knowledge-base-search", "Make your knowledge base conversational", "Search boxes force customers to know the exact keyword.", "Let people ask normal questions and get answers from your approved content."]
];
const channels = [
  { name: "LinkedIn", medium: "social", type: "text" },
  { name: "Pinterest", medium: "pin", type: "card" },
  { name: "YouTube Shorts", medium: "shorts", type: "script" }
];

const esc = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const csv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
const startDate = process.env.SCHEDULE_START_DATE || (config.scheduleMode === "fixed" ? config.startDate : tomorrow());

const content = [["id", "date", "time", "channel", "niche", "topic", "post_text", "landing_url", "asset_file", "status"]];
const scheduler = [["Date", "Time", "Platform", "Post Text", "Link", "Image File", "Campaign", "Notes"]];
const byChannel = new Map(channels.map((channel) => [channel.name, [scheduler[0]]]));
const links = [["id", "niche", "topic", "channel", "landing_url", "affiliate_url"]];
const metrics = [["date", "content_id", "channel", "niche", "topic", "impressions", "clicks", "affiliate_clicks", "signups", "notes"]];
const bufferQueue = [];
const cardManifest = [];
const sitePaths = ["/", "/distribution.html"];

let counter = 1;
for (const niche of config.primaryNiches) {
  fs.writeFileSync(path.join(root, "site/pages", `${niche.slug}.html`), pageHtml(niche));
  sitePaths.push(`/pages/${niche.slug}.html`);

  for (const topic of topics) {
    const [topicSlug, title, problem, hook] = topic;
    const useCaseSlug = `${niche.slug}-${topicSlug}`;
    fs.writeFileSync(path.join(root, "site/use-cases", `${useCaseSlug}.html`), useCaseHtml(niche, topic));
    sitePaths.push(`/use-cases/${useCaseSlug}.html`);

    for (const channel of channels) {
      const id = String(counter).padStart(4, "0");
      const date = addDays(startDate, Math.floor((counter - 1) / config.dailySlots.length));
      const time = config.dailySlots[(counter - 1) % config.dailySlots.length];
      const landing = trackedUrl(niche.slug, channel, topicSlug, id);
      const affiliate = affiliateUrl(niche.slug, topicSlug, channel.name);
      const post = channel.name === "YouTube Shorts"
        ? `${hook}\n\nShow the problem, then show the fix: train a CustomGPT.ai assistant on approved business content. End with coupon code ${config.couponCode}.`
        : `${hook} ${problem} CustomGPT.ai can turn approved business content into a no-code AI assistant. Use coupon code ${config.couponCode}.`;
      const assetName = `${niche.slug}_${topicSlug}_${id}.png`;
      const assetPath = channel.type === "card" ? `assets/cards/${assetName}` : "";
      const publicAsset = channel.type === "card" ? `${base}/assets/cards/${assetName}` : "";

      if (channel.type === "card") {
        cardManifest.push({
          id, niche: niche.name, nicheSlug: niche.slug, topic: title, topicSlug,
          problem, hook, coupon: config.couponCode,
          sourceFile: `assets/card-sources/${assetName.replace(/\.png$/, ".html")}`,
          outputFile: assetPath, publicUrl: publicAsset, alt: `${title} for ${niche.name}`
        });
      }

      content.push([id, date, time, channel.name, niche.name, title, post, landing, assetPath, "ready"]);
      scheduler.push([date, time, channel.name, post, landing, publicAsset, config.campaignName, `${config.couponLabel}: ${config.couponCode}`]);
      byChannel.get(channel.name).push(scheduler[scheduler.length - 1]);
      links.push([id, niche.name, title, channel.name, landing, affiliate]);
      metrics.push(["", id, channel.name, niche.name, title, "", "", "", "", ""]);
      bufferQueue.push({
        id, channel: channel.name, date, time, timezone: config.timezone,
        text: post, link: landing, imageUrl: publicAsset, imageAlt: `${title} for ${niche.name}`,
        campaign: config.campaignName, niche: niche.name, topic: title
      });
      counter += 1;
    }
  }
}

writeSite();
writeCsv("data/content.csv", content);
writeCsv("exports/scheduler/customgpt_scheduler.csv", scheduler);
writeCsv("site/exports/customgpt_scheduler.csv", scheduler);
writeCsv("data/links.csv", links);
writeCsv("site/exports/links.csv", links);
writeCsv("data/metrics_template.csv", metrics);
writeCsv("site/exports/metrics_template.csv", metrics);
writeCsv("data/metrics.csv", [["date", "content_id", "impressions", "clicks", "affiliate_clicks", "signups", "notes"]]);

for (const [channel, rows] of byChannel) {
  writeCsv(`exports/scheduler/${slug(channel)}_scheduler.csv`, rows);
  writeCsv(`site/exports/${slug(channel)}_scheduler.csv`, rows);
}

writeJson("data/buffer_queue.json", bufferQueue);
writeJson("site/exports/buffer_queue.json", bufferQueue);
writeJson("data/card_manifest.json", cardManifest);
writeJson("site/exports/card_manifest.json", cardManifest);
fs.writeFileSync(path.join(root, "reports/weekly_report.md"), weeklyReport());

console.log(`Generated ${content.length - 1} content items.`);
console.log(`Generated ${cardManifest.length} PNG card render jobs.`);
console.log(`Generated Buffer queue with ${bufferQueue.length} items.`);

function pageHtml(niche) {
  const cards = topics.map((topic) => `<article class="use-case"><h3>${esc(topic[1])}</h3><p>${esc(topic[2])}</p></article>`).join("");
  const title = niche.slug === "ecommerce" ? "Turn your ecommerce site into an AI support assistant" : `Build an AI assistant for ${niche.name.toLowerCase()}`;
  return shell(`${title} | CustomGPT.ai Offer`, `<main><section class="hero"><div><p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>${esc(title)}</h1><p class="lede">CustomGPT.ai helps ${esc(niche.audience)} create no-code AI agents trained on their own websites, documents, help centers, and business content.</p><div class="actions"><a class="button" href="${esc(affiliateUrl(niche.slug, "landing-page", "site"))}" rel="sponsored nofollow">Start with coupon ${esc(config.couponCode)}</a><a class="secondary" href="#use-cases">See use cases</a></div></div><aside class="offer"><strong>Best fit</strong><p>${esc(niche.audience)} with ${esc(niche.pain)}.</p><strong>Outcome</strong><p>${esc(niche.outcome)}.</p></aside></section><section id="use-cases" class="band"><h2>Use Cases Worth Testing First</h2><div class="grid">${cards}</div></section></main>`, "../");
}

function useCaseHtml(niche, topic) {
  const [topicSlug, title, problem, hook] = topic;
  const fullTitle = `${title} for ${niche.name}`;
  return shell(`${fullTitle} | CustomGPT.ai`, `<main><section class="hero"><div><p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>${esc(fullTitle)}</h1><p class="lede">${esc(hook)} ${esc(problem)}</p><div class="actions"><a class="button" href="${esc(affiliateUrl(niche.slug, topicSlug, "seo-use-case"))}" rel="sponsored nofollow">Try CustomGPT.ai with ${esc(config.couponCode)}</a></div></div><aside class="offer"><strong>Suggested setup</strong><p>Train the assistant on approved website pages, help docs, PDFs, FAQs, product content, and policy pages.</p></aside></section></main>`, "../");
}

function writeSite() {
  const nicheLinks = config.primaryNiches.map((niche) => `<a class="niche-link" href="pages/${niche.slug}.html"><strong>${esc(niche.name)}</strong><span>${esc(niche.outcome)}</span></a>`).join("");
  fs.writeFileSync(path.join(root, "site/index.html"), shell("CustomGPT.ai AI Assistant Funnel", `<main><section class="hero"><div><p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>Build an AI assistant trained on your business content</h1><p class="lede">Use CustomGPT.ai to turn websites, help docs, PDFs, product pages, and FAQs into a no-code AI assistant for customers or teams.</p><div class="actions"><a class="button" href="pages/ecommerce.html">Start with ecommerce</a><a class="secondary" href="distribution.html">Automation exports</a></div></div><aside class="offer"><strong>Primary loop</strong><p>Generate, render PNG cards, submit to Buffer by API, and deploy the bridge site.</p></aside></section><section class="band"><h2>Choose a Use Case</h2><div class="niche-list">${nicheLinks}</div></section></main>`));
  fs.writeFileSync(path.join(root, "site/distribution.html"), shell("Distribution Files | CustomGPT.ai Funnel", `<main><section class="hero"><div><p class="eyebrow">Publishing Queue</p><h1>Machine-to-machine funnel exports</h1><p class="lede">GitHub Actions generates PNG cards, tracked landing pages, Buffer queue payloads, and fallback CSVs.</p></div><aside class="offer"><strong>Best first channel</strong><p>Start with Pinterest and LinkedIn. Add Shorts after the image and landing-page loop has traffic.</p></aside></section><section class="band"><h2>Automation Files</h2><div class="grid"><article class="use-case"><h3>Buffer API queue</h3><p><a href="exports/buffer_queue.json">buffer_queue.json</a></p></article><article class="use-case"><h3>Card manifest</h3><p><a href="exports/card_manifest.json">card_manifest.json</a></p></article><article class="use-case"><h3>All CSV fallback</h3><p><a href="exports/customgpt_scheduler.csv">customgpt_scheduler.csv</a></p></article><article class="use-case"><h3>Publer Pinterest fallback</h3><p><a href="exports/publer_pinterest.csv">publer_pinterest.csv</a></p></article><article class="use-case"><h3>Metrics template</h3><p><a href="exports/metrics_template.csv">metrics_template.csv</a></p></article><article class="use-case"><h3>Optimization report</h3><p><a href="reports/optimization.html">optimization.html</a></p></article></div></section></main>`));
  fs.writeFileSync(path.join(root, "site/styles.css"), styles());
  fs.writeFileSync(path.join(root, "site/reports/optimization.html"), shell("Optimization Report", `<main><section class="hero"><div><p class="eyebrow">Optimization</p><h1>Funnel performance report</h1><p class="lede">No metrics imported yet. The automation is ready to collect traffic data.</p></div><aside class="offer"><strong>Next action</strong><p>Add Buffer credentials, publish the first queue, then track affiliate clicks and signups.</p></aside></section></main>`, "../"));
  fs.writeFileSync(path.join(root, "site/robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  fs.writeFileSync(path.join(root, "site/sitemap.xml"), sitemap());
  fs.writeFileSync(path.join(root, "site/.nojekyll"), "");
}

function shell(title, body, prefix = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><link rel="stylesheet" href="${prefix}styles.css"></head><body><header class="topbar"><a href="${prefix}index.html" class="brand">AI Assistant Offers</a><nav><a href="${prefix}pages/ecommerce.html">Ecommerce</a><a href="${prefix}pages/support.html">Support</a><a href="${prefix}distribution.html">Automation</a></nav></header>${body}<footer><p>Affiliate disclosure: this page contains affiliate links. If you sign up through a link, we may earn a commission at no extra cost to you.</p></footer></body></html>`;
}

function styles() {
  return `:root{--ink:#101828;--muted:#667085;--line:#d9e1ec;--paper:#f6f8fb;--accent:#0f8f80}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,Arial,sans-serif}a{color:inherit}.topbar{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px clamp(18px,5vw,64px);background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:2}.brand{font-weight:800;text-decoration:none}nav{display:flex;gap:14px;flex-wrap:wrap;color:var(--muted);font-size:14px}nav a{text-decoration:none}.hero{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:clamp(24px,5vw,64px);padding:clamp(48px,9vw,96px) clamp(18px,5vw,64px);align-items:center}.eyebrow{margin:0 0 12px;color:var(--accent);font-weight:800;text-transform:uppercase;font-size:13px}h1{max-width:920px;margin:0;font-size:clamp(40px,6vw,78px);line-height:.98;letter-spacing:0}.lede{max-width:760px;color:var(--muted);font-size:20px;line-height:1.55}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.button,.secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:8px;font-weight:800;text-decoration:none}.button{background:var(--ink);color:white}.secondary{border:1px solid var(--line);background:white}.offer,.use-case,.niche-link{border:1px solid var(--line);border-radius:8px;padding:18px;background:white}.offer{box-shadow:0 16px 50px rgba(16,24,40,.08)}.offer p,.band p,.niche-link span{color:var(--muted);line-height:1.5}.band{padding:48px clamp(18px,5vw,64px);border-top:1px solid var(--line);background:#fff}.band h2{margin:0 0 22px;font-size:clamp(28px,4vw,44px)}.grid,.niche-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.niche-link{text-decoration:none;display:grid;gap:8px}footer{padding:28px clamp(18px,5vw,64px);color:var(--muted);font-size:14px}@media(max-width:820px){.topbar{align-items:flex-start;flex-direction:column}.hero{grid-template-columns:1fr}h1{font-size:42px}}`;
}

function trackedUrl(niche, channel, topic, id) {
  const params = new URLSearchParams({ utm_source: slug(channel.name), utm_medium: channel.medium, utm_campaign: config.campaignName, utm_content: `${topic}_${id}` });
  return `${base}/pages/${niche}.html?${params.toString()}`;
}

function affiliateUrl(niche, topic, channel) {
  const params = new URLSearchParams({ coupon: config.couponCode, utm_source: "bridge_page", utm_medium: "affiliate_cta", utm_campaign: config.campaignName, utm_content: `${niche}_${topic}_${slug(channel)}` });
  return `${config.affiliateLink}${config.affiliateLink.includes("?") ? "&" : "?"}${params.toString()}`;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitePaths.map((item) => `  <url><loc>${base}${item}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>`;
}

function tomorrow() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function writeCsv(file, rows) {
  fs.writeFileSync(path.join(root, file), rows.map((row) => row.map(csv).join(",")).join("\n"));
}

function writeJson(file, value) {
  fs.writeFileSync(path.join(root, file), JSON.stringify(value, null, 2));
}

function weeklyReport() {
  return `# Weekly Funnel Report\n\nGenerated: ${new Date().toISOString()}\n\n- Content items: ${content.length - 1}\n- Buffer queue items: ${bufferQueue.length}\n- PNG cards: ${cardManifest.length}\n- Start date: ${startDate}\n\nNext: configure Buffer secrets and enable autopublish after one dry run.\n`;
}
