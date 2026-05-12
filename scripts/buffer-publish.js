const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const queuePath = path.join(root, "site", "exports", "buffer_queue.json");
const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const apiKey = process.env.BUFFER_API_KEY || "";
const channelMap = parseJsonEnv("BUFFER_CHANNEL_MAP", {});
const includeChannels = new Set(splitEnv("BUFFER_CHANNELS", Object.keys(channelMap).join(",")));
const maxPosts = Number(process.env.BUFFER_MAX_POSTS || 10);
const mode = process.env.BUFFER_MODE || "addToQueue";
const dryRun = process.env.BUFFER_PUBLISH !== "true";

async function main() {
  const candidates = queue
    .filter((item) => includeChannels.has(item.channel))
    .filter((item) => channelMap[item.channel])
    .slice(0, maxPosts);

  if (!candidates.length) {
    console.log("No Buffer queue items matched BUFFER_CHANNEL_MAP/BUFFER_CHANNELS.");
    return;
  }

  if (dryRun) {
    console.log(`Dry run: ${candidates.length} posts would be submitted to Buffer.`);
    for (const item of candidates) {
      console.log(`[${item.channel}] ${item.id} ${item.topic} -> ${channelMap[item.channel]}`);
    }
    return;
  }

  if (!apiKey) throw new Error("BUFFER_API_KEY is required when BUFFER_PUBLISH=true.");

  const results = [];
  for (const item of candidates) {
    const result = await createPost(item, channelMap[item.channel]);
    results.push({ id: item.id, channel: item.channel, result });
    console.log(`[Buffer] ${item.id} ${item.channel}: ${JSON.stringify(result)}`);
  }

  fs.mkdirSync(path.join(root, "reports"), { recursive: true });
  fs.writeFileSync(path.join(root, "reports", "buffer_publish_log.json"), JSON.stringify({
    publishedAt: new Date().toISOString(),
    mode,
    count: results.length,
    results
  }, null, 2));
}

async function createPost(item, channelId) {
  const inputFields = [
    `text: ${gqlString(`${item.text}\n\n${item.link}`)}`,
    `channelId: ${gqlString(channelId)}`,
    "schedulingType: automatic",
    `mode: ${mode === "customScheduled" ? "customScheduled" : "addToQueue"}`,
    "source: \"customgpt-affiliate-engine\""
  ];

  if (mode === "customScheduled") {
    inputFields.push(`dueAt: ${gqlString(`${item.date}T${item.time}:00.000Z`)}`);
  }

  if (item.imageUrl) {
    inputFields.push(`assets: { images: [{ url: ${gqlString(item.imageUrl)}, metadata: { altText: ${gqlString(item.imageAlt)}, dimensions: { width: 1080, height: 1350 } } }] }`);
  }

  const query = `mutation CreatePost {
    createPost(input: {
      ${inputFields.join("\n      ")}
    }) {
      ... on PostActionSuccess {
        post { id text dueAt channelId assets { id mimeType source } }
      }
      ... on MutationError { message }
    }
  }`;

  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ query })
  });

  const body = await response.json();
  if (!response.ok || body.errors) {
    throw new Error(`Buffer API error: ${JSON.stringify(body)}`);
  }
  return body.data.createPost;
}

function parseJsonEnv(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${name} must be valid JSON. ${error.message}`);
  }
}

function splitEnv(name, fallback) {
  return String(process.env[name] || fallback || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function gqlString(value) {
  return JSON.stringify(String(value ?? ""));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
