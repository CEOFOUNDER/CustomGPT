const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const siteExports = path.join(root, "site", "exports");
const schedulerExports = path.join(root, "exports", "scheduler");
fs.mkdirSync(siteExports, { recursive: true });
fs.mkdirSync(schedulerExports, { recursive: true });

const input = path.join(siteExports, "customgpt_scheduler.csv");
const rows = parseCsv(fs.readFileSync(input, "utf8"));
const header = rows.shift();
const index = Object.fromEntries(header.map((name, i) => [name, i]));

const publerHeader = [
  "Date",
  "Text",
  "Link",
  "Media URL",
  "Title",
  "Label",
  "Alt text(s)",
  "Comment(s)",
  "Pin board, FB album, or Google category",
  "Post subtype",
  "CTA",
  "Reminder"
];

const byChannel = new Map();
const all = [["Channel", ...publerHeader]];

for (const row of rows) {
  const platform = row[index.Platform];
  if (!byChannel.has(platform)) byChannel.set(platform, [publerHeader]);

  const date = `${row[index.Date].replace(/-/g, "/")} ${row[index.Time]}`;
  const text = row[index["Post Text"]];
  const link = row[index.Link];
  const media = row[index["Image File"]];
  const title = firstSentence(text);
  const label = [row[index.Campaign], platform].filter(Boolean).join(", ");
  const publerRow = [
    date,
    text,
    link,
    media,
    title,
    label,
    title,
    "",
    "",
    platform === "YouTube Shorts" ? "Short" : "",
    "LEARN_MORE",
    platform === "YouTube Shorts" ? "TRUE" : ""
  ];

  all.push([platform, ...publerRow]);
  byChannel.get(platform).push(publerRow);
}

writeCsv(path.join(siteExports, "publer_all.csv"), all);
writeCsv(path.join(schedulerExports, "publer_all.csv"), all);

for (const [channel, channelRows] of byChannel) {
  const fileName = `publer_${slugify(channel)}.csv`;
  writeCsv(path.join(siteExports, fileName), channelRows);
  writeCsv(path.join(schedulerExports, fileName), channelRows);
}

const distributionPath = path.join(root, "site", "distribution.html");
let distribution = fs.readFileSync(distributionPath, "utf8");
if (!distribution.includes("publer_pinterest.csv")) {
  distribution = distribution.replace(
    "</div>\n    </section>\n    <section class=\"band compact\">",
    `        <article class="use-case"><h3>Publer Pinterest</h3><p><a href="exports/publer_pinterest.csv">publer_pinterest.csv</a></p></article>
        <article class="use-case"><h3>Publer LinkedIn</h3><p><a href="exports/publer_linkedin.csv">publer_linkedin.csv</a></p></article>
        <article class="use-case"><h3>Publer All</h3><p><a href="exports/publer_all.csv">publer_all.csv</a></p></article>
      </div>
    </section>
    <section class="band compact">`
  );
  fs.writeFileSync(distributionPath, distribution);
}

console.log(`Generated Publer exports for ${byChannel.size} channels.`);

function firstSentence(text) {
  return String(text).split(/[.!?]\s/)[0].slice(0, 120);
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function writeCsv(file, data) {
  fs.writeFileSync(file, data.map((row) => row.map(csv).join(",")).join("\n"));
}

function csv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((item) => item !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
