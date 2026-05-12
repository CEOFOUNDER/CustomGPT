# CustomGPT.ai Affiliate Engine

This repo is an API-first affiliate funnel for continuously marketing CustomGPT.ai with:

- GitHub Pages bridge pages
- Tracked landing links and affiliate links
- HTML-rendered PNG social cards
- Buffer API publishing
- CSV exports as a fallback only
- Weekly GitHub Actions automation

Current offer:

- Affiliate link: `https://customgpt.ai/?fpr=gilles37`
- Coupon code: `ONEMONTHFREE`
- Coupon framing: `$99 discount coupon`

## Operating Model

The intended machine-to-machine loop is:

```text
GitHub Actions
  -> generate landing pages and tracked links
  -> render PNG social cards
  -> create Buffer queue payload
  -> optionally submit posts to Buffer by API
  -> deploy the updated site to GitHub Pages
```

No browser uploads are required once Buffer is connected and credentials are saved.

## Local Commands

```bash
npm install
npx playwright install chromium
npm run build
```

Useful individual commands:

```bash
npm run generate
npm run render:cards
npm run publish:buffer
```

`npm run publish:buffer` is a dry run unless `BUFFER_PUBLISH=true` is set.

## GitHub Secrets And Variables

Required secret for live Buffer publishing:

- `BUFFER_API_KEY`: Buffer API key.
- `BUFFER_CHANNEL_MAP`: JSON object mapping generated channel names to Buffer channel IDs.

Example `BUFFER_CHANNEL_MAP`:

```json
{
  "Pinterest": "buffer_pinterest_channel_id",
  "LinkedIn": "buffer_linkedin_channel_id"
}
```

Recommended repository variables:

- `BUFFER_AUTOPUBLISH`: set to `true` only after the first dry run looks right.
- `BUFFER_CHANNELS`: comma-separated channel names, for example `Pinterest,LinkedIn`.
- `BUFFER_MAX_POSTS`: start with `5` or `10` to stay inside Buffer Free queue limits.
- `BUFFER_MODE`: use `addToQueue` for lowest-maintenance scheduling. `customScheduled` is supported but less forgiving.

## Buffer Setup

1. Create or use a Buffer account.
2. Connect Pinterest and LinkedIn channels.
3. Create a Pinterest board in Pinterest first, then ensure Buffer can publish to it.
4. Create a Buffer API key.
5. Run `npm run inspect:buffer` with `BUFFER_API_KEY` to find organization and channel IDs.
6. Add the IDs to `BUFFER_CHANNEL_MAP`.
7. Run the GitHub workflow once with `publish_to_buffer=false`.
8. Review the dry-run log.
9. Set `BUFFER_AUTOPUBLISH=true` when ready.

## Generated Outputs

- `site/`: GitHub Pages site.
- `site/assets/cards/*.png`: scheduler-ready social cards.
- `site/exports/buffer_queue.json`: machine-readable Buffer queue.
- `site/exports/customgpt_scheduler.csv`: fallback scheduler CSV.
- `site/exports/publer_*.csv`: fallback Publer CSVs.
- `data/card_manifest.json`: card render manifest.
- `data/links.csv`: tracked landing and affiliate URLs.
- `site/reports/optimization.html`: simple performance report.

## Schedule

`config/campaign.json` uses `"scheduleMode": "rolling"` by default. Each weekly run starts the generated queue from tomorrow, rather than reusing a stale fixed date. To freeze dates, set:

```json
"scheduleMode": "fixed"
```

## Compliance Notes

- Affiliate disclosure remains visible on every landing page.
- Do not claim guaranteed revenue, guaranteed support savings, or guaranteed conversions.
- Avoid automated posting into communities where self-promotion is not allowed.
- Keep CustomGPT.ai brand claims aligned with official materials.
