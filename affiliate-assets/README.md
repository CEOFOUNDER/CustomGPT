# CustomGPT.ai Affiliate Assets

Download approved assets from:

https://customgpt.firstpromoter.com/my-assets

Place the downloaded files or unzipped folders in this directory, then run:

```bash
node scripts/generate.js
```

The generator will:

- Copy supported files into `site/assets/brand/`
- Create `data/asset_manifest.csv`
- Use the first PNG or SVG asset as a brand mark on niche landing pages

Supported file types:

- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- `.svg`
- `.gif`
- `.pdf`
