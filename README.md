# CustomGPT.ai Affiliate Engine

This is a local-first, no-paid-tool funnel generator for continuously marketing CustomGPT.ai with your affiliate link and coupon.

It creates:

- Static landing pages under `site/`
- Tracked affiliate links in `data/links.csv`
- Content inventory in `data/content.csv`
- Scheduler CSVs under `exports/scheduler/`
- Social card SVGs under `assets/cards/`
- A lightweight weekly report under `reports/`

## Configure

Edit `config/campaign.json` if you need to change the affiliate link, coupon, site URL, niches, or posting cadence.

Current offer:

- Affiliate link: `https://customgpt.ai/?fpr=gilles37`
- Coupon code: `ONEMONTHFREE`
- Coupon framing: `$99 discount coupon`

## Generate Everything

```bash
node scripts/generate.js
```

If `npm` is available on the machine, `npm run generate` works too.

## Add Official Affiliate Assets

Download approved CustomGPT.ai assets from your FirstPromoter area:

https://customgpt.firstpromoter.com/my-assets

Put the downloaded files or unzipped folders into `affiliate-assets/`, then run:

```bash
node scripts/generate.js
```

The generator copies supported files into `site/assets/brand/` and creates `data/asset_manifest.csv`.

Open `site/index.html` in a browser to preview the hub page.

## Minimum-Intervention Workflow

1. Run `node scripts/generate.js`.
2. Publish the `site/` folder to GitHub Pages, Cloudflare Pages, Netlify, or any static host.
3. Upload `exports/scheduler/customgpt_scheduler.csv` to a social scheduler such as Buffer, Publer, Metricool, or Pinterest if supported.
4. Repeat weekly, or automate the command with Codex/GitHub Actions.

## Automation Loop

Daily:

- Generate new post ideas and tracked links.
- Create social card assets.

Weekly:

- Export a scheduler CSV.
- Review the report.
- Scale the strongest niche/topic.

Monthly:

- Add one new niche after ecommerce/support pages have had time to collect clicks.

## Compliance Notes

- Keep affiliate disclosure visible on every landing page.
- Do not claim guaranteed revenue, guaranteed support savings, or guaranteed conversions.
- Avoid automated posting into communities where self-promotion is not allowed.
- Keep CustomGPT.ai brand claims aligned with official materials.
