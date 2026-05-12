const apiKey = process.env.BUFFER_API_KEY || "";

if (!apiKey) {
  console.error("BUFFER_API_KEY is required.");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const organizations = await graph(`query GetOrganizations {
    account {
      email
      organizations {
        id
        name
        ownerEmail
      }
    }
  }`);

  const account = organizations.account;
  const result = { email: account.email, organizations: [] };

  for (const organization of account.organizations) {
    const channels = await graph(`query GetChannels {
      channels(input: { organizationId: ${JSON.stringify(organization.id)} }) {
        id
        name
        displayName
        service
        avatar
        isQueuePaused
      }
    }`);
    result.organizations.push({ ...organization, channels: channels.channels });
  }

  console.log(JSON.stringify(result, null, 2));
}

async function graph(query) {
  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ query })
  });
  const body = await response.json();
  if (!response.ok || body.errors) throw new Error(JSON.stringify(body));
  return body.data;
}
