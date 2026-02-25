import "dotenv/config";
import https from "https";

const ACTIVE_CAMPAIGN_API_URL = "https://ccs465.api-us1.com";
const ACTIVE_CAMPAIGN_API_KEY = "7f37dd7339013ac8d8209077ee8e0053b79710199f1d167c0b113e5672e652c89930f53f";

if (!ACTIVE_CAMPAIGN_API_URL || !ACTIVE_CAMPAIGN_API_KEY) {
  console.error("Missing ACTIVE_CAMPAIGN_API_URL or ACTIVE_CAMPAIGN_API_KEY.");
  process.exit(1);
}

const params = new URLSearchParams({
  api_action: "list_add",
  api_output: "json",
});

const body = new URLSearchParams({
  name: "Unscripted Room Website",
  sender_name: "Randal Yasar",
  sender_addr1: "21 Water Street, Suite 306",
  sender_city: "Amesbury",
  sender_zip: "01913",
  sender_country: "USA",
  sender_url: "https://unscriptedroom.com",
  sender_reminder: "You subscribed on the Unscripted Room website.",
});

const apiUrl = `${ACTIVE_CAMPAIGN_API_URL.replace(/\/$/, "")}/admin/api.php?${params.toString()}`;

const result = await new Promise((resolve, reject) => {
  const request = https.request(
    apiUrl,
    {
      method: "POST",
      headers: {
        "API-TOKEN": ACTIVE_CAMPAIGN_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body.toString()),
      },
    },
    (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`ActiveCampaign list_add failed: ${res.statusCode} ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse ActiveCampaign response: ${error.message}`));
        }
      });
    }
  );

  request.on("error", reject);
  request.write(body.toString());
  request.end();
});
console.log("ActiveCampaign list_add result:", result);
if (result?.id) {
  console.log(`List created. Set ACTIVE_CAMPAIGN_LIST_ID=${result.id}`);
}
