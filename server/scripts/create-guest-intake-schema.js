// One-time setup: creates the "Guest Intake" custom object in ActiveCampaign.
//   node scripts/create-guest-intake-schema.js --dry-run   # print the request, send nothing
//   node scripts/create-guest-intake-schema.js             # create it; prints the schema id
// Then set the printed id as AC_GUEST_INTAKE_SCHEMA_ID on Fly (fly secrets set ...).
// Uses ACTIVECAMPAIGN_BASE_URL and ACTIVECAMPAIGN_API_TOKEN from the environment / .env.
import "dotenv/config";

const BASE = (process.env.ACTIVECAMPAIGN_BASE_URL || process.env.ACTIVE_CAMPAIGN_API_URL || "").replace(/\/$/, "");
const TOKEN = process.env.ACTIVECAMPAIGN_API_TOKEN;
const dryRun = process.argv.includes("--dry-run");

const field = (id, label, type = "text", extra = {}) => ({
  id,
  labels: { singular: label, plural: label },
  type,
  ...extra,
});

const schema = {
  schema: {
    slug: "guest-intake",
    labels: { singular: "Guest Intake", plural: "Guest Intakes" },
    description: "Pre-recording intake from confirmed podcast guests (/guest-intake). Team use only.",
    fields: [
      field("first-name", "First Name", "text", { isRequired: true }),
      field("last-name", "Last Name", "text", { isRequired: true }),
      field("email", "Email", "text", { isRequired: true }),
      field("episode-id", "Episode ID", "text", { isRequired: true }),
      field("episode-title", "Episode", "text", { isRequired: true }),
      field("about-you", "About You", "textarea"),
      field("links", "Website / Social Links", "text"),
      field("drawn-to", "What Drew You to This Conversation", "textarea", { isRequired: true }),
      field("experience", "Experience or Perspective to Bring", "textarea"),
      field("hope-to-explore", "Hopes to Explore", "textarea"),
      field("avoid-topics", "Prefers Not to Discuss", "textarea"),
      field("tagging-consent", "OK to Tag in Clips/Photos", "dropdown", {
        isRequired: true,
        options: [{ value: "Yes" }, { value: "No" }, { value: "Please ask me first" }],
      }),
      field("anything-else", "Anything Else for Brett", "textarea"),
      field("submitted-at", "Submitted At", "datetime", { isRequired: true }),
      field("status", "Status", "dropdown", {
        options: [{ value: "New" }, { value: "Reviewed" }, { value: "Archived" }],
      }),
    ],
    relationships: [
      {
        id: "primary-contact",
        labels: { singular: "Primary Contact", plural: "Primary Contacts" },
        description: "The guest who submitted the intake",
        namespace: "contacts",
        hasMany: false,
      },
    ],
  },
};

if (dryRun) {
  console.log(`POST ${BASE || "<ACTIVECAMPAIGN_BASE_URL>"}/api/3/customObjects/schemas`);
  console.log(JSON.stringify(schema, null, 2));
  process.exit(0);
}
if (!BASE || !TOKEN) {
  console.error("Missing ACTIVECAMPAIGN_BASE_URL or ACTIVECAMPAIGN_API_TOKEN.");
  process.exit(1);
}

const res = await fetch(`${BASE}/api/3/customObjects/schemas`, {
  method: "POST",
  headers: { "Api-Token": TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify(schema),
});
const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`Failed (${res.status}):`, JSON.stringify(body, null, 2));
  process.exit(1);
}
console.log("Created Guest Intake schema. Set this on Fly:");
console.log(`  fly secrets set AC_GUEST_INTAKE_SCHEMA_ID=${body?.schema?.id}`);
