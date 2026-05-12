const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config', 'campaign.json'), 'utf8'));
const mkdir = (p) => fs.mkdirSync(path.join(root, p), { recursive: true });
['site/pages','site/assets/brand','data','exports/scheduler','reports','affiliate-assets'].forEach(mkdir);

const topics = [
  ['faq-ai-assistant','Turn your FAQ page into an AI assistant','Visitors leave when simple questions take too long to answer.','Your FAQ page should not just sit there. It can answer customers instantly.'],
  ['shipping-questions','Answer shipping questions instantly','Shipping uncertainty creates support tickets and hesitation at checkout.','If customers keep asking where, when, and how much, your shipping page can do more.'],
  ['return-policy-chatbot','Make your return policy easier to understand','Policy pages are often ignored until the customer is already frustrated.','Turn your return policy into clear answers customers can ask in plain English.'],
  ['product-question-chatbot','Help customers choose the right product','Product confusion slows buying decisions.','An AI assistant trained on your product pages can answer fit, feature, and use-case questions.'],
  ['support-ticket-deflection','Reduce repetitive support tickets','Small teams lose hours answering the same questions.','Train an assistant on your help docs so routine answers happen before a ticket is opened.'],
  ['knowledge-base-search','Make your knowledge base conversational','Search boxes force customers to know the exact keyword.','Let people ask normal questions and get answers from your approved content.']
];
const channels = [['LinkedIn','social'], ['Pinterest','pin'], ['YouTube Shorts','shorts']];
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const csv = (s) => `"${String(s ?? '').replace(/"/g,'""')}"`;
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const addDays = (d,n) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10); };
const siteUrl = config.siteBaseUrl.replace(/\/$/, '');
function landingUrl(niche, channel, topic, id) {
  return `${siteUrl}/pages/${niche.slug}.html?utm_source=${slug(channel[0])}&utm_medium=${channel[1]}&utm_campaign=${config.campaignName}&utm_content=${topic[0]}_${id}`;
}
function affiliateUrl(niche, topic, channel) {
  return `${config.affiliateLink}&coupon=${config.couponCode}&utm_source=bridge_page&utm_medium=affiliate_cta&utm_campaign=${config.campaignName}&utm_content=${niche.slug}_${topic[0]}_${slug(channel[0])}`;
}
function collectAssets() {
  const src = path.join(root, config.brandAssetsDir || 'affiliate-assets');
  const out = path.join(root, 'site/assets/brand');
  const allowed = new Set(['.png','.jpg','.jpeg','.webp','.svg','.gif','.pdf']);
  const files = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (allowed.has(path.extname(e.name).toLowerCase())) {
        const name = slug(path.basename(e.name, path.extname(e.name))) + path.extname(e.name).toLowerCase();
        fs.copyFileSync(full, path.join(out, name));
        files.push([path.relative(src, full), `site/assets/brand/${name}`, path.extname(e.name).toLowerCase(), fs.statSync(full).size]);
      }
    }
  }
  if (fs.existsSync(src)) walk(src);
  return files;
}
const brandAssets = collectAssets();
function styles() { return `:root{--ink:#17211b;--muted:#53635a;--line:#dce5df;--paper:#f8faf7;--accent:#0b6b4b;--accent-dark:#084832}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--paper);color:var(--ink)}a{color:inherit}.topbar{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px clamp(18px,5vw,64px);border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0}.brand{font-weight:800;text-decoration:none}.brand-mark{display:block;max-width:180px;max-height:64px;object-fit:contain;margin-bottom:18px}nav{display:flex;flex-wrap:wrap;gap:14px;color:var(--muted);font-size:14px}nav a{text-decoration:none}.hero{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:clamp(24px,5vw,64px);padding:clamp(48px,9vw,96px) clamp(18px,5vw,64px);align-items:center}.eyebrow{margin:0 0 12px;color:var(--accent-dark);font-weight:800;text-transform:uppercase;font-size:13px}h1{max-width:920px;margin:0;font-size:clamp(40px,6vw,78px);line-height:.98;letter-spacing:0}.lede{max-width:760px;color:var(--muted);font-size:20px;line-height:1.55}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.button,.secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:8px;font-weight:800;text-decoration:none}.button{background:var(--accent);color:white}.button:hover{background:var(--accent-dark)}.secondary{border:1px solid var(--line);background:white}.offer,.use-case,.niche-link{border:1px solid var(--line);background:white;border-radius:8px;padding:18px}.offer{box-shadow:0 16px 50px rgba(23,33,27,.08)}.offer p,.band p,.niche-link span{color:var(--muted);line-height:1.5}.band{padding:48px clamp(18px,5vw,64px);border-top:1px solid var(--line);background:#fff}.band h2{margin:0 0 22px;font-size:clamp(28px,4vw,44px)}.grid,.niche-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.use-case{background:var(--paper)}.use-case h3{margin:0 0 8px}.use-case p{font-size:15px;margin:0}.niche-link{text-decoration:none;display:grid;gap:8px}footer{padding:28px clamp(18px,5vw,64px);color:var(--muted);font-size:14px}@media(max-width:820px){.topbar{align-items:flex-start;flex-direction:column}.hero{grid-template-columns:1fr}h1{font-size:42px}.lede{font-size:18px}}`; }
function page(niche) {
  const aff = affiliateUrl(niche, topics[0], channels[0]);
  const logo = brandAssets.find(a => a[2] === '.svg' || a[2] === '.png');
  const logoHtml = logo ? `<img class="brand-mark" src="../${esc(logo[1].replace(/^site\//,''))}" alt="${esc(config.brandName)} asset">` : '';
  const cards = topics.map(t => `<article class="use-case"><h3>${esc(t[1])}</h3><p>${esc(t[2])}</p></article>`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(config.brandName)} for ${esc(niche.name)}</title><meta name="description" content="Create a no-code AI assistant trained on your own business content. Coupon ${esc(config.couponCode)}."><link rel="stylesheet" href="../styles.css"></head><body><header class="topbar"><a href="../index.html" class="brand">AI Assistant Offers</a><nav><a href="ecommerce.html">Ecommerce</a><a href="shopify.html">Shopify</a><a href="support.html">Support</a></nav></header><main><section class="hero"><div>${logoHtml}<p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>Build an AI assistant for ${esc(niche.name.toLowerCase())}</h1><p class="lede">CustomGPT.ai helps ${esc(niche.audience)} create no-code AI agents trained on websites, documents, help centers, FAQs, and business content.</p><div class="actions"><a class="button" href="${esc(aff)}" rel="sponsored nofollow">Start with coupon ${esc(config.couponCode)}</a><a class="secondary" href="#use-cases">See use cases</a></div></div><aside class="offer"><strong>Best fit</strong><p>${esc(niche.audience)} with ${esc(niche.pain)}.</p><strong>Outcome</strong><p>${esc(niche.outcome)}.</p></aside></section><section id="use-cases" class="band"><h2>Use Cases Worth Testing First</h2><div class="grid">${cards}</div></section><section class="band"><h2>Why This Offer Converts</h2><p>Businesses already have valuable content scattered across websites, PDFs, help docs, product pages, and internal knowledge bases. CustomGPT.ai turns that content into a customer-facing assistant without a custom engineering project.</p><a class="button" href="${esc(aff)}" rel="sponsored nofollow">Try CustomGPT.ai with ${esc(config.couponCode)}</a></section></main><footer><p>Affiliate disclosure: this page contains affiliate links. If you sign up through a link, we may earn a commission at no extra cost to you.</p></footer></body></html>`;
}
function index() {
  const links = config.primaryNiches.map(n => `<a class="niche-link" href="pages/${n.slug}.html"><strong>${esc(n.name)}</strong><span>${esc(n.outcome)}</span></a>`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CustomGPT.ai AI Assistant Offers</title><meta name="description" content="Find the right CustomGPT.ai use case and use coupon code ${esc(config.couponCode)}."><link rel="stylesheet" href="styles.css"></head><body><header class="topbar"><a href="index.html" class="brand">AI Assistant Offers</a><nav><a href="pages/ecommerce.html">Ecommerce</a><a href="pages/support.html">Support</a><a href="pages/agencies.html">Agencies</a></nav></header><main><section class="hero"><div><p class="eyebrow">${esc(config.couponLabel)}: ${esc(config.couponCode)}</p><h1>Build an AI assistant trained on your business content</h1><p class="lede">Use CustomGPT.ai to turn websites, help docs, PDFs, product pages, and FAQs into a no-code AI assistant for customers or teams.</p><div class="actions"><a class="button" href="pages/ecommerce.html">Start with ecommerce</a><a class="secondary" href="pages/support.html">Support team use case</a></div></div><aside class="offer"><strong>Offer</strong><p>Use coupon code <b>${esc(config.couponCode)}</b> for the ${esc(config.couponLabel)}.</p><strong>Affiliate note</strong><p>Links on this site may earn a commission.</p></aside></section><section class="band"><h2>Choose a Use Case</h2><div class="niche-list">${links}</div></section></main><footer><p>Affiliate disclosure: this page contains affiliate links. If you sign up through a link, we may earn a commission at no extra cost to you.</p></footer></body></html>`;
}
const content = [['id','date','time','channel','niche','topic','post_text','landing_url','asset_file','status']];
const scheduler = [['Date','Time','Platform','Post Text','Link','Image File','Campaign','Notes']];
const links = [['id','niche','topic','channel','landing_url','affiliate_url']];
let idn = 1;
for (const niche of config.primaryNiches) {
  fs.writeFileSync(path.join(root, 'site/pages', `${niche.slug}.html`), page(niche));
  for (const topic of topics) for (const channel of channels) {
    const id = String(idn).padStart(4,'0');
    const date = addDays(config.startDate, Math.floor((idn - 1) / config.dailySlots.length));
    const time = config.dailySlots[(idn - 1) % config.dailySlots.length];
    const post = channel[0] === 'YouTube Shorts' ? `${topic[3]}\n\nShow the problem, then show the fix: train a CustomGPT.ai assistant on approved business content. End with coupon ${config.couponCode}.` : `${topic[3]} ${topic[2]} CustomGPT.ai can turn approved business content into a no-code AI assistant. Use coupon code ${config.couponCode}.`;
    const url = landingUrl(niche, channel, topic, id);
    content.push([id,date,time,channel[0],niche.name,topic[1],post,url,'','ready']);
    scheduler.push([date,time,channel[0],post,url,'',config.campaignName,`${config.couponLabel}: ${config.couponCode}`]);
    links.push([id,niche.name,topic[1],channel[0],url,affiliateUrl(niche, topic, channel)]);
    idn++;
  }
}
fs.writeFileSync(path.join(root,'site/index.html'), index());
fs.writeFileSync(path.join(root,'site/styles.css'), styles());
fs.writeFileSync(path.join(root,'site/.nojekyll'), '');
fs.writeFileSync(path.join(root,'data/content.csv'), content.map(r=>r.map(csv).join(',')).join('\n'));
fs.writeFileSync(path.join(root,'data/links.csv'), links.map(r=>r.map(csv).join(',')).join('\n'));
fs.writeFileSync(path.join(root,'data/metrics.csv'), [['date','content_id','impressions','clicks','affiliate_clicks','signups','notes'].map(csv).join(',')].join('\n'));
fs.writeFileSync(path.join(root,'data/asset_manifest.csv'), [['source_file','site_file','extension','size_bytes'], ...brandAssets].map(r=>r.map(csv).join(',')).join('\n'));
fs.writeFileSync(path.join(root,'exports/scheduler/customgpt_scheduler.csv'), scheduler.map(r=>r.map(csv).join(',')).join('\n'));
fs.writeFileSync(path.join(root,'reports/weekly_report.md'), `# Weekly Funnel Report\n\nGenerated: ${new Date().toISOString()}\n\n- Landing pages: ${config.primaryNiches.length + 1}\n- Content items: ${content.length - 1}\n- Scheduler rows: ${scheduler.length - 1}\n- Official affiliate/brand assets copied: ${brandAssets.length}\n\nPublish the static site and import exports/scheduler/customgpt_scheduler.csv into your scheduler.\n`);
console.log(`Generated ${content.length - 1} content items.`);
console.log(`Generated ${scheduler.length - 1} scheduler rows.`);
console.log(`Copied ${brandAssets.length} affiliate assets.`);
