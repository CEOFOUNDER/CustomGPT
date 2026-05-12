const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config', 'campaign.json'), 'utf8'));
['site','site/pages','site/use-cases','site/exports','site/assets/brand','data','assets/cards','exports/scheduler','reports','affiliate-assets'].forEach((dir) => fs.mkdirSync(path.join(root, dir), { recursive: true }));

const topics = [
  ['faq-ai-assistant','Turn your FAQ page into an AI assistant','Visitors leave when simple questions take too long to answer.','Your FAQ page should not just sit there. It can answer customers instantly.'],
  ['shipping-questions','Answer shipping questions instantly','Shipping uncertainty creates support tickets and hesitation at checkout.','If customers keep asking where, when, and how much, your shipping page can do more.'],
  ['return-policy-chatbot','Make your return policy easier to understand','Policy pages are often ignored until the customer is already frustrated.','Turn your return policy into clear answers customers can ask in plain English.'],
  ['product-question-chatbot','Help customers choose the right product','Product confusion slows buying decisions.','An AI assistant trained on your product pages can answer fit, feature, and use-case questions.'],
  ['support-ticket-deflection','Reduce repetitive support tickets','Small teams lose hours answering the same questions.','Train an assistant on your help docs so routine answers happen before a ticket is opened.'],
  ['knowledge-base-search','Make your knowledge base conversational','Search boxes force customers to know the exact keyword.','Let people ask normal questions and get answers from your approved content.']
];
const channels = [['LinkedIn','social','text'], ['Pinterest','pin','card'], ['YouTube Shorts','shorts','script']];
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const csv = (s) => `"${String(s ?? '').replace(/"/g,'""')}"`;
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const addDays = (d,n) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10); };
const base = config.siteBaseUrl.replace(/\/$/, '');
const landingUrl = (niche, channel, topic, id) => `${base}/pages/${niche.slug}.html?utm_source=${slug(channel[0])}&utm_medium=${channel[1]}&utm_campaign=${config.campaignName}&utm_content=${topic[0]}_${id}`;
const affiliateUrl = (niche, topic, channel) => `${config.affiliateLink}&coupon=${config.couponCode}&utm_source=bridge_page&utm_medium=affiliate_cta&utm_campaign=${config.campaignName}&utm_content=${niche.slug}_${topic[0]}_${slug(channel[0])}`;

function collectAssets() {
  const src = path.join(root, config.brandAssetsDir || 'affiliate-assets');
  const out = path.join(root, 'site/assets/brand');
  const allowed = new Set(['.png','.jpg','.jpeg','.webp','.svg','.gif','.pdf']);
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (allowed.has(path.extname(entry.name).toLowerCase())) {
        const ext = path.extname(entry.name).toLowerCase();
        const name = slug(path.basename(entry.name, ext)) + ext;
        fs.copyFileSync(full, path.join(out, name));
        files.push({ source: path.relative(src, full), file: `site/assets/brand/${name}`, publicPath: `assets/brand/${name}`, extension: ext, size: fs.statSync(full).size });
      }
    }
  }
  if (fs.existsSync(src)) walk(src);
  return files;
}
const brandAssets = collectAssets();

function styles() { return `:root{color-scheme:light;--ink:#111827;--muted:#5d6675;--line:#e4e8f0;--paper:#f7f8fb;--surface:#fff;--accent:#16c784;--accent-dark:#0b8f60;--violet:#6655ff;--violet-soft:#f0edff;--mint-soft:#eafbf3}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--paper);color:var(--ink)}a{color:inherit}.topbar{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px clamp(18px,5vw,64px);border-bottom:1px solid var(--line);background:rgba(255,255,255,.92);backdrop-filter:blur(14px);position:sticky;top:0;z-index:5}.brand{font-weight:800;text-decoration:none}.brand-mark{display:block;max-width:180px;max-height:64px;object-fit:contain;margin-bottom:18px}nav{display:flex;flex-wrap:wrap;gap:14px;color:var(--muted);font-size:14px}nav a{text-decoration:none}.hero{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:clamp(24px,5vw,64px);padding:clamp(48px,9vw,96px) clamp(18px,5vw,64px);align-items:center}.eyebrow{margin:0 0 12px;color:var(--violet);font-weight:800;text-transform:uppercase;font-size:13px}h1{max-width:920px;margin:0;font-size:clamp(40px,6vw,78px);line-height:.98;letter-spacing:0}.lede{max-width:760px;color:var(--muted);font-size:20px;line-height:1.55}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.button,.secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:8px;font-weight:800;text-decoration:none}.button{background:var(--ink);color:white;box-shadow:0 12px 28px rgba(17,24,39,.16)}.button:hover{background:var(--accent-dark)}.secondary{border:1px solid var(--line);background:white;color:var(--ink)}.offer{border:1px solid var(--line);background:linear-gradient(145deg,var(--surface),var(--mint-soft));border-radius:8px;padding:22px;box-shadow:0 16px 50px rgba(17,24,39,.08)}.offer strong{display:block;margin-top:8px}.offer p{color:var(--muted);line-height:1.5}.band{padding:48px clamp(18px,5vw,64px);border-top:1px solid var(--line);background:#fff}.band.compact{background:linear-gradient(135deg,var(--paper),var(--violet-soft))}.band h2{margin:0 0 22px;font-size:clamp(28px,4vw,44px)}.band p{max-width:820px;color:var(--muted);font-size:18px;line-height:1.6}.grid,.niche-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.use-case,.niche-link{border:1px solid var(--line);border-radius:8px;padding:18px;background:var(--surface)}.use-case h3{margin:0 0 8px}.use-case p{font-size:15px;margin:0}.niche-link{text-decoration:none;display:grid;gap:8px}.niche-link span{color:var(--muted);line-height:1.45}footer{padding:28px clamp(18px,5vw,64px);color:var(--muted);font-size:14px}@media(max-width:820px){.topbar{align-items:flex-start;flex-direction:column}.hero{grid-template-columns:1fr}h1{font-size:42px}.lede{font-size:18px}}`; }
function cardSvg(title, niche) { return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#f7f8fb"/><circle cx="930" cy="150" r="210" fill="#eafbf3"/><circle cx="110" cy="1190" r="230" fill="#f0edff"/><rect x="70" y="70" width="940" height="1210" rx="28" fill="#fff" stroke="#e4e8f0" stroke-width="4"/><text x="110" y="170" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#6655ff">${esc(niche)}</text><foreignObject x="110" y="250" width="850" height="520"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:76px;line-height:1.03;font-weight:800;color:#111827">${esc(title)}</div></foreignObject><foreignObject x="110" y="800" width="850" height="180"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:36px;line-height:1.3;color:#5d6675">Train an AI assistant on your website, docs, FAQs, and product content.</div></foreignObject><rect x="110" y="1060" width="600" height="86" rx="14" fill="#111827"/><text x="142" y="1116" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff">Coupon: ${esc(config.couponCode)}</text><rect x="732" y="1060" width="110" height="86" rx="14" fill="#16c784"/><text x="110" y="1220" font-family="Arial,sans-serif" font-size="28" fill="#5d6675">Affiliate disclosure applies on landing page.</text></svg>`; }

function page(niche) {
  const hero = niche.slug === 'ecommerce' ? 'Turn your ecommerce site into an AI support assistant' : `Build an AI assistant for ${niche.name.toLowerCase()}`;
  const aff = affiliateUrl(niche, topics[0], channels[0]);
  const logo = brandAssets.find((a) => a.extension === '.svg' || a.extension === '.png');
  const logoHtml = logo ? `<img class="brand-mark" src="../${esc(logo.publicPath)}" alt="${esc(config.brandName)} asset">` : '';
  const cards = topics.map((t) => `<article class="use-case"><h3>${esc(t[1])}</h3><p>${esc(t[2])}</p></article>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(hero)} | CustomGPT.ai Offer</title><meta name="description" content="Use CustomGPT.ai to create an AI assistant trained on your website, docs, FAQs, and business content. Coupon code ${esc(config.couponCode)}."><link rel="stylesheet" href="../styles.css"></head><body><header class="topbar"><a href="../index.html" class="brand">AI Assistant Offers</a><nav><a href="ecommerce.html">Ecommerce</a><a href="support.html">Support</a><a href="agencies.html">Agencies</a></nav></header><main><section class="hero"><div>${logoHtml}<p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>${esc(hero)}</h1><p class="lede">CustomGPT.ai helps ${esc(niche.audience)} create no-code AI agents trained on their own websites, documents, help centers, and business content.</p><div class="actions"><a class="button" href="${esc(aff)}" rel="sponsored nofollow">Start with coupon ${esc(config.couponCode)}</a><a class="secondary" href="#use-cases">See use cases</a></div></div><aside class="offer"><strong>Best fit</strong><p>${esc(niche.audience)} with ${esc(niche.pain)}.</p><strong>Outcome</strong><p>${esc(niche.outcome)}.</p></aside></section><section id="use-cases" class="band"><h2>Use Cases Worth Testing First</h2><div class="grid">${cards}</div></section><section class="band compact"><h2>Why This Offer Converts</h2><p>Businesses already have valuable content scattered across websites, PDFs, help docs, product pages, and internal knowledge bases. CustomGPT.ai turns that content into a customer-facing assistant without a custom engineering project.</p><a class="button" href="${esc(aff)}" rel="sponsored nofollow">Try CustomGPT.ai with ${esc(config.couponCode)}</a></section></main><footer><p>Affiliate disclosure: this page contains affiliate links. If you sign up through a link, we may earn a commission at no extra cost to you.</p></footer></body></html>`;
}
function useCase(niche, topic) {
  const title = `${topic[1]} for ${niche.name}`;
  const aff = affiliateUrl(niche, topic, ['seo-use-case','seo','page']);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} | CustomGPT.ai</title><meta name="description" content="${esc(topic[2])} See how ${esc(niche.name.toLowerCase())} can use CustomGPT.ai with coupon ${esc(config.couponCode)}."><link rel="stylesheet" href="../styles.css"></head><body><header class="topbar"><a href="../index.html" class="brand">AI Assistant Offers</a><nav><a href="../pages/ecommerce.html">Ecommerce</a><a href="../pages/shopify.html">Shopify</a><a href="../pages/support.html">Support</a></nav></header><main><section class="hero"><div><p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>${esc(title)}</h1><p class="lede">${esc(topic[3])} ${esc(topic[2])}</p><div class="actions"><a class="button" href="${esc(aff)}" rel="sponsored nofollow">Try CustomGPT.ai with ${esc(config.couponCode)}</a><a class="secondary" href="../pages/${esc(niche.slug)}.html">View ${esc(niche.name)} funnel</a></div></div><aside class="offer"><strong>Use case</strong><p>${esc(niche.outcome)}.</p><strong>Suggested setup</strong><p>Train the assistant on approved website pages, help docs, PDFs, FAQs, product content, and policy pages.</p></aside></section><section class="band"><h2>What to Train It On</h2><div class="grid"><article class="use-case"><h3>Website pages</h3><p>Give visitors answers from approved public information.</p></article><article class="use-case"><h3>FAQs and policies</h3><p>Turn repeated questions into immediate, consistent responses.</p></article><article class="use-case"><h3>Product or service docs</h3><p>Help prospects understand fit, features, pricing, and next steps.</p></article></div></section><section class="band compact"><h2>Simple Test</h2><p>Start with one narrow assistant for this use case, publish it on a low-risk page, and measure clicks, questions, and qualified leads before expanding.</p><a class="button" href="${esc(aff)}" rel="sponsored nofollow">Start with coupon ${esc(config.couponCode)}</a></section></main><footer><p>Affiliate disclosure: this page contains affiliate links. If you sign up through a link, we may earn a commission at no extra cost to you.</p></footer></body></html>`;
}
function index() {
  const links = config.primaryNiches.map((n) => `<a class="niche-link" href="pages/${n.slug}.html"><strong>${esc(n.name)}</strong><span>${esc(n.outcome)}</span></a>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CustomGPT.ai AI Assistant Funnel</title><meta name="description" content="Find the right CustomGPT.ai use case and use coupon code ${esc(config.couponCode)}."><link rel="stylesheet" href="styles.css"></head><body><header class="topbar"><a href="index.html" class="brand">AI Assistant Offers</a><nav><a href="pages/ecommerce.html">Ecommerce</a><a href="pages/support.html">Support</a><a href="pages/agencies.html">Agencies</a></nav></header><main><section class="hero"><div><p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>Build an AI assistant trained on your business content</h1><p class="lede">Use CustomGPT.ai to turn websites, help docs, PDFs, product pages, and FAQs into a no-code AI assistant for customers or teams.</p><div class="actions"><a class="button" href="pages/ecommerce.html">Start with ecommerce</a><a class="secondary" href="pages/support.html">Support team use case</a></div></div><aside class="offer"><strong>Offer</strong><p>Use coupon code <b>${esc(config.couponCode)}</b> for the ${esc(config.couponLabel)}.</p><strong>Affiliate note</strong><p>Links on this site may earn a commission.</p></aside></section><section class="band"><h2>Choose a Use Case</h2><div class="niche-list">${links}</div></section></main><footer><p>Affiliate disclosure: this page contains affiliate links. If you sign up through a link, we may earn a commission at no extra cost to you.</p></footer></body></html>`;
}

const content = [['id','date','time','channel','niche','topic','post_text','landing_url','asset_file','status']];
const scheduler = [['Date','Time','Platform','Post Text','Link','Image File','Campaign','Notes']];
const links = [['id','niche','topic','channel','landing_url','affiliate_url']];
const sitePaths = ['/'];
let n = 1;
for (const niche of config.primaryNiches) {
  fs.writeFileSync(path.join(root, 'site/pages', `${niche.slug}.html`), page(niche));
  sitePaths.push(`/pages/${niche.slug}.html`);
  for (const topic of topics) {
    const uc = `${niche.slug}-${topic[0]}`;
    fs.writeFileSync(path.join(root, 'site/use-cases', `${uc}.html`), useCase(niche, topic));
    sitePaths.push(`/use-cases/${uc}.html`);
    for (const channel of channels) {
      const id = String(n).padStart(4, '0');
      const date = addDays(config.startDate, Math.floor((n - 1) / config.dailySlots.length));
      const time = config.dailySlots[(n - 1) % config.dailySlots.length];
      const url = landingUrl(niche, channel, topic, id);
      const post = channel[0] === 'YouTube Shorts' ? `${topic[3]}\n\nShow the problem in one sentence, then show the fix: train a CustomGPT.ai assistant on approved business content. End with coupon code ${config.couponCode}.` : `${topic[3]} ${topic[2]} CustomGPT.ai can turn approved business content into a no-code AI assistant. Use coupon code ${config.couponCode}.`;
      const asset = channel[2] === 'card' ? `assets/cards/${niche.slug}_${topic[0]}_${id}.svg` : '';
      if (asset) fs.writeFileSync(path.join(root, asset), cardSvg(topic[1], niche.name));
      content.push([id,date,time,channel[0],niche.name,topic[1],post,url,asset,'ready']);
      scheduler.push([date,time,channel[0],post,url,asset,config.campaignName,`${config.couponLabel}: ${config.couponCode}`]);
      links.push([id,niche.name,topic[1],channel[0],url,affiliateUrl(niche, topic, channel)]);
      n++;
    }
  }
}
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(root, 'site/index.html'), index());
fs.writeFileSync(path.join(root, 'site/styles.css'), styles());
fs.writeFileSync(path.join(root, 'site/.nojekyll'), '');
fs.writeFileSync(path.join(root, 'site/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
fs.writeFileSync(path.join(root, 'site/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitePaths.map((p) => `  <url>\n    <loc>${base}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}\n</urlset>`);
const schedulerCsv = scheduler.map((r) => r.map(csv).join(',')).join('\n');
const linksCsv = links.map((r) => r.map(csv).join(',')).join('\n');
fs.writeFileSync(path.join(root, 'data/content.csv'), content.map((r) => r.map(csv).join(',')).join('\n'));
fs.writeFileSync(path.join(root, 'exports/scheduler/customgpt_scheduler.csv'), schedulerCsv);
fs.writeFileSync(path.join(root, 'site/exports/customgpt_scheduler.csv'), schedulerCsv);
fs.writeFileSync(path.join(root, 'data/links.csv'), linksCsv);
fs.writeFileSync(path.join(root, 'site/exports/links.csv'), linksCsv);
fs.writeFileSync(path.join(root, 'data/metrics.csv'), [['date','content_id','impressions','clicks','affiliate_clicks','signups','notes'].map(csv).join(',')].join('\n'));
fs.writeFileSync(path.join(root, 'data/asset_manifest.csv'), [['source_file','site_file','extension','size_bytes'], ...brandAssets.map((a) => [a.source,a.file,a.extension,a.size])].map((r) => r.map(csv).join(',')).join('\n'));
fs.writeFileSync(path.join(root, 'reports/weekly_report.md'), `# Weekly Funnel Report\n\nGenerated: ${new Date().toISOString()}\n\n- Landing pages: ${config.primaryNiches.length + 1}\n- Programmatic use-case pages: ${config.primaryNiches.length * topics.length}\n- Content items: ${content.length - 1}\n- Scheduler rows: ${scheduler.length - 1}\n- Pinterest-style card assets: ${config.primaryNiches.length * topics.length}\n- Official affiliate/brand assets copied: ${brandAssets.length}\n`);
console.log(`Generated ${content.length - 1} content items.`);
console.log(`Generated ${config.primaryNiches.length * topics.length} use-case pages.`);
console.log(`Generated ${scheduler.length - 1} scheduler rows.`);
console.log(`Copied ${brandAssets.length} affiliate assets.`);
