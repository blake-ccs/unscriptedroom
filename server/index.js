import "dotenv/config";
import cors from "cors";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import https from "https";

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://theunscriptedroom.com",
  "https://www.theunscriptedroom.com",
  "https://unscriptedroom.com",
  "https://www.unscriptedroom.com",
];
const submissionsDir = process.env.SUBMISSIONS_DIR || process.cwd();
const submissionsLogPath = path.join(submissionsDir, "submissions.txt");
const adminUser = "blake@ccs.global";
const adminPass = "uCantSeeMe914!!**$$";

const appendSubmission = (entry) => {
  const timestamp = new Date().toISOString();
  const payload = [`--- ${timestamp} ---`, entry, ""].join("\n");
  try {
    fs.mkdirSync(submissionsDir, { recursive: true });
  } catch (err) {
    console.error("Failed to ensure submissions directory", err);
  }
  fs.appendFile(submissionsLogPath, payload, (err) => {
    if (err) {
      console.error("Failed to append submission", err);
    }
  });
};

const requireBasicAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) {
    res.setHeader("WWW-Authenticate", "Basic realm=\"Submissions\"");
    return res.status(401).send("Unauthorized");
  }
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [user, pass] = decoded.split(":");
  if (user === adminUser && pass === adminPass) {
    return next();
  }
  res.setHeader("WWW-Authenticate", "Basic realm=\"Submissions\"");
  return res.status(401).send("Unauthorized");
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".netlify.app");
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

const ACTIVE_CAMPAIGN_API_URL = process.env.ACTIVE_CAMPAIGN_API_URL;
const ACTIVE_CAMPAIGN_API_KEY = process.env.ACTIVE_CAMPAIGN_API_KEY;
const ACTIVE_CAMPAIGN_LIST_ID = process.env.ACTIVE_CAMPAIGN_LIST_ID;
const ACTIVE_CAMPAIGN_MASTER_LIST_ID = process.env.ACTIVE_CAMPAIGN_MASTER_LIST_ID;
const AC_LIST_ID_REGISTER = process.env.ACTIVE_CAMPAIGN_LIST_ID_REGISTER;
const AC_LIST_ID_CONTACT = process.env.ACTIVE_CAMPAIGN_LIST_ID_CONTACT;
const normalizeFieldId = (value) => (value && value !== "0" ? value : null);
const AC_FIELD_DAYS = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_DAYS);
const AC_FIELD_TIMES = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_TIMES);
const AC_FIELD_CURIOSITY = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_CURIOSITY);
const AC_FIELD_HEARD_FROM = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_HEARD_FROM);
const AC_FIELD_ENVELOPE_WHERE = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_ENVELOPE_WHERE);
const AC_FIELD_CURIOSITY_REASON = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_CURIOSITY_REASON);
const AC_FIELD_SUPPORT_NOTES = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_SUPPORT_NOTES);
const AC_FIELD_UPDATES_OPTIN = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_UPDATES_OPTIN);
const AC_FIELD_AGE_CONFIRMED = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_AGE_CONFIRMED);
const AC_FIELD_CONTACT_SUBJECT = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_CONTACT_SUBJECT);
const AC_FIELD_CONTACT_MESSAGE = normalizeFieldId(process.env.ACTIVE_CAMPAIGN_FIELD_CONTACT_MESSAGE);
const AC_FIELD_PASSWORD = normalizeFieldId(process.env.AC_FIELD_PASSWORD);
console.log("SendGrid disabled. Using ActiveCampaign only.");

const ACTIVECAMPAIGN_BASE_URL = process.env.ACTIVECAMPAIGN_BASE_URL || process.env.ACTIVE_CAMPAIGN_API_URL;
const ACTIVECAMPAIGN_API_TOKEN = process.env.ACTIVECAMPAIGN_API_TOKEN;
const LEAD_STATUS_TOKEN_SECRET = process.env.LEAD_STATUS_TOKEN_SECRET;
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || LEAD_STATUS_TOKEN_SECRET;
const LEAD_STATUS_TOKEN_TTL_SECONDS = Number(process.env.LEAD_STATUS_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 30);
const CALENDLY_WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET;
const VIMEO_PAT = process.env.VIMEO_PAT;
const VIMEO_CLIENT_SECRET = process.env.VIMEO_CLIENT_SECRET;
const VIMEO_OAUTH_AUTHORIZE_URL = process.env.VIMEO_OAUTH_AUTHORIZE_URL;
const VIMEO_OAUTH_ACCESS_TOKEN_URL = process.env.VIMEO_OAUTH_ACCESS_TOKEN_URL;
const VIMEO_ALBUM_ID = process.env.VIMEO_ALBUM_ID;
const VIMEO_PROJECT_ID = process.env.VIMEO_PROJECT_ID;
const VIMEO_USER_ID = process.env.VIMEO_USER_ID;

const AC_FIELD_OFFER_REGISTERED = normalizeFieldId(process.env.AC_FIELD_OFFER_REGISTERED);
const AC_FIELD_LEAD_SOURCE = normalizeFieldId(process.env.AC_FIELD_LEAD_SOURCE);
const AC_FIELD_UTM_SOURCE = normalizeFieldId(process.env.AC_FIELD_UTM_SOURCE);
const AC_FIELD_UTM_MEDIUM = normalizeFieldId(process.env.AC_FIELD_UTM_MEDIUM);
const AC_FIELD_UTM_CAMPAIGN = normalizeFieldId(process.env.AC_FIELD_UTM_CAMPAIGN);
const AC_FIELD_UTM_CONTENT = normalizeFieldId(process.env.AC_FIELD_UTM_CONTENT);
const AC_FIELD_UTM_TERM = normalizeFieldId(process.env.AC_FIELD_UTM_TERM);
const AC_FIELD_CALENDLY_STATUS = normalizeFieldId(process.env.AC_FIELD_CALENDLY_STATUS);
const AC_FIELD_CALENDLY_EVENT_NAME = normalizeFieldId(process.env.AC_FIELD_CALENDLY_EVENT_NAME);
const AC_FIELD_CALENDLY_START_TIME = normalizeFieldId(process.env.AC_FIELD_CALENDLY_START_TIME);
const AC_FIELD_CALENDLY_END_TIME = normalizeFieldId(process.env.AC_FIELD_CALENDLY_END_TIME);
const AC_FIELD_CALENDLY_TIMEZONE = normalizeFieldId(process.env.AC_FIELD_CALENDLY_TIMEZONE);
const AC_FIELD_CALENDLY_LOCATION = normalizeFieldId(process.env.AC_FIELD_CALENDLY_LOCATION);
const AC_FIELD_CALENDLY_INVITEE_URI = normalizeFieldId(process.env.AC_FIELD_CALENDLY_INVITEE_URI);
const AC_FIELD_CALENDLY_EVENT_URI = normalizeFieldId(process.env.AC_FIELD_CALENDLY_EVENT_URI);
const AC_FIELD_CALENDLY_REBOOK_URI = normalizeFieldId(process.env.AC_FIELD_CALENDLY_REBOOK_URI);
const AC_SURVEY_SCHEMA_ID = process.env.AC_SURVEY_SCHEMA_ID;
const AC_CONTACT_MESSAGE_SCHEMA_ID = process.env.AC_CONTACT_MESSAGE_SCHEMA_ID;
const AC_COIN_SCHEMA_ID = process.env.AC_COIN_SCHEMA_ID;
const AC_COIN_FIELD_NAME = process.env.AC_COIN_FIELD_NAME || "%CO:transaction:name%";
const AC_COIN_FIELD_AMOUNT = process.env.AC_COIN_FIELD_AMOUNT || "%CO:transaction:amount%";
const AC_COIN_FIELD_TIMESTAMP = process.env.AC_COIN_FIELD_TIMESTAMP || "%CO:transaction:timestamp%";
const AC_COIN_FIELD_IS_SPEND = process.env.AC_COIN_FIELD_IS_SPEND || "%CO:transaction:isspend-1%";

const SURVEY_FIELD_IDS = {
  name: "name",
  q1: "1gybhrlf4",
  q2: "2-w6d7bvz",
  q3: "36-viem4s",
  q4: "4yf2xvqsj",
  q5: "5j5p4lzdj",
  q6: "6art2ykeq",
  q7: "7tj26hxy0",
  q8: "85y-plgfo",
  q9: "9v0yvn-q1",
  q10: "10",
  optional: "optional",
};
const CONTACT_MESSAGE_FIELD_IDS = {
  name: "name",
  email: "email",
  topic: "topic",
  message: "message",
};
const contactMessageSchemaCache = {
  schemaId: null,
  fields: null,
  expiresAt: 0,
};
const coinSchemaCache = {
  schemaId: null,
  fields: null,
  expiresAt: 0,
};

const normalizePerstag = (value) => String(value || "").replace(/%/g, "").toLowerCase();
const normalizeSchemaId = (value) => String(value || "").replace(/^schemas\//, "");

const getCoinFieldIds = async () => {
  const schemaId = normalizeSchemaId(AC_COIN_SCHEMA_ID);
  if (!schemaId) return null;
  const directAmount = String(AC_COIN_FIELD_AMOUNT || "").trim();
  const directTimestamp = String(AC_COIN_FIELD_TIMESTAMP || "").trim();
  const directName = String(AC_COIN_FIELD_NAME || "").trim();
  const isNumericId = (value) => value && /^[0-9]+$/.test(value);
  if (isNumericId(directAmount) && isNumericId(directTimestamp)) {
    return {
      schemaId,
      name: isNumericId(directName) ? directName : null,
      amount: directAmount,
      timestamp: directTimestamp,
    };
  }
  const now = Date.now();
  if (
    coinSchemaCache.schemaId === schemaId &&
    coinSchemaCache.fields &&
    coinSchemaCache.expiresAt > now
  ) {
    return coinSchemaCache.fields;
  }
  try {
    const response = await acV3Request(
      "GET",
      `/api/3/customObjects/schemas/${schemaId}`
    );
    const fields =
      response?.schema?.fields ||
      response?.schema?.data?.fields ||
      response?.fields ||
      response?.data?.fields ||
      [];
    const byPerstag = (target) =>
      fields.find((field) => normalizePerstag(field.perstag) === normalizePerstag(target));
    const byLabel = (target) =>
      fields.find((field) => normalizePerstag(field?.label) === normalizePerstag(target));
    const byId = (target) =>
      fields.find((field) => String(field.id || "").toLowerCase() === String(target || "").toLowerCase());
    const byContains = (needle) =>
      fields.find((field) => {
        const perstag = normalizePerstag(field?.perstag);
        const label = normalizePerstag(field?.label);
        return perstag.includes(needle) || label.includes(needle);
      });
    const resolve = (target, fallbackId, containsNeedle) =>
      byPerstag(target) || byLabel(target) || byId(fallbackId) || (containsNeedle ? byContains(containsNeedle) : null);
    const resolved = {
      schemaId,
      name: resolve(AC_COIN_FIELD_NAME, "name", "name")?.id || null,
      amount: resolve(AC_COIN_FIELD_AMOUNT, "amount", "amount")?.id || null,
      timestamp: resolve(AC_COIN_FIELD_TIMESTAMP, "timestamp", "timestamp")?.id || null,
      isSpend: resolve(AC_COIN_FIELD_IS_SPEND, "isSpend", "isspend")?.id || null,
    };
    if (!resolved.amount || !resolved.timestamp) {
      console.error("Coin schema fields unresolved", {
        schemaId,
        fields: fields.map((field) => ({
          id: field.id,
          label: field.label,
          perstag: field.perstag,
        })),
        resolved,
      });
    }
    coinSchemaCache.schemaId = schemaId;
    coinSchemaCache.fields = resolved;
    coinSchemaCache.expiresAt = now + 10 * 60 * 1000;
    return resolved;
  } catch (error) {
    console.error("Coin schema lookup failed", error?.message || error);
    return null;
  }
};

const createCoinTransaction = async ({ contactId, name, amount, timestamp, isSpend, externalId }) => {
  const ids = await getCoinFieldIds();
  if (!ids?.schemaId || !ids?.amount || !ids?.timestamp) {
    throw new Error("Coin schema or fields not configured.");
  }
  const fields = [
    ...(ids.name ? [{ id: ids.name, value: name || "" }] : []),
    { id: ids.amount, value: String(amount ?? 0) },
    { id: ids.timestamp, value: timestamp || new Date().toISOString() },
    ...(ids.isSpend ? [{ id: ids.isSpend, value: String(isSpend ? 1 : 0) }] : []),
  ];
  const record = {
    record: {
      externalId: externalId || `coin-${contactId}-${Date.now()}`,
      fields,
      relationships: {
        "primary-contact": [Number(contactId)],
      },
    },
  };
  return acV3Request("POST", `/api/3/customObjects/records/${ids.schemaId}`, record);
};

const listCoinTransactions = async (contactId) => {
  const ids = await getCoinFieldIds();
  if (!ids?.schemaId) {
    throw new Error("Coin schema not configured.");
  }
  const records = [];
  let page = 1;
  const perPage = 100;
  while (page <= 10) {
    const response = await acV3Request(
      "GET",
      `/api/3/customObjects/records/${ids.schemaId}?page=${page}&limit=${perPage}`
    );
    const batch = response?.records || response?.data || [];
    if (!Array.isArray(batch) || batch.length === 0) break;
    records.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  const matchesContact = (relationships) => {
    if (!relationships) return false;
    const rel = relationships["primary-contact"] || relationships.primaryContact || relationships["primary-contact[]"];
    if (!rel) return false;
    if (Array.isArray(rel)) {
      return rel.some((entry) => {
        if (entry === null || entry === undefined) return false;
        if (typeof entry === "object") {
          return String(entry.id || entry.contactId || "") === String(contactId);
        }
        return String(entry) === String(contactId);
      });
    }
    if (typeof rel === "object") {
      return String(rel.id || rel.contactId || "") === String(contactId);
    }
    return String(rel) === String(contactId);
  };
  const filtered = records.filter((record) => matchesContact(record?.relationships));
  return { records: filtered, fieldIds: ids };
};

const getCoinBalance = async (contactId) => {
  const { records, fieldIds } = await listCoinTransactions(contactId);
  let total = 0;
  records.forEach((record) => {
    const fields = record?.fields || [];
    const amountField = fields.find((field) => String(field.field) === String(fieldIds.amount));
    const spendField = fields.find((field) => String(field.field) === String(fieldIds.isSpend));
    let amountValue = Number(amountField?.value ?? 0);
    if (!fieldIds.amount || !amountField) {
      const numericField = fields.find((field) => Number.isFinite(Number(field?.value)));
      amountValue = Number(numericField?.value ?? 0);
    }
    const isSpendValue = Number(spendField?.value ?? 0);
    if (!Number.isFinite(amountValue)) return;
    if (fieldIds.isSpend && spendField) {
      if (isSpendValue === 1) {
        total -= Math.abs(amountValue);
      } else {
        total += Math.abs(amountValue);
      }
      return;
    }
    // Fallback if isSpend field is missing: infer by sign or name prefix.
    const nameField = fields.find((field) => String(field.field) === String(fieldIds.name));
    const nameValue = String(nameField?.value || "").toLowerCase();
    if (amountValue < 0 || nameValue.includes(":spend")) {
      total -= Math.abs(amountValue);
    } else {
      total += Math.abs(amountValue);
    }
  });
  return total;
};

const getContactFromRequest = async (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const payload = verifyAuthToken(token);
  const bodyEmail = req.body?.email ? normalizeEmail(String(req.body.email)) : null;
  const queryEmail = req.query?.email ? normalizeEmail(String(req.query.email)) : null;
  const email = payload?.email ? normalizeEmail(payload.email) : (bodyEmail || queryEmail);
  if (!email) return null;
  const contact = await getContactByEmail(email);
  if (contact?.id) return { contact, email };
  const created = await upsertContact({ email });
  if (!created?.id) return null;
  return { contact: created, email };
};

const getContactMessageFieldIds = async () => {
  if (!AC_CONTACT_MESSAGE_SCHEMA_ID) return CONTACT_MESSAGE_FIELD_IDS;
  const now = Date.now();
  if (
    contactMessageSchemaCache.schemaId === AC_CONTACT_MESSAGE_SCHEMA_ID &&
    contactMessageSchemaCache.fields &&
    contactMessageSchemaCache.expiresAt > now
  ) {
    return contactMessageSchemaCache.fields;
  }
  try {
    const response = await acV3Request(
      "GET",
      `/api/3/customObjects/schemas/${AC_CONTACT_MESSAGE_SCHEMA_ID}`
    );
    const fields = response?.schema?.fields || [];
    const resolved = {
      name: fields.find((f) => f.id === "name")?.id || CONTACT_MESSAGE_FIELD_IDS.name,
      email: fields.find((f) => f.id === "email")?.id || CONTACT_MESSAGE_FIELD_IDS.email,
      topic: fields.find((f) => f.id === "topic")?.id || CONTACT_MESSAGE_FIELD_IDS.topic,
      message: fields.find((f) => f.id === "message")?.id || CONTACT_MESSAGE_FIELD_IDS.message,
    };
    contactMessageSchemaCache.schemaId = AC_CONTACT_MESSAGE_SCHEMA_ID;
    contactMessageSchemaCache.fields = resolved;
    contactMessageSchemaCache.expiresAt = now + 10 * 60 * 1000;
    return resolved;
  } catch (error) {
    console.error("Contact message schema lookup failed", error?.message || error);
    return CONTACT_MESSAGE_FIELD_IDS;
  }
};
const AC_FIELD_LAST_BOOKING_UPDATED_AT = normalizeFieldId(process.env.AC_FIELD_LAST_BOOKING_UPDATED_AT);
const AC_FIELD_BOOKING_COUNT = normalizeFieldId(process.env.AC_FIELD_BOOKING_COUNT);
const AC_FIELD_PREFERRED_LANGUAGE = normalizeFieldId(process.env.AC_FIELD_PREFERRED_LANGUAGE);
const AC_FIELD_DATE_OF_BIRTH = normalizeFieldId(process.env.AC_FIELD_DATE_OF_BIRTH);
const AC_FIELD_GENDER = normalizeFieldId(process.env.AC_FIELD_GENDER);
const AC_FIELD_STREET_ADDRESS = normalizeFieldId(process.env.AC_FIELD_STREET_ADDRESS);
const AC_FIELD_CITY = normalizeFieldId(process.env.AC_FIELD_CITY);
const AC_FIELD_STATE_PROVINCE = normalizeFieldId(process.env.AC_FIELD_STATE_PROVINCE);
const AC_FIELD_ZIP_POSTAL_CODE = normalizeFieldId(process.env.AC_FIELD_ZIP_POSTAL_CODE);
const AC_FIELD_JOB_TITLE = normalizeFieldId(process.env.AC_FIELD_JOB_TITLE);
const AC_FIELD_COMPANY_NAME = normalizeFieldId(process.env.AC_FIELD_COMPANY_NAME);
const AC_FIELD_BIO_ABOUT_ME = normalizeFieldId(process.env.AC_FIELD_BIO_ABOUT_ME);
const AC_FIELD_INTERESTS_HOBBIES = normalizeFieldId(process.env.AC_FIELD_INTERESTS_HOBBIES);
const AC_FIELD_PREFERRED_COMMUNICATION_METHOD = normalizeFieldId(process.env.AC_FIELD_PREFERRED_COMMUNICATION_METHOD);
const AC_FIELD_LINKEDIN_PROFILE = normalizeFieldId(process.env.AC_FIELD_LINKEDIN_PROFILE);
const AC_FIELD_TWITTERX_HANDLE = normalizeFieldId(process.env.AC_FIELD_TWITTERX_HANDLE);
const AC_FIELD_INSTAGRAM_HANDLE = normalizeFieldId(process.env.AC_FIELD_INSTAGRAM_HANDLE);
const AC_FIELD_PREFERRED_DAY = normalizeFieldId(process.env.AC_FIELD_PREFERRED_DAY);
const AC_FIELD_PREFERRED_TIME = normalizeFieldId(process.env.AC_FIELD_PREFERRED_TIME);
const AC_FIELD_REASONS_FOR_SIGNUP = normalizeFieldId(process.env.AC_FIELD_REASONS_FOR_SIGNUP);
const AC_FIELD_REASONS_FOR_JOINING = normalizeFieldId(process.env.AC_FIELD_REASONS_FOR_JOINING);
const AC_FIELD_UR_EVENT_DATE_TIME = normalizeFieldId(process.env.AC_FIELD_UR_EVENT_DATE_TIME);
const AC_FIELD_TREVOR_EXAMPLE = normalizeFieldId(process.env.AC_FIELD_TREVOR_EXAMPLE);
const AC_FIELD_EVENT_DAY = normalizeFieldId(process.env.AC_FIELD_EVENT_DAY);
const AC_FIELD_CURIOSITY_IMPORTANCE = normalizeFieldId(process.env.AC_FIELD_CURIOSITY_IMPORTANCE);
const AC_FIELD_CURIOUS_TO_JOIN_TEXT = normalizeFieldId(process.env.AC_FIELD_CURIOUS_TO_JOIN_TEXT);
const AC_FIELD_ADDITIONAL_INFO = normalizeFieldId(process.env.AC_FIELD_ADDITIONAL_INFO);
const AC_FIELD_SUBSCRIBED_FOR_UPDATES = normalizeFieldId(process.env.AC_FIELD_SUBSCRIBED_FOR_UPDATES);

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 60);

const toCustomFieldKey = (fieldId) => (fieldId ? `field[${fieldId},0]` : null);

const addActiveCampaignContact = async ({ email, firstName, lastName, tags, listIds, listId, fields, ip4 }) => {
  if (!ACTIVE_CAMPAIGN_API_URL || !ACTIVE_CAMPAIGN_API_KEY) {
    console.warn("ActiveCampaign credentials not configured. Skipping contact_add.");
    return { skipped: true };
  }

  const params = new URLSearchParams({
    api_action: "contact_add",
    api_output: "json",
  });

  const body = new URLSearchParams({
    email,
    first_name: firstName || "",
    last_name: lastName || "",
    tags: tags || "",
    ip4: ip4 || "",
  });

  const effectiveListIds = [
    ...(listIds || []),
    ...(listId ? [listId] : []),
  ].filter(Boolean);
  effectiveListIds.forEach((id) => {
    body.append(`p[${id}]`, `${id}`);
    body.append(`status[${id}]`, "1");
  });

  Object.entries(fields || {}).forEach(([fieldId, value]) => {
    if (!fieldId || value === undefined || value === null || value === "") return;
    const key = toCustomFieldKey(fieldId);
    if (key) body.append(key, String(value));
  });

  const apiUrl = `${ACTIVE_CAMPAIGN_API_URL.replace(/\/$/, "")}/admin/api.php?${params.toString()}`;
  const payload = body.toString();

  return new Promise((resolve, reject) => {
    const request = https.request(
      apiUrl,
      {
        method: "POST",
        headers: {
          "API-TOKEN": ACTIVE_CAMPAIGN_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`ActiveCampaign contact_add failed: ${res.statusCode} ${data}`));
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
    request.write(payload);
    request.end();
  });
};

const acV3Request = async (method, endpoint, body) => {
  if (!ACTIVECAMPAIGN_BASE_URL || !ACTIVECAMPAIGN_API_TOKEN) {
    throw new Error("ActiveCampaign v3 credentials not configured.");
  }
  const base = ACTIVECAMPAIGN_BASE_URL.replace(/\/$/, "");
  const url = new URL(endpoint, base);
  const payload = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method,
        headers: {
          "Api-Token": ACTIVECAMPAIGN_API_TOKEN,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`ActiveCampaign v3 ${method} ${url.pathname} failed: ${res.statusCode} ${data}`));
            return;
          }
          if (!data) {
            resolve({});
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
    if (payload) request.write(payload);
    request.end();
  });
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
};

const createAuthToken = (email, ttlSeconds = 60 * 60 * 24 * 30) => {
  if (!AUTH_TOKEN_SECRET) return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = base64UrlEncode(JSON.stringify({ email, exp }));
  const signature = crypto.createHmac("sha256", AUTH_TOKEN_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifyAuthToken = (token) => {
  if (!AUTH_TOKEN_SECRET || !token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", AUTH_TOKEN_SECRET).update(payload).digest("base64url");
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(base64UrlDecode(payload));
    if (!data?.email || !data?.exp) return null;
    if (Date.now() / 1000 > data.exp) return null;
    return data;
  } catch (error) {
    return null;
  }
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
};

const verifyPassword = (password, stored) => {
  if (!stored || typeof stored !== "string") return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
};

const fieldIdCache = new Map();
const resolveFieldIdByPerstag = async (perstag) => {
  if (!perstag) return null;
  if (fieldIdCache.has(perstag)) return fieldIdCache.get(perstag);
  const response = await acV3Request("GET", `/api/3/fields?filters[perstag]=${encodeURIComponent(perstag)}`);
  const field = response?.fields?.[0];
  const id = field?.id ? String(field.id) : null;
  if (id) fieldIdCache.set(perstag, id);
  return id;
};

const resolvePasswordFieldId = async () => AC_FIELD_PASSWORD || (await resolveFieldIdByPerstag("PASSWORD"));

const getContactByEmail = async (email) => {
  const query = encodeURIComponent(email);
  const response = await acV3Request("GET", `/api/3/contacts?email=${query}&forceQuery=1`);
  const contacts = response?.contacts || [];
  if (!contacts.length) return null;
  const normalized = normalizeEmail(email);
  const exact = contacts.find((c) => normalizeEmail(c?.email) === normalized);
  return exact || contacts[0] || null;
};

const waitForContactVisible = async (contactId, retries = 3) => {
  if (!contactId) return false;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await acV3Request("GET", `/api/3/contacts/${contactId}`);
      if (response?.contact?.id) {
        return true;
      }
    } catch (error) {
      // swallow and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
};

const upsertContact = async ({ email, firstName, lastName, phone }) => {
  const existing = await getContactByEmail(email);
  if (existing?.id) {
    const updated = await acV3Request("PUT", `/api/3/contacts/${existing.id}`, {
      contact: {
        email,
        firstName: firstName || existing.firstName || "",
        lastName: lastName || existing.lastName || "",
        ...(phone ? { phone } : {}),
      },
    });
    return updated?.contact || existing;
  }

  const created = await acV3Request("POST", "/api/3/contacts", {
    contact: {
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      ...(phone ? { phone } : {}),
    },
  });
  return created?.contact;
};

const fieldIndexCache = {
  expiresAt: 0,
  idToPerstag: new Map(),
  perstagToId: new Map(),
};

const getFieldIndex = async () => {
  const now = Date.now();
  if (fieldIndexCache.expiresAt > now && fieldIndexCache.idToPerstag.size) {
    return fieldIndexCache;
  }
  const response = await acV3Request("GET", "/api/3/fields?limit=100");
  const fields = response?.fields || [];
  const idToPerstag = new Map();
  const perstagToId = new Map();
  fields.forEach((field) => {
    if (!field?.id || !field?.perstag) return;
    idToPerstag.set(String(field.id), String(field.perstag));
    perstagToId.set(String(field.perstag), String(field.id));
  });
  fieldIndexCache.idToPerstag = idToPerstag;
  fieldIndexCache.perstagToId = perstagToId;
  fieldIndexCache.expiresAt = now + 5 * 60 * 1000;
  return fieldIndexCache;
};

const getFieldValuesForContact = async (contactId) => {
  const response = await acV3Request("GET", `/api/3/contacts/${contactId}/fieldValues?limit=100`);
  const fieldValues = response?.fieldValues || [];
  const byId = new Map();
  fieldValues.forEach((fieldValue) => {
    if (fieldValue?.field && fieldValue.field !== "0") {
      byId.set(String(fieldValue.field), fieldValue);
    }
  });
  const { idToPerstag } = await getFieldIndex();
  const byPerstag = new Map();
  byId.forEach((fieldValue, fieldId) => {
    const perstag = idToPerstag.get(String(fieldId));
    if (perstag) byPerstag.set(perstag, fieldValue);
  });
  return { byId, byPerstag, idToPerstag };
};

const getFieldValue = (fieldMaps, perstag, fieldId) => {
  if (perstag && fieldMaps?.byPerstag?.has(perstag)) {
    return fieldMaps.byPerstag.get(perstag)?.value ?? null;
  }
  if (fieldId && fieldMaps?.byId?.has(String(fieldId))) {
    return fieldMaps.byId.get(String(fieldId))?.value ?? null;
  }
  return null;
};

const buildFieldDebug = (fieldMaps) => {
  if (!fieldMaps?.byId) return [];
  const rows = [];
  fieldMaps.byId.forEach((fieldValue, fieldId) => {
    const resolvedPerstag = fieldMaps?.idToPerstag?.get(String(fieldId)) || null;
    const value = fieldValue?.value ?? null;
    const isPassword = resolvedPerstag === "PASSWORD";
    rows.push({
      fieldId: String(fieldId),
      perstag: resolvedPerstag || null,
      value: isPassword ? "[redacted]" : value,
    });
  });
  return rows;
};

const upsertFieldValues = async (contactId, fields) => {
  const entries = Object.entries(fields || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (entries.length === 0) return;
  await Promise.all(
    entries.map(async ([fieldId, value]) => {
      const payload = { fieldValue: { contact: contactId, field: fieldId, value: String(value) } };
      await acV3Request("POST", "/api/3/fieldValues", payload);
    })
  );
};

const tagCache = new Map();
const tagLookupInFlight = new Map();
const tagIdToNameCache = new Map();

const normalizeTagName = (value) => String(value || "").trim().toLowerCase();

const findExistingTagId = async (tagName, { exhaustive = false } = {}) => {
  const normalized = normalizeTagName(tagName);
  if (!normalized) return null;

  const limit = 100;
  const maxPages = exhaustive ? 25 : 1;
  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * limit;
    const basePath = exhaustive ? `/api/3/tags?limit=${limit}&offset=${offset}` : `/api/3/tags?search=${encodeURIComponent(tagName)}&limit=${limit}`;
    const response = await acV3Request("GET", basePath);
    const tags = response?.tags || [];
    const existing = tags.find((tag) => normalizeTagName(tag?.tag) === normalized);
    if (existing?.id) return String(existing.id);
    if (!exhaustive || tags.length < limit) break;
  }
  return null;
};

const isDuplicateTagCreateError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("activecampaign v3 post /api/3/tags failed: 422") &&
    message.includes("duplicate entry") &&
    message.includes("em_tag.typetag")
  );
};

const ensureTagId = async (tagName) => {
  if (!tagName) return null;
  const cacheKey = normalizeTagName(tagName);
  if (!cacheKey) return null;
  if (tagCache.has(cacheKey)) return tagCache.get(cacheKey);
  if (tagLookupInFlight.has(cacheKey)) return tagLookupInFlight.get(cacheKey);

  const lookup = (async () => {
    const existingId = await findExistingTagId(tagName);
    if (existingId) {
      tagCache.set(cacheKey, existingId);
      return existingId;
    }

    try {
      const created = await acV3Request("POST", "/api/3/tags", { tag: { tag: tagName, tagType: "contact" } });
      const createdId = created?.tag?.id ? String(created.tag.id) : null;
      if (createdId) tagCache.set(cacheKey, createdId);
      return createdId;
    } catch (error) {
      if (!isDuplicateTagCreateError(error)) throw error;
      const recoveredId = (await findExistingTagId(tagName)) || (await findExistingTagId(tagName, { exhaustive: true }));
      if (recoveredId) {
        tagCache.set(cacheKey, recoveredId);
        console.warn("Tag already exists; recovered existing tag id after create conflict", { tagName, tagId: recoveredId });
        return recoveredId;
      }
      throw error;
    }
  })();

  tagLookupInFlight.set(cacheKey, lookup);
  try {
    return await lookup;
  } finally {
    tagLookupInFlight.delete(cacheKey);
  }
};

const getContactTags = async (contactId, { limit = 100, maxPages = 25 } = {}) => {
  if (!contactId) return [];
  const tags = [];
  let previousSignature = null;
  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * limit;
    const response = await acV3Request("GET", `/api/3/contacts/${contactId}/contactTags?limit=${limit}&offset=${offset}`);
    const batch = response?.contactTags || [];
    if (!batch.length) break;

    const signature = batch.map((tag) => String(tag?.id || "")).join(",");
    if (signature && signature === previousSignature) break;
    previousSignature = signature;

    tags.push(...batch);
    if (batch.length < limit) break;
  }
  return tags;
};

const addTagsToContact = async (contactId, tagNames) => {
  const tags = [...new Set((tagNames || []).filter(Boolean))];
  if (tags.length === 0) return;
  const current = await getContactTags(contactId);
  const existingTagIds = new Set(current.map((contactTag) => String(contactTag?.tag || "")));

  for (const tagName of tags) {
    const tagId = await ensureTagId(tagName);
    if (!tagId) {
      console.warn("Tag apply skipped (no tag id)", { contactId, tagName });
      continue;
    }
    const normalizedTagId = String(tagId);
    if (existingTagIds.has(normalizedTagId)) continue;

    const created = await acV3Request("POST", "/api/3/contactTags", {
      contactTag: { contact: contactId, tag: tagId },
    });
    if (!created?.contactTag?.id) {
      console.warn("Tag apply response missing id", { contactId, tagName, tagId });
    } else {
      existingTagIds.add(normalizedTagId);
      console.log("Tag applied", { contactId, tagName, tagId, contactTagId: created.contactTag.id });
    }
  }
};

const addTagsToContactNoCheck = async (contactId, tagNames) => {
  const tags = (tagNames || []).filter(Boolean);
  if (tags.length === 0) return;
  await Promise.all(
    tags.map(async (tagName) => {
      const tagId = await ensureTagId(tagName);
      if (!tagId) {
        console.warn("Tag apply skipped (no tag id)", { contactId, tagName });
        return;
      }
      await acV3Request("POST", "/api/3/contactTags", {
        contactTag: { contact: contactId, tag: tagId },
      });
      console.log("Tag applied (no-check)", { contactId, tagName, tagId });
    })
  );
};

const addTagsToContactWithRetry = async (contactId, tagNames, retries = 1) => {
  const tags = [...new Set((tagNames || []).filter(Boolean))];
  if (!tags.length) return;

  let remaining = tags;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await addTagsToContact(contactId, remaining);
      const appliedContactTags = await getContactTags(contactId);
      const appliedTagIds = new Set(
        appliedContactTags.map((contactTag) => String(contactTag?.tag || "")).filter(Boolean)
      );
      const missing = [];
      for (const tag of tags) {
        const tagId = await ensureTagId(tag);
        if (!tagId || !appliedTagIds.has(String(tagId))) {
          missing.push(tag);
        }
      }
      if (!missing.length) {
        console.log("Tag verify ok", { contactId, tags });
        return;
      }

      console.warn("Tag verify missing", { contactId, missing, attempt: attempt + 1 });
      if (attempt >= retries) {
        throw new Error(`Tag verification failed. Missing tags: ${missing.join(", ")}`);
      }
      remaining = missing;
    } catch (error) {
      if (attempt >= retries) throw error;
      console.warn("Tag apply retry", { contactId, attempt: attempt + 1, error: error?.message || error });
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
};

const resolveTagNameById = async (tagId) => {
  if (!tagId) return null;
  const id = String(tagId);
  if (tagIdToNameCache.has(id)) return tagIdToNameCache.get(id);
  const response = await acV3Request("GET", `/api/3/tags/${id}`);
  const tagName = response?.tag?.tag || null;
  if (tagName) tagIdToNameCache.set(id, tagName);
  return tagName;
};

const getContactTagNames = async (contactId) => {
  if (!contactId) return [];
  const contactTags = await getContactTags(contactId);
  const names = await Promise.all(
    contactTags.map(async (contactTag) => resolveTagNameById(contactTag?.tag))
  );
  return names.filter(Boolean);
};

const removeTagsFromContact = async (contactId, tagNames) => {
  const tags = (tagNames || []).filter(Boolean);
  if (tags.length === 0) return;
  const contactTags = await getContactTags(contactId);
  await Promise.all(
    tags.map(async (tagName) => {
      const tagId = await ensureTagId(tagName);
      if (!tagId) return;
      const matches = contactTags.filter((contactTag) => String(contactTag?.tag || "") === String(tagId));
      await Promise.all(
        matches.map((contactTag) => acV3Request("DELETE", `/api/3/contactTags/${contactTag.id}`))
      );
    })
  );
};

const STAGE_TAGS = {
  captured: "LIFECYCLE: Lead",
  nurturing: "LIFECYCLE: Engaged",
  booked: "LIFECYCLE: Registered",
  cancelled: "LIFECYCLE: Cancelled UR",
};
const SOURCE_TAG = "src:web";
const QR_SOURCE_TAG = "src: Envelope QR";
const UR_EVENT_DATE_TAG_PREFIX = "Event: UR - ";
const UR_HISTORY_BOOKED_TAG_PREFIX = "History: UR Booked - ";
const UR_HISTORY_CANCELLED_TAG_PREFIX = "History: UR Cancelled - ";
const UR_EVENT_BOOKED_ACTION_TAG = "ACTION: Booked UR";
const UR_EVENT_CANCELLED_ACTION_TAG = "ACTION: UR Cancelled";
const SURVEY_COMPLETED_ACTION_TAG = "Action: CompSurvey";

const buildNpiTagFromAttendAgain = (attendAgain) => {
  const normalized = String(attendAgain || "").trim().toLowerCase();
  if (normalized === "yes") return "NPI: 1";
  if (normalized === "maybe") return "NPI: 0";
  if (normalized === "no" || normalized === "not right now") return "NPI: -1";
  return null;
};

const buildPodcastInterestTag = (podcastAnswer) => {
  const normalized = String(podcastAnswer || "").trim().toLowerCase();
  return normalized === "yes" ? "INTEREST: Podguest" : null;
};

const buildAvailabilityTags = (availability) => {
  if (!Array.isArray(availability)) return [];
  const tags = new Set();
  availability.forEach((value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "weekday mornings") {
      tags.add("AVAIL: Weekdays");
      tags.add("AVAIL: AM");
    } else if (normalized === "weekday afternoons") {
      tags.add("AVAIL: Weekdays");
      tags.add("AVAIL: PM");
    } else if (normalized === "weekday evenings") {
      tags.add("AVAIL: Weekdays");
      tags.add("AVAIL: Evenings");
    } else if (normalized === "weekend mornings") {
      tags.add("AVAIL: Weekends");
      tags.add("AVAIL: AM");
    } else if (normalized === "weekend afternoons") {
      tags.add("AVAIL: Weekends");
      tags.add("AVAIL: PM");
    } else if (normalized === "weekend evenings") {
      tags.add("AVAIL: Weekends");
      tags.add("AVAIL: Evenings");
    } else if (normalized === "my availability varies" || normalized === "not sure yet") {
      tags.add("AVAIL: NP");
    }
  });
  return [...tags];
};

const resolveSourceTagForContact = async (contactId) => {
  if (!contactId) return SOURCE_TAG;
  try {
    const tagNames = await getContactTagNames(contactId);
    return tagNames.includes(QR_SOURCE_TAG) ? QR_SOURCE_TAG : SOURCE_TAG;
  } catch (error) {
    console.warn("Source tag resolution failed; defaulting to web", { contactId, error: error?.message || error });
    return SOURCE_TAG;
  }
};

const formatTagDate = (startTime, timezone) => {
  if (!startTime) return null;
  const date = new Date(startTime);
  if (Number.isNaN(date.getTime())) return null;
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
  } catch {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
  }

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
};

const buildUrEventDateTag = (startTime, timezone) => {
  const formatted = formatTagDate(startTime, timezone);
  return formatted ? `${UR_EVENT_DATE_TAG_PREFIX}${formatted}` : null;
};

const buildUrHistoryBookedTag = (startTime, timezone) => {
  const formatted = formatTagDate(startTime, timezone);
  return formatted ? `${UR_HISTORY_BOOKED_TAG_PREFIX}${formatted}` : null;
};

const buildUrHistoryCancelledTag = (startTime, timezone) => {
  const formatted = formatTagDate(startTime, timezone);
  return formatted ? `${UR_HISTORY_CANCELLED_TAG_PREFIX}${formatted}` : null;
};

const syncUrEventDateTags = async ({ contactId, startTime, timezone, cancelled = false, extraTags = [] }) => {
  if (!contactId) return;
  const tagNames = await getContactTagNames(contactId);
  const eventDateTags = tagNames.filter((tag) => tag.startsWith(UR_EVENT_DATE_TAG_PREFIX));

  const tagsToRemove = [
    ...eventDateTags,
    ...(cancelled ? [] : [UR_EVENT_CANCELLED_ACTION_TAG]),
  ].filter(Boolean);

  if (tagsToRemove.length) {
    await removeTagsFromContact(contactId, tagsToRemove);
  }

  if (cancelled) {
    await addTagsToContactWithRetry(contactId, [UR_EVENT_CANCELLED_ACTION_TAG, ...extraTags]);
    return;
  }

  const eventDateTag = buildUrEventDateTag(startTime, timezone);
  if (!eventDateTag) return;
  await addTagsToContactWithRetry(contactId, [eventDateTag, ...extraTags]);
};

const ensureContactTags = async ({ contactId, stage, extraTags = [] }) => {
  if (!contactId) return;
  await waitForContactVisible(contactId, 3);
  const sourceTag = await resolveSourceTagForContact(contactId);
  const baseTags = [sourceTag, stage ? STAGE_TAGS[stage] : null].filter(Boolean);
  const allTags = [...baseTags, ...(extraTags || [])].filter(Boolean);
  if (stage) {
    await applyStageTransition(contactId, stage);
  }
  if (allTags.length) {
    await addTagsToContactNoCheck(contactId, allTags);
  }
  if (sourceTag === QR_SOURCE_TAG) {
    await removeTagsFromContact(contactId, [SOURCE_TAG]);
  }
};

const hasBookingStatus = async (contactId) => {
  if (!AC_FIELD_CALENDLY_STATUS) return false;
  const fieldMap = await getFieldValuesForContact(contactId);
  const status = String(getFieldValue(fieldMap, "CALENDLYSTATUS", AC_FIELD_CALENDLY_STATUS) || "").toLowerCase();
  return status === "booked" || status === "cancelled" || status === "rescheduled";
};

const applyStageTransition = async (contactId, stage) => {
  if (!contactId || !stage) return;
  if ((stage === "captured" || stage === "nurturing") && (await hasBookingStatus(contactId))) {
    console.log("Stage update skipped due to existing booking", { contactId, stage });
    return;
  }
  const sourceTag = await resolveSourceTagForContact(contactId);
  const add = [sourceTag, STAGE_TAGS[stage]].filter(Boolean);
  const remove =
    stage === "nurturing"
      ? [STAGE_TAGS.captured]
      : stage === "booked"
        ? [STAGE_TAGS.captured, STAGE_TAGS.nurturing, STAGE_TAGS.cancelled]
        : stage === "cancelled"
          ? [STAGE_TAGS.captured, STAGE_TAGS.nurturing, STAGE_TAGS.booked]
          : [];
  await addTagsToContactNoCheck(contactId, add);
  if (sourceTag === QR_SOURCE_TAG) {
    remove.push(SOURCE_TAG);
  }
  if (remove.length) {
    await removeTagsFromContact(contactId, remove);
  }
};

const buildLeadFields = (payload) => ({
  ...(AC_FIELD_OFFER_REGISTERED ? { [AC_FIELD_OFFER_REGISTERED]: payload.offer } : {}),
  ...(AC_FIELD_LEAD_SOURCE ? { [AC_FIELD_LEAD_SOURCE]: payload.source || "web" } : {}),
  ...(AC_FIELD_UTM_SOURCE ? { [AC_FIELD_UTM_SOURCE]: payload.utmSource } : {}),
  ...(AC_FIELD_UTM_MEDIUM ? { [AC_FIELD_UTM_MEDIUM]: payload.utmMedium } : {}),
  ...(AC_FIELD_UTM_CAMPAIGN ? { [AC_FIELD_UTM_CAMPAIGN]: payload.utmCampaign } : {}),
  ...(AC_FIELD_UTM_CONTENT ? { [AC_FIELD_UTM_CONTENT]: payload.utmContent } : {}),
  ...(AC_FIELD_UTM_TERM ? { [AC_FIELD_UTM_TERM]: payload.utmTerm } : {}),
  ...(AC_FIELD_PREFERRED_LANGUAGE ? { [AC_FIELD_PREFERRED_LANGUAGE]: payload.preferredLanguage } : {}),
  ...(AC_FIELD_DATE_OF_BIRTH ? { [AC_FIELD_DATE_OF_BIRTH]: payload.dateOfBirth } : {}),
  ...(AC_FIELD_GENDER ? { [AC_FIELD_GENDER]: payload.gender } : {}),
  ...(AC_FIELD_STREET_ADDRESS ? { [AC_FIELD_STREET_ADDRESS]: payload.streetAddress } : {}),
  ...(AC_FIELD_CITY ? { [AC_FIELD_CITY]: payload.city } : {}),
  ...(AC_FIELD_STATE_PROVINCE ? { [AC_FIELD_STATE_PROVINCE]: payload.stateProvince } : {}),
  ...(AC_FIELD_ZIP_POSTAL_CODE ? { [AC_FIELD_ZIP_POSTAL_CODE]: payload.zipPostalCode } : {}),
  ...(AC_FIELD_JOB_TITLE ? { [AC_FIELD_JOB_TITLE]: payload.jobTitle } : {}),
  ...(AC_FIELD_COMPANY_NAME ? { [AC_FIELD_COMPANY_NAME]: payload.companyName } : {}),
  ...(AC_FIELD_BIO_ABOUT_ME ? { [AC_FIELD_BIO_ABOUT_ME]: payload.bioAboutMe } : {}),
  ...(AC_FIELD_INTERESTS_HOBBIES ? { [AC_FIELD_INTERESTS_HOBBIES]: payload.interestsHobbies } : {}),
  ...(AC_FIELD_PREFERRED_COMMUNICATION_METHOD
    ? { [AC_FIELD_PREFERRED_COMMUNICATION_METHOD]: payload.preferredCommunicationMethod }
    : {}),
  ...(AC_FIELD_LINKEDIN_PROFILE ? { [AC_FIELD_LINKEDIN_PROFILE]: payload.linkedInProfile } : {}),
  ...(AC_FIELD_TWITTERX_HANDLE ? { [AC_FIELD_TWITTERX_HANDLE]: payload.twitterXHandle } : {}),
  ...(AC_FIELD_INSTAGRAM_HANDLE ? { [AC_FIELD_INSTAGRAM_HANDLE]: payload.instagramHandle } : {}),
  ...(AC_FIELD_PREFERRED_DAY ? { [AC_FIELD_PREFERRED_DAY]: payload.preferredDay } : {}),
  ...(AC_FIELD_PREFERRED_TIME ? { [AC_FIELD_PREFERRED_TIME]: payload.preferredTime } : {}),
  ...(AC_FIELD_REASONS_FOR_SIGNUP ? { [AC_FIELD_REASONS_FOR_SIGNUP]: payload.reasonsForSignup } : {}),
  ...(AC_FIELD_REASONS_FOR_JOINING ? { [AC_FIELD_REASONS_FOR_JOINING]: payload.reasonsForJoining } : {}),
  ...(AC_FIELD_UR_EVENT_DATE_TIME ? { [AC_FIELD_UR_EVENT_DATE_TIME]: payload.urEventDateTime } : {}),
  ...(AC_FIELD_TREVOR_EXAMPLE ? { [AC_FIELD_TREVOR_EXAMPLE]: payload.trevorExample } : {}),
  ...(AC_FIELD_EVENT_DAY ? { [AC_FIELD_EVENT_DAY]: payload.eventDay } : {}),
});

const buildCalendlyFields = (payload) => ({
  ...(AC_FIELD_CALENDLY_STATUS ? { [AC_FIELD_CALENDLY_STATUS]: payload.status } : {}),
  ...(AC_FIELD_CALENDLY_EVENT_NAME ? { [AC_FIELD_CALENDLY_EVENT_NAME]: payload.eventName } : {}),
  ...(AC_FIELD_CALENDLY_START_TIME ? { [AC_FIELD_CALENDLY_START_TIME]: payload.startTime } : {}),
  ...(AC_FIELD_CALENDLY_END_TIME ? { [AC_FIELD_CALENDLY_END_TIME]: payload.endTime } : {}),
  ...(AC_FIELD_CALENDLY_TIMEZONE ? { [AC_FIELD_CALENDLY_TIMEZONE]: payload.timezone } : {}),
  ...(AC_FIELD_CALENDLY_LOCATION ? { [AC_FIELD_CALENDLY_LOCATION]: payload.location } : {}),
  ...(AC_FIELD_CALENDLY_INVITEE_URI ? { [AC_FIELD_CALENDLY_INVITEE_URI]: payload.inviteeUri } : {}),
  ...(AC_FIELD_CALENDLY_EVENT_URI ? { [AC_FIELD_CALENDLY_EVENT_URI]: payload.eventUri } : {}),
  ...(AC_FIELD_CALENDLY_REBOOK_URI ? { [AC_FIELD_CALENDLY_REBOOK_URI]: payload.rescheduleUrl } : {}),
  ...(AC_FIELD_LAST_BOOKING_UPDATED_AT ? { [AC_FIELD_LAST_BOOKING_UPDATED_AT]: payload.lastUpdatedAt } : {}),
  ...(AC_FIELD_BOOKING_COUNT ? { [AC_FIELD_BOOKING_COUNT]: payload.bookingCount } : {}),
});

const buildProfileFields = (payload) => ({
  ...(AC_FIELD_LEAD_SOURCE ? { [AC_FIELD_LEAD_SOURCE]: payload.leadSource } : {}),
  ...(AC_FIELD_PREFERRED_LANGUAGE ? { [AC_FIELD_PREFERRED_LANGUAGE]: payload.preferredLanguage } : {}),
  ...(AC_FIELD_DATE_OF_BIRTH ? { [AC_FIELD_DATE_OF_BIRTH]: payload.dateOfBirth } : {}),
  ...(AC_FIELD_GENDER ? { [AC_FIELD_GENDER]: payload.gender } : {}),
  ...(AC_FIELD_STREET_ADDRESS ? { [AC_FIELD_STREET_ADDRESS]: payload.streetAddress } : {}),
  ...(AC_FIELD_CITY ? { [AC_FIELD_CITY]: payload.city } : {}),
  ...(AC_FIELD_STATE_PROVINCE ? { [AC_FIELD_STATE_PROVINCE]: payload.stateProvince } : {}),
  ...(AC_FIELD_ZIP_POSTAL_CODE ? { [AC_FIELD_ZIP_POSTAL_CODE]: payload.zipPostalCode } : {}),
  ...(AC_FIELD_JOB_TITLE ? { [AC_FIELD_JOB_TITLE]: payload.jobTitle } : {}),
  ...(AC_FIELD_COMPANY_NAME ? { [AC_FIELD_COMPANY_NAME]: payload.companyName } : {}),
  ...(AC_FIELD_BIO_ABOUT_ME ? { [AC_FIELD_BIO_ABOUT_ME]: payload.bioAboutMe } : {}),
  ...(AC_FIELD_INTERESTS_HOBBIES ? { [AC_FIELD_INTERESTS_HOBBIES]: payload.interestsHobbies } : {}),
  ...(AC_FIELD_PREFERRED_COMMUNICATION_METHOD
    ? { [AC_FIELD_PREFERRED_COMMUNICATION_METHOD]: payload.preferredCommunicationMethod }
    : {}),
  ...(AC_FIELD_LINKEDIN_PROFILE ? { [AC_FIELD_LINKEDIN_PROFILE]: payload.linkedInProfile } : {}),
  ...(AC_FIELD_TWITTERX_HANDLE ? { [AC_FIELD_TWITTERX_HANDLE]: payload.twitterXHandle } : {}),
  ...(AC_FIELD_INSTAGRAM_HANDLE ? { [AC_FIELD_INSTAGRAM_HANDLE]: payload.instagramHandle } : {}),
  ...(AC_FIELD_PREFERRED_DAY ? { [AC_FIELD_PREFERRED_DAY]: payload.preferredDay } : {}),
  ...(AC_FIELD_PREFERRED_TIME ? { [AC_FIELD_PREFERRED_TIME]: payload.preferredTime } : {}),
  ...(AC_FIELD_REASONS_FOR_SIGNUP ? { [AC_FIELD_REASONS_FOR_SIGNUP]: payload.reasonsForSignup } : {}),
  ...(AC_FIELD_REASONS_FOR_JOINING ? { [AC_FIELD_REASONS_FOR_JOINING]: payload.reasonsForJoining } : {}),
  ...(AC_FIELD_UR_EVENT_DATE_TIME ? { [AC_FIELD_UR_EVENT_DATE_TIME]: payload.urEventDateTime } : {}),
  ...(AC_FIELD_TREVOR_EXAMPLE ? { [AC_FIELD_TREVOR_EXAMPLE]: payload.trevorExample } : {}),
  ...(AC_FIELD_EVENT_DAY ? { [AC_FIELD_EVENT_DAY]: payload.eventDay } : {}),
  ...(AC_FIELD_UTM_SOURCE ? { [AC_FIELD_UTM_SOURCE]: payload.utmSource } : {}),
  ...(AC_FIELD_UTM_MEDIUM ? { [AC_FIELD_UTM_MEDIUM]: payload.utmMedium } : {}),
  ...(AC_FIELD_UTM_CAMPAIGN ? { [AC_FIELD_UTM_CAMPAIGN]: payload.utmCampaign } : {}),
  ...(AC_FIELD_UTM_CONTENT ? { [AC_FIELD_UTM_CONTENT]: payload.utmContent } : {}),
  ...(AC_FIELD_UTM_TERM ? { [AC_FIELD_UTM_TERM]: payload.utmTerm } : {}),
});

const buildStatusResponse = (contact, fieldMap) => ({
  contact: {
    id: contact?.id || null,
    firstName: contact?.firstName || null,
    lastName: contact?.lastName || null,
    email: contact?.email || null,
    phone: contact?.phone || null,
  },
  offer: getFieldValue(fieldMap, "OFFER_REGISTERED", AC_FIELD_OFFER_REGISTERED),
  calendlyStatus: getFieldValue(fieldMap, "CALENDLYSTATUS", AC_FIELD_CALENDLY_STATUS),
  eventName: getFieldValue(fieldMap, "CALENDLYEVENTNAME", AC_FIELD_CALENDLY_EVENT_NAME),
  startTime: getFieldValue(fieldMap, "CALENDLYSTARTTIME", AC_FIELD_CALENDLY_START_TIME),
  endTime: getFieldValue(fieldMap, "CALENDLYENDTIME", AC_FIELD_CALENDLY_END_TIME),
  timezone: getFieldValue(fieldMap, "CALENDLYTZ", AC_FIELD_CALENDLY_TIMEZONE),
  location: getFieldValue(fieldMap, "CALENDLYLOCATION", AC_FIELD_CALENDLY_LOCATION),
  rescheduleUrl: getFieldValue(
    fieldMap,
    "CALENDLYREBOOKURI",
    AC_FIELD_CALENDLY_REBOOK_URI || AC_FIELD_CALENDLY_INVITEE_URI
  ),
  calendlyEventUri: getFieldValue(fieldMap, "CALENDLYEVENTURI", AC_FIELD_CALENDLY_EVENT_URI),
  generalDetails: {
    leadSource: getFieldValue(fieldMap, "LEAD_SOURCE", AC_FIELD_LEAD_SOURCE),
    preferredLanguage: getFieldValue(fieldMap, "PREFERRED_LANGUAGE", AC_FIELD_PREFERRED_LANGUAGE),
    dateOfBirth: getFieldValue(fieldMap, "DATE_OF_BIRTH", AC_FIELD_DATE_OF_BIRTH),
    gender: getFieldValue(fieldMap, "GENDER", AC_FIELD_GENDER),
    streetAddress: getFieldValue(fieldMap, "STREET_ADDRESS", AC_FIELD_STREET_ADDRESS),
    city: getFieldValue(fieldMap, "CITY", AC_FIELD_CITY),
    stateProvince: getFieldValue(fieldMap, "STATEPROVINCE", AC_FIELD_STATE_PROVINCE),
    zipPostalCode: getFieldValue(fieldMap, "ZIPPOSTAL_CODE", AC_FIELD_ZIP_POSTAL_CODE),
    jobTitle: getFieldValue(fieldMap, "JOB_TITLE", AC_FIELD_JOB_TITLE),
    companyName: getFieldValue(fieldMap, "COMPANY_NAME", AC_FIELD_COMPANY_NAME),
    bioAboutMe: getFieldValue(fieldMap, "BIOABOUT_ME", AC_FIELD_BIO_ABOUT_ME),
    interestsHobbies: getFieldValue(fieldMap, "INTERESTSHOBBIES", AC_FIELD_INTERESTS_HOBBIES),
    preferredCommunicationMethod: getFieldValue(
      fieldMap,
      "PREFERRED_COMMUNICATION_METHOD",
      AC_FIELD_PREFERRED_COMMUNICATION_METHOD
    ),
    linkedInProfile: getFieldValue(fieldMap, "LINKEDIN_PROFILE", AC_FIELD_LINKEDIN_PROFILE),
    twitterXHandle: getFieldValue(fieldMap, "TWITTERX_HANDLE", AC_FIELD_TWITTERX_HANDLE),
    instagramHandle: getFieldValue(fieldMap, "INSTAGRAM_HANDLE", AC_FIELD_INSTAGRAM_HANDLE),
    preferredDay: getFieldValue(fieldMap, "PREFERRED_DAY", AC_FIELD_PREFERRED_DAY),
    preferredTime: getFieldValue(fieldMap, "PREFERRED_TIME", AC_FIELD_PREFERRED_TIME),
    reasonsForSignup: getFieldValue(fieldMap, "REASONS_FOR_SIGNUP", AC_FIELD_REASONS_FOR_SIGNUP),
    reasonsForJoining: getFieldValue(fieldMap, "REASONS_FOR_JOINING", AC_FIELD_REASONS_FOR_JOINING),
    urEventDateTime: getFieldValue(fieldMap, "UR_EVENT_DATE_TIME", AC_FIELD_UR_EVENT_DATE_TIME),
    trevorExample: getFieldValue(fieldMap, "TREVOR_EXAMPLE", AC_FIELD_TREVOR_EXAMPLE),
    eventDay: getFieldValue(fieldMap, "EVENTDAY", AC_FIELD_EVENT_DAY),
    utmSource: getFieldValue(fieldMap, "UTM_SOURCE", AC_FIELD_UTM_SOURCE),
    utmMedium: getFieldValue(fieldMap, "UTM_MEDIUM", AC_FIELD_UTM_MEDIUM),
    utmCampaign: getFieldValue(fieldMap, "UTM_CAMPAIGN", AC_FIELD_UTM_CAMPAIGN),
    utmContent: getFieldValue(fieldMap, "UTM_CONTENT", AC_FIELD_UTM_CONTENT),
    utmTerm: getFieldValue(fieldMap, "UTM_TERM", AC_FIELD_UTM_TERM),
  },
  bookingDetails: {
    status: getFieldValue(fieldMap, "CALENDLYSTATUS", AC_FIELD_CALENDLY_STATUS),
    eventName: getFieldValue(fieldMap, "CALENDLYEVENTNAME", AC_FIELD_CALENDLY_EVENT_NAME),
    startTime: getFieldValue(fieldMap, "CALENDLYSTARTTIME", AC_FIELD_CALENDLY_START_TIME),
    endTime: getFieldValue(fieldMap, "CALENDLYENDTIME", AC_FIELD_CALENDLY_END_TIME),
    timezone: getFieldValue(fieldMap, "CALENDLYTZ", AC_FIELD_CALENDLY_TIMEZONE),
    location: getFieldValue(fieldMap, "CALENDLYLOCATION", AC_FIELD_CALENDLY_LOCATION),
    inviteeUri: getFieldValue(fieldMap, "CALENDLYINVITEEURI", AC_FIELD_CALENDLY_INVITEE_URI),
    rescheduleUrl: getFieldValue(fieldMap, "CALENDLYREBOOKURI", AC_FIELD_CALENDLY_REBOOK_URI),
    eventUri: getFieldValue(fieldMap, "CALENDLYEVENTURI", AC_FIELD_CALENDLY_EVENT_URI),
  },
});

const createLeadStatusToken = (email) => {
  if (!LEAD_STATUS_TOKEN_SECRET) return null;
  const payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + LEAD_STATUS_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", LEAD_STATUS_TOKEN_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
};

const verifyLeadStatusToken = (token) => {
  if (!LEAD_STATUS_TOKEN_SECRET || !token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expected = crypto
    .createHmac("sha256", LEAD_STATUS_TOKEN_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (!payload?.email || !payload?.exp) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
};

const leadRateLimit = new Map();
const rateLimit = (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const entry = leadRateLimit.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  entry.count += 1;
  leadRateLimit.set(key, entry);
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  return next();
};

const webhookEventCache = new Map();
const rememberWebhookEvent = (eventId, ttlMs = 1000 * 60 * 60 * 24) => {
  if (!eventId) return;
  const expiresAt = Date.now() + ttlMs;
  webhookEventCache.set(eventId, expiresAt);
};
const hasWebhookEvent = (eventId) => {
  if (!eventId) return false;
  const expiresAt = webhookEventCache.get(eventId);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    webhookEventCache.delete(eventId);
    return false;
  }
  return true;
};

const pickWebhookTimestamp = (payload) => {
  const candidates = [
    payload?.payload?.updated_at,
    payload?.payload?.invitee?.updated_at,
    payload?.payload?.created_at,
    payload?.payload?.invitee?.canceled_at,
    payload?.payload?.invitee?.created_at,
    payload?.payload?.event?.updated_at,
    payload?.payload?.event?.created_at,
  ].filter(Boolean);
  return candidates[0] || new Date().toISOString();
};

const parseCalendlySignatureHeader = (headerValue) => {
  if (!headerValue) return null;
  const parts = String(headerValue)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const entries = {};
  parts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key && value) entries[key] = value;
  });
  if (!entries.t || !entries.v1) return null;
  return { timestamp: entries.t, signature: entries.v1 };
};

const verifyCalendlySignature = (rawBody, signatureHeader) => {
  if (!CALENDLY_WEBHOOK_SECRET || !signatureHeader) return false;
  const parsed = parseCalendlySignatureHeader(signatureHeader);
  if (!parsed) return false;
  const payloadToSign = `${parsed.timestamp}.${rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", CALENDLY_WEBHOOK_SECRET).update(payloadToSign).digest("hex");
  if (expected.length !== parsed.signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(parsed.signature), Buffer.from(expected));
};

app.post("/api/webhooks/calendly", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature =
      req.headers["calendly-webhook-signature"] ||
      req.headers["Calendly-Webhook-Signature"] ||
      req.headers["CALENDLY-WEBHOOK-SIGNATURE"];
    if (!verifyCalendlySignature(req.body, signature)) {
      return res.status(401).json({ error: "Invalid webhook signature." });
    }

    const payload = JSON.parse(req.body.toString("utf8"));
    const payloadBody = payload?.payload || {};
    const inviteePayload = payloadBody?.invitee || payload?.invitee || payloadBody || {};
    const scheduledEventPayload =
      inviteePayload?.scheduled_event ||
      payloadBody?.scheduled_event ||
      payloadBody?.event ||
      payload?.scheduled_event ||
      payload?.event ||
      {};
    const eventId =
      payload?.id ||
      payload?.event_id ||
      inviteePayload?.uri ||
      scheduledEventPayload?.uri ||
      scheduledEventPayload?.event ||
      payload?.payload?.event?.uri;
    if (hasWebhookEvent(eventId)) {
      return res.status(200).json({ ok: true, deduped: true });
    }
    rememberWebhookEvent(eventId);

    const eventType = payload?.event || payloadBody?.event;
    const invitee = inviteePayload || {};
    const eventData = scheduledEventPayload || {};
    const email = normalizeEmail(
      invitee?.email || invitee?.email_address || payloadBody?.email || payloadBody?.email_address
    );
    if (!email) {
      return res.status(200).json({ ok: true, skipped: "no email" });
    }

    const fallbackName = String(invitee?.name || "").trim();
    const [fallbackFirst, ...fallbackLastParts] = fallbackName.split(/\s+/);
    const fallbackLast = fallbackLastParts.join(" ");

    const contact = await upsertContact({
      email,
      firstName: invitee?.first_name || invitee?.firstName || fallbackFirst || "",
      lastName: invitee?.last_name || invitee?.lastName || fallbackLast || "",
    });
    if (!contact?.id) {
      return res.status(500).json({ error: "Failed to upsert contact." });
    }

    const verifyContact = await getContactByEmail(email);
    console.log("Calendly webhook request details", {
      eventType,
      eventId,
      email,
      contactId: contact.id,
      verifiedContactId: verifyContact?.id || null,
    });

    const fieldMap = await getFieldValuesForContact(contact.id);
    const storedLastUpdated = getFieldValue(fieldMap, "LAST_BOOKING_UPDATED_AT", AC_FIELD_LAST_BOOKING_UPDATED_AT);
    const incomingUpdatedAt = pickWebhookTimestamp(payload);
    if (storedLastUpdated && new Date(incomingUpdatedAt) <= new Date(storedLastUpdated)) {
      return res.status(200).json({ ok: true, skipped: "stale update" });
    }

    const isRescheduleCancel = eventType === "invitee.canceled" && invitee?.rescheduled === true;
    const eventStatus =
      eventType === "invitee.canceled"
        ? isRescheduleCancel
          ? "rescheduled"
          : "cancelled"
        : eventType === "invitee.rescheduled"
          ? "rescheduled"
          : "booked";
    const eventLocation =
      typeof eventData?.location === "string"
        ? eventData.location
        : eventData?.location?.location || eventData?.location?.address || "";

    const currentCount = Number(getFieldValue(fieldMap, "BOOKING_COUNT", AC_FIELD_BOOKING_COUNT) || 0);
    const calendlyFields = buildCalendlyFields({
      status: eventStatus,
      eventName: eventData?.name || eventData?.event_type || "",
      startTime: eventData?.start_time || eventData?.start_time?.date_time || eventData?.startTime || "",
      endTime: eventData?.end_time || eventData?.end_time?.date_time || eventData?.endTime || "",
      timezone: eventData?.timezone || invitee?.timezone || "",
      location: eventLocation,
      inviteeUri: invitee?.uri || "",
      rescheduleUrl: invitee?.reschedule_url || invitee?.rescheduleUrl || "",
      eventUri: eventData?.uri || invitee?.event || "",
      lastUpdatedAt: incomingUpdatedAt,
      bookingCount: currentCount + 1,
    });

    console.log("Calendly webhook update request", { contactId: contact.id, calendlyFields });
    await upsertFieldValues(contact.id, calendlyFields);
    const verifyFieldMap = await getFieldValuesForContact(contact.id);
    console.log("Calendly webhook updated fields", {
      contactId: contact.id,
      fieldValues: Object.fromEntries(
        Object.keys(calendlyFields).map((fieldId) => [
          fieldId,
          verifyFieldMap.byId.get(String(fieldId))?.value ?? null,
        ])
      ),
    });
    const updatedOk = Object.entries(calendlyFields).every(([fieldId, value]) => {
      const stored = verifyFieldMap.byId.get(String(fieldId))?.value ?? null;
      return stored === String(value);
    });
    console.log("Calendly webhook updated ok", { contactId: contact.id, ok: updatedOk });

    if (eventType === "invitee.created") {
      await ensureContactTags({ contactId: contact.id, stage: "booked", extraTags: [UR_EVENT_BOOKED_ACTION_TAG] });
      const historyBookedTag = buildUrHistoryBookedTag(
        calendlyFields[AC_FIELD_CALENDLY_START_TIME] || eventData?.start_time || eventData?.startTime,
        calendlyFields[AC_FIELD_CALENDLY_TIMEZONE] || eventData?.timezone || invitee?.timezone || ""
      );
      await syncUrEventDateTags({
        contactId: contact.id,
        startTime: calendlyFields[AC_FIELD_CALENDLY_START_TIME] || eventData?.start_time || eventData?.startTime,
        timezone: calendlyFields[AC_FIELD_CALENDLY_TIMEZONE] || eventData?.timezone || invitee?.timezone || "",
        extraTags: historyBookedTag ? [historyBookedTag] : [],
      });
    } else if (eventType === "invitee.canceled") {
      if (isRescheduleCancel) {
        await ensureContactTags({ contactId: contact.id, stage: "booked" });
        return res.status(200).json({ ok: true });
      }
      await ensureContactTags({ contactId: contact.id, stage: "cancelled" });
      const historyCancelledTag = buildUrHistoryCancelledTag(
        calendlyFields[AC_FIELD_CALENDLY_START_TIME] || eventData?.start_time || eventData?.startTime,
        calendlyFields[AC_FIELD_CALENDLY_TIMEZONE] || eventData?.timezone || invitee?.timezone || ""
      );
      await syncUrEventDateTags({
        contactId: contact.id,
        cancelled: true,
        extraTags: historyCancelledTag ? [historyCancelledTag] : [],
      });
    } else if (eventType === "invitee.rescheduled") {
      await ensureContactTags({ contactId: contact.id, stage: "booked" });
      const historyBookedTag = buildUrHistoryBookedTag(
        calendlyFields[AC_FIELD_CALENDLY_START_TIME] || eventData?.start_time || eventData?.startTime,
        calendlyFields[AC_FIELD_CALENDLY_TIMEZONE] || eventData?.timezone || invitee?.timezone || ""
      );
      await syncUrEventDateTags({
        contactId: contact.id,
        startTime: calendlyFields[AC_FIELD_CALENDLY_START_TIME] || eventData?.start_time || eventData?.startTime,
        timezone: calendlyFields[AC_FIELD_CALENDLY_TIMEZONE] || eventData?.timezone || invitee?.timezone || "",
        extraTags: historyBookedTag ? [historyBookedTag] : [],
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Calendly webhook failed", error?.message || error);
    return res.status(500).json({ error: "Webhook processing failed." });
  }
});

app.use(express.json({ limit: "1mb" }));

const VIMEO_BASE_URL = "https://api.vimeo.com";
const vimeoCache = {
  items: [],
  fetchedAt: 0,
  ttlMs: 5 * 60 * 1000,
};
const watchSessions = new Map();

const buildVimeoListPath = () => {
  if (VIMEO_ALBUM_ID) return `/albums/${VIMEO_ALBUM_ID}/videos`;
  if (VIMEO_PROJECT_ID) return `/projects/${VIMEO_PROJECT_ID}/videos`;
  if (VIMEO_USER_ID) return `/users/${VIMEO_USER_ID}/videos`;
  return "/me/videos";
};

const pickVimeoThumbnail = (pictures) => {
  const sizes = pictures?.sizes || [];
  if (!sizes.length) return null;
  const preferred = sizes.find((size) => size.width >= 640) || sizes[sizes.length - 1];
  return preferred?.link || sizes[sizes.length - 1]?.link || null;
};

const normalizeVimeoVideo = (video) => {
  const uri = String(video?.uri || "");
  const id = uri.split("/").filter(Boolean).pop();
  if (!id) return null;
  return {
    id,
    vimeoId: id,
    title: video?.name || "Untitled Episode",
    summary: video?.description || "",
    duration: Number(video?.duration || 0),
    published: video?.release_time || video?.created_time || null,
    image: pickVimeoThumbnail(video?.pictures),
    tags: Array.isArray(video?.tags) ? video.tags.map((tag) => tag?.name).filter(Boolean) : [],
    guest: video?.user?.name || "The Unscripted Room",
    coinCost: 3,
  };
};

const vimeoRequest = async (path, params = {}) => {
  if (!VIMEO_PAT) {
    throw new Error("Vimeo PAT not configured.");
  }
  const url = path.startsWith("http") ? new URL(path) : new URL(`${VIMEO_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VIMEO_PAT}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Vimeo request failed: ${response.status} ${text}`);
  }
  return response.json();
};

const VIMEO_FIELDS = [
  "uri",
  "name",
  "description",
  "duration",
  "release_time",
  "created_time",
  "pictures.sizes",
  "tags.name",
  "user.name",
].join(",");

const fetchVimeoEpisodes = async () => {
  const items = [];
  const path = buildVimeoListPath();
  let page = 1;
  const perPage = 50;
  while (page <= 5) {
    const data = await vimeoRequest(path, {
      per_page: perPage,
      page,
      sort: "date",
      direction: "desc",
      fields: VIMEO_FIELDS,
    });
    const videos = Array.isArray(data?.data) ? data.data : [];
    videos.forEach((video) => {
      const normalized = normalizeVimeoVideo(video);
      if (normalized) items.push(normalized);
    });
    if (!data?.paging?.next || videos.length < perPage) break;
    page += 1;
  }
  return items;
};

const getVimeoEpisodes = async ({ refresh = false, ensureTags = false } = {}) => {
  const now = Date.now();
  if (!refresh && vimeoCache.items.length && now - vimeoCache.fetchedAt < vimeoCache.ttlMs) {
    return vimeoCache.items;
  }
  let items = await fetchVimeoEpisodes();
  if (ensureTags) {
    const missingTags = items.filter((item) => !item.tags || item.tags.length === 0);
    for (const item of missingTags.slice(0, 25)) {
      try {
        const data = await vimeoRequest(`/videos/${item.id}`, { fields: "tags.name" });
        const tags = Array.isArray(data?.tags) ? data.tags.map((tag) => tag?.name).filter(Boolean) : [];
        item.tags = tags;
      } catch (error) {
        console.error("Tag enrich failed", item.id, error?.message || error);
      }
    }
  }
  vimeoCache.items = items;
  vimeoCache.fetchedAt = now;
  return items;
};

const buildCustomFields = (entries) => {
  const fields = {};
  entries.forEach(({ id, value }) => {
    if (!id || value === undefined || value === null || value === "") return;
    fields[id] = value;
  });
  return fields;
};

const buildContactSubjectTag = (subject) => {
  const compact = String(subject || "")
    .trim()
    .replace(/[^a-z]/gi, "");
  return compact ? `contact us: ${compact}` : null;
};

const buildGuestPreferenceTag = (prefix, kind, value) => {
  const compact = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return compact && prefix ? `${prefix}:${kind}:${compact}` : null;
};

const requiredFields = ["name", "email", "ageConfirmed", "days", "times", "curiosityLevel", "heardFrom"];

const getAuthEmail = (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const payload = verifyAuthToken(token);
  return payload?.email ? normalizeEmail(payload.email) : null;
};

app.get("/api/episodes", async (req, res) => {
  try {
    const refresh = req.query.refresh === "1";
    const ensureTags = req.query.tags === "1";
    const items = await getVimeoEpisodes({ refresh, ensureTags });
    return res.json({ items });
  } catch (error) {
    console.error("Vimeo episodes fetch failed", error?.message || error);
    return res.status(500).json({ error: "Failed to load episodes." });
  }
});

app.get("/api/episodes/:id", async (req, res) => {
  try {
    const episodeId = String(req.params.id || "").trim();
    if (!episodeId) {
      return res.status(400).json({ error: "Episode id is required." });
    }
    const cached = await getVimeoEpisodes();
    const found = cached.find((item) => item.id === episodeId);
    if (found) {
      return res.json({ item: found });
    }
    const data = await vimeoRequest(`/videos/${episodeId}`, { fields: VIMEO_FIELDS });
    const normalized = normalizeVimeoVideo(data);
    if (!normalized) {
      return res.status(404).json({ error: "Episode not found." });
    }
    return res.json({ item: normalized });
  } catch (error) {
    console.error("Vimeo episode fetch failed", error?.message || error);
    return res.status(500).json({ error: "Failed to load episode." });
  }
});

app.post("/api/episodes/:id/session", async (req, res) => {
  try {
    const episodeId = String(req.params.id || "").trim();
    if (!episodeId) {
      return res.status(400).json({ error: "Episode id is required." });
    }
    const email = getAuthEmail(req);
    const sessionId = crypto.randomUUID();
    watchSessions.set(sessionId, {
      sessionId,
      episodeId,
      email,
      createdAt: Date.now(),
      duration: 0,
      lastSeconds: null,
      maxPercent: 0,
      watchedSeconds: 0,
      skipDetected: false,
      awards: { oneThird: false, twoThird: false, completed: false },
      coinsAwarded: 0,
    });
    return res.json({ ok: true, sessionId });
  } catch (error) {
    console.error("Session create failed", error?.message || error);
    return res.status(500).json({ error: "Failed to start session." });
  }
});

app.post("/api/episodes/:id/progress", async (req, res) => {
  try {
    const episodeId = String(req.params.id || "").trim();
    const payload = req.body || {};
    const sessionId = String(payload.sessionId || "").trim();
    if (!episodeId || !sessionId) {
      return res.status(400).json({ error: "Episode id and session id are required." });
    }
    const session = watchSessions.get(sessionId);
    if (!session || session.episodeId !== episodeId) {
      return res.status(404).json({ error: "Session not found." });
    }
    const event = String(payload.event || "").toLowerCase();
    const seconds = Number(payload.seconds ?? 0);
    const percent = Number(payload.percent ?? 0);
    const duration = Number(payload.duration ?? 0);
    if (Number.isFinite(duration) && duration > 0) {
      session.duration = duration;
    }

    if (event === "seeking" || event === "seeked") {
      session.skipDetected = true;
    }

    if (event === "timeupdate" && Number.isFinite(seconds)) {
      if (session.lastSeconds !== null) {
        const delta = seconds - session.lastSeconds;
        if (delta < -0.5 || delta > 5) {
          session.skipDetected = true;
        } else if (delta > 0) {
          session.watchedSeconds += delta;
        }
      }
      session.lastSeconds = seconds;
    }

    if (Number.isFinite(percent)) {
      session.maxPercent = Math.max(session.maxPercent, percent);
    }

    let awardedNow = 0;
    if (!session.skipDetected) {
      if (!session.awards.oneThird && session.maxPercent >= 0.333) {
        session.awards.oneThird = true;
        session.coinsAwarded += 1;
        awardedNow += 1;
      }
      if (!session.awards.twoThird && session.maxPercent >= 0.666) {
        session.awards.twoThird = true;
        session.coinsAwarded += 3;
        awardedNow += 3;
      }
      if (!session.awards.completed && session.maxPercent >= 0.98) {
        session.awards.completed = true;
        session.coinsAwarded += 5;
        awardedNow += 5;
      }
    }

    return res.json({
      ok: true,
      awardedNow,
      totalAwarded: session.coinsAwarded,
      skipDetected: session.skipDetected,
      maxPercent: session.maxPercent,
    });
  } catch (error) {
    console.error("Progress update failed", error?.message || error);
    return res.status(500).json({ error: "Failed to update progress." });
  }
});

app.get("/api/coins/balance", async (req, res) => {
  try {
    const result = await getContactFromRequest(req);
    if (!result?.contact?.id) {
      return res.status(404).json({ error: "Contact not found." });
    }
    const balance = await getCoinBalance(result.contact.id);
    return res.json({ ok: true, balance });
  } catch (error) {
    console.error("Coin balance lookup failed", error?.message || error);
    return res.status(500).json({ error: "Failed to load coin balance." });
  }
});

app.post("/api/coins/spend", async (req, res) => {
  try {
    const result = await getContactFromRequest(req);
    if (!result?.contact?.id) {
      return res.status(404).json({ error: "Contact not found." });
    }
    const body = req.body || {};
    const amount = Math.abs(Number(body.amount || 3));
    const episodeId = body.episodeId ? String(body.episodeId) : "unknown";
    const eventId = body.eventId ? String(body.eventId) : null;
    const balance = await getCoinBalance(result.contact.id);
    if (balance < amount) {
      return res.status(402).json({ error: "Insufficient coins.", balance });
    }
    await createCoinTransaction({
      contactId: result.contact.id,
      name: `episode:${episodeId}:spend`,
      amount: -amount,
      timestamp: new Date().toISOString(),
      isSpend: true,
      externalId: eventId || `coin-spend-${result.contact.id}-${Date.now()}`,
    });
    const nextBalance = balance - amount;
    return res.json({ ok: true, balance: nextBalance });
  } catch (error) {
    console.error("Coin spend failed", error?.message || error);
    return res.status(500).json({ error: "Failed to spend coins." });
  }
});

app.post("/api/coins/reward", async (req, res) => {
  try {
    const result = await getContactFromRequest(req);
    if (!result?.contact?.id) {
      return res.status(404).json({ error: "Contact not found." });
    }
    const body = req.body || {};
    const amount = Math.max(0, Number(body.amount || 0));
    const episodeId = body.episodeId ? String(body.episodeId) : "unknown";
    const milestone = body.milestone ? String(body.milestone) : "reward";
    const eventId = body.eventId ? String(body.eventId) : null;
    if (!amount) {
      return res.status(400).json({ error: "Amount required." });
    }
    await createCoinTransaction({
      contactId: result.contact.id,
      name: `episode:${episodeId}:${milestone}`,
      amount,
      timestamp: new Date().toISOString(),
      isSpend: false,
      externalId: eventId || `coin-reward-${result.contact.id}-${Date.now()}`,
    });
    const nextBalance = await getCoinBalance(result.contact.id);
    return res.json({ ok: true, balance: nextBalance });
  } catch (error) {
    console.error("Coin reward failed", error?.message || error);
    return res.status(500).json({ error: "Failed to reward coins." });
  }
});

app.get("/api/coins/schema-debug", async (req, res) => {
  try {
    const schemaId = normalizeSchemaId(AC_COIN_SCHEMA_ID);
    if (!schemaId) {
      return res.status(400).json({ error: "AC_COIN_SCHEMA_ID not configured." });
    }
    const response = await acV3Request("GET", `/api/3/customObjects/schemas/${schemaId}`);
    const fields =
      response?.schema?.fields ||
      response?.schema?.data?.fields ||
      response?.fields ||
      response?.data?.fields ||
      [];
    return res.json({
      schemaId,
      fields: fields.map((field) => ({
        id: field.id,
        label: field.label,
        perstag: field.perstag,
      })),
    });
  } catch (error) {
    console.error("Coin schema debug failed", error?.message || error);
    return res.status(500).json({ error: "Failed to load schema." });
  }
});

app.post("/auth/register", rateLimit, async (req, res) => {
  try {
    const payload = req.body ?? {};
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (!AUTH_TOKEN_SECRET) {
      return res.status(500).json({ error: "Auth token secret not configured." });
    }
    const passwordFieldId = await resolvePasswordFieldId();
    if (!passwordFieldId) {
      return res.status(500).json({ error: "Password field not configured." });
    }

    const contact = await upsertContact({
      email,
      firstName: payload.given_name || payload.firstName || "",
      lastName: payload.family_name || payload.lastName || "",
    });
    if (!contact?.id) {
      return res.status(500).json({ error: "Failed to create contact." });
    }

    const passwordHash = hashPassword(password);
    await upsertFieldValues(contact.id, { [passwordFieldId]: passwordHash });

    await ensureContactTags({ contactId: contact.id, stage: "nurturing" });

    const listIds = [ACTIVE_CAMPAIGN_LIST_ID, ACTIVE_CAMPAIGN_MASTER_LIST_ID].filter(Boolean);
    await Promise.all(
      listIds.map((listId) =>
        acV3Request("POST", "/api/3/contactLists", {
          contactList: { contact: contact.id, list: listId, status: 1 },
        }).catch((error) => {
          console.error("Auth register list subscribe failed", error?.message || error);
        })
      )
    );

    const token = createAuthToken(email);
    return res.json({ ok: true, access_token: token });
  } catch (error) {
    console.error("Auth register failed", error?.message || error);
    return res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/auth/login", rateLimit, async (req, res) => {
  try {
    const payload = req.body ?? {};
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (!AUTH_TOKEN_SECRET) {
      return res.status(500).json({ error: "Auth token secret not configured." });
    }
    const passwordFieldId = await resolvePasswordFieldId();
    if (!passwordFieldId) {
      return res.status(500).json({ error: "Password field not configured." });
    }

    const contact = await getContactByEmail(email);
    if (!contact?.id) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const fieldMap = await getFieldValuesForContact(contact.id);
    const stored = fieldMap.byId.get(String(passwordFieldId))?.value || "";
    if (!verifyPassword(password, stored)) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = createAuthToken(email);
    return res.json({ ok: true, access_token: token });
  } catch (error) {
    console.error("Auth login failed", error?.message || error);
    return res.status(500).json({ error: "Login failed." });
  }
});

app.get("/auth/me", rateLimit, async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const payload = verifyAuthToken(token);
    if (!payload?.email) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const emailParam = req.query.email ? normalizeEmail(String(req.query.email)) : "";
    if (emailParam && emailParam !== normalizeEmail(payload.email)) {
      return res.status(403).json({ error: "Email mismatch." });
    }
    const contact = await getContactByEmail(emailParam || payload.email);
    if (!contact?.id) {
      return res.status(404).json({ error: "Contact not found." });
    }
    const fieldMap = await getFieldValuesForContact(contact.id);
    console.log("Auth me lookup", {
      email: emailParam || payload.email,
      contactId: contact.id,
      fieldValueCount: fieldMap.byId.size,
      sample: Array.from(fieldMap.byId.values()).slice(0, 5).map((fv) => ({
        field: fv.field,
        value: fv.field === String(AC_FIELD_PASSWORD) ? "[redacted]" : fv.value,
      })),
    });
    const debug = req.query.debug === "1";
    const response = { ok: true, ...buildStatusResponse(contact, fieldMap) };
    if (debug) {
      const perstags = [
        "PREFERRED_LANGUAGE",
        "DATE_OF_BIRTH",
        "GENDER",
        "STREET_ADDRESS",
        "CITY",
        "STATEPROVINCE",
        "ZIPPOSTAL_CODE",
        "PREFERRED_DAY",
        "PREFERRED_TIME",
        "REASONS_FOR_SIGNUP",
        "REASONS_FOR_JOINING",
        "CALENDLYSTATUS",
        "CALENDLYEVENTNAME",
        "CALENDLYSTARTTIME",
        "CALENDLYENDTIME",
        "CALENDLYTZ",
        "CALENDLYLOCATION",
        "CALENDLYINVITEEURI",
        "CALENDLYEVENTURI",
        "CALENDLYREBOOKURI",
      ];
      const index = await getFieldIndex();
      const valuesByPerstag = Object.fromEntries(
        perstags.map((tag) => [tag, fieldMap.byPerstag.get(tag)?.value ?? null])
      );
      response.debug = {
        contactId: contact.id,
        email: contact.email,
        fieldValues: buildFieldDebug(fieldMap),
        fieldsIndex: Object.fromEntries(perstags.map((tag) => [tag, index.perstagToId.get(tag) || null])),
        valuesByPerstag,
      };
    }
    return res.json(response);
  } catch (error) {
    console.error("Auth me failed", error?.message || error);
    return res.status(500).json({ error: "Failed to load profile." });
  }
});

app.post("/api/survey", rateLimit, async (req, res) => {
  try {
    const payload = req.body ?? {};
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const authPayload = verifyAuthToken(token);
    const email = normalizeEmail(payload.email || authPayload?.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!AC_SURVEY_SCHEMA_ID) {
      return res.status(500).json({ error: "Survey schema ID not configured." });
    }

    const contact = await upsertContact({
      email,
      firstName: payload.firstName || payload.name?.split(" ")?.[0] || "",
      lastName: payload.lastName || payload.name?.split(" ")?.slice(1).join(" ") || "",
    });
    if (!contact?.id) {
      return res.status(500).json({ error: "Failed to upsert contact." });
    }

    const npiTag = buildNpiTagFromAttendAgain(payload.attendAgain);
    const podcastInterestTag = buildPodcastInterestTag(
      payload.podcastInterest ?? payload.podcastInvitation ?? payload.podcastOpenToConversation
    );
    const availabilityTags = buildAvailabilityTags(payload.availability);
    try {
      await addTagsToContactWithRetry(
        contact.id,
        [SURVEY_COMPLETED_ACTION_TAG, npiTag, podcastInterestTag, ...availabilityTags].filter(Boolean)
      );
    } catch (error) {
      console.warn("Survey tag sync failed", { contactId: contact.id, error: error?.message || error });
    }

    const record = {
      record: {
        externalId: `survey-${contact.id}-${Date.now()}`,
        fields: [
          { id: SURVEY_FIELD_IDS.name, value: payload.name || "" },
          { id: SURVEY_FIELD_IDS.q1, value: payload.impactLevel || payload.curiosityImportance || "" },
          { id: SURVEY_FIELD_IDS.q2, value: payload.honestySpace || "" },
          { id: SURVEY_FIELD_IDS.q3, value: payload.standoutMoment || payload.conversationFeel || "" },
          { id: SURVEY_FIELD_IDS.q4, value: payload.betterExperience || "" },
          { id: SURVEY_FIELD_IDS.q5, value: payload.attendAgain || "" },
          { id: SURVEY_FIELD_IDS.q6, value: Array.isArray(payload.availability) ? payload.availability.join(", ") : "" },
          {
            id: SURVEY_FIELD_IDS.q7,
            value: payload.podcastInterest ?? payload.podcastInvitation ?? payload.podcastOpenToConversation ?? "",
          },
          { id: SURVEY_FIELD_IDS.q8, value: "" },
          { id: SURVEY_FIELD_IDS.q9, value: "" },
          { id: SURVEY_FIELD_IDS.q10, value: "" },
          { id: SURVEY_FIELD_IDS.optional, value: payload.anythingElse || "" },
        ],
        relationships: {
          "primary-contact": [Number(contact.id)],
        },
      },
    };

    await acV3Request("POST", `/api/3/customObjects/records/${AC_SURVEY_SCHEMA_ID}`, record);
    return res.json({ ok: true });
  } catch (error) {
    console.error("Survey submit failed", error?.message || error);
    return res.status(500).json({ error: "Failed to submit survey." });
  }
});

app.put("/auth/profile", rateLimit, async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const payload = verifyAuthToken(token);
    if (!payload?.email) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const body = req.body ?? {};
    const contact = await getContactByEmail(payload.email);
    if (!contact?.id) {
      return res.status(404).json({ error: "Contact not found." });
    }

    await acV3Request("PUT", `/api/3/contacts/${contact.id}`, {
      contact: {
        email: contact.email,
        firstName: body.firstName || contact.firstName || "",
        lastName: body.lastName || contact.lastName || "",
        ...(body.phone ? { phone: body.phone } : {}),
      },
    });

    await upsertFieldValues(contact.id, buildProfileFields(body));

    const updated = await getContactByEmail(payload.email);
    const fieldMap = await getFieldValuesForContact(contact.id);
    return res.json({ ok: true, ...buildStatusResponse(updated || contact, fieldMap) });
  } catch (error) {
    console.error("Auth profile update failed", error?.message || error);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const payload = req.body ?? {};
    console.log("Incoming registration payload:", {
      name: payload.name,
      email: payload.email,
      ageConfirmed: payload.ageConfirmed,
      days: payload.days,
      times: payload.times,
      curiosityLevel: payload.curiosityLevel,
      heardFrom: payload.heardFrom,
      envelopeWhere: payload.envelopeWhere,
      updatesOptIn: payload.updatesOptIn,
    });
    const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");

    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    if (!Array.isArray(payload.days) || payload.days.length === 0) {
      return res.status(400).json({ error: "At least one day is required." });
    }

    if (!Array.isArray(payload.times) || payload.times.length === 0) {
      return res.status(400).json({ error: "At least one time is required." });
    }

    if (payload.heardFrom === "envelope" && !payload.envelopeWhere) {
      return res.status(400).json({ error: "Envelope location is required." });
    }

    const [firstName, ...lastParts] = String(payload.name || "").trim().split(/\s+/);
    const lastName = lastParts.join(" ");
    const listId = AC_LIST_ID_REGISTER || ACTIVE_CAMPAIGN_LIST_ID;
    const listIds = [listId, ACTIVE_CAMPAIGN_MASTER_LIST_ID].filter(Boolean);

    try {
      await addActiveCampaignContact({
        email: payload.email,
        firstName,
        lastName,
        tags: "register-interest,src:web,LIFECYCLE: Lead",
        listIds,
        ip4: req.ip,
        fields: buildCustomFields([
          { id: AC_FIELD_DAYS, value: Array.isArray(payload.days) ? payload.days.join(", ") : "" },
          { id: AC_FIELD_TIMES, value: Array.isArray(payload.times) ? payload.times.join(", ") : "" },
          { id: AC_FIELD_PREFERRED_DAY, value: Array.isArray(payload.days) ? payload.days.join(", ") : "" },
          { id: AC_FIELD_PREFERRED_TIME, value: Array.isArray(payload.times) ? payload.times.join(", ") : "" },
          { id: AC_FIELD_CURIOSITY, value: payload.curiosityLevel ?? "" },
          { id: AC_FIELD_CURIOSITY_IMPORTANCE, value: payload.curiosityLevel ?? "" },
          { id: AC_FIELD_HEARD_FROM, value: payload.heardFrom ?? "" },
          { id: AC_FIELD_ENVELOPE_WHERE, value: payload.envelopeWhere ?? "" },
          { id: AC_FIELD_CURIOSITY_REASON, value: payload.curiosityReason ?? "" },
          { id: AC_FIELD_CURIOUS_TO_JOIN_TEXT, value: payload.curiosityReason ?? "" },
          { id: AC_FIELD_ADDITIONAL_INFO, value: payload.supportNotes ?? "" },
          { id: AC_FIELD_REASONS_FOR_JOINING, value: payload.curiosityReason ?? "" },
          { id: AC_FIELD_SUPPORT_NOTES, value: payload.supportNotes ?? "" },
          { id: AC_FIELD_BIO_ABOUT_ME, value: payload.supportNotes ?? "" },
          { id: AC_FIELD_UPDATES_OPTIN, value: payload.updatesOptIn ? "Yes" : "No" },
          { id: AC_FIELD_SUBSCRIBED_FOR_UPDATES, value: payload.updatesOptIn ? "Yes" : "No" },
          { id: AC_FIELD_AGE_CONFIRMED, value: payload.ageConfirmed ? "Yes" : "No" },
        ]),
      });
      if (ACTIVECAMPAIGN_BASE_URL && ACTIVECAMPAIGN_API_TOKEN) {
        const contact = await upsertContact({
          email: normalizeEmail(payload.email),
          firstName,
          lastName,
        });
        if (contact?.id) {
          await upsertFieldValues(contact.id, {
            ...(AC_FIELD_PREFERRED_DAY
              ? { [AC_FIELD_PREFERRED_DAY]: Array.isArray(payload.days) ? payload.days.join(", ") : "" }
              : {}),
            ...(AC_FIELD_PREFERRED_TIME
              ? { [AC_FIELD_PREFERRED_TIME]: Array.isArray(payload.times) ? payload.times.join(", ") : "" }
              : {}),
            ...(AC_FIELD_DAYS
              ? { [AC_FIELD_DAYS]: Array.isArray(payload.days) ? payload.days.join(", ") : "" }
              : {}),
            ...(AC_FIELD_TIMES
              ? { [AC_FIELD_TIMES]: Array.isArray(payload.times) ? payload.times.join(", ") : "" }
              : {}),
            ...(AC_FIELD_LEAD_SOURCE ? { [AC_FIELD_LEAD_SOURCE]: "web" } : {}),
            ...(AC_FIELD_CURIOSITY ? { [AC_FIELD_CURIOSITY]: payload.curiosityLevel ?? "" } : {}),
            ...(AC_FIELD_CURIOSITY_IMPORTANCE ? { [AC_FIELD_CURIOSITY_IMPORTANCE]: payload.curiosityLevel ?? "" } : {}),
            ...(AC_FIELD_HEARD_FROM ? { [AC_FIELD_HEARD_FROM]: payload.heardFrom ?? "" } : {}),
            ...(AC_FIELD_ENVELOPE_WHERE ? { [AC_FIELD_ENVELOPE_WHERE]: payload.envelopeWhere ?? "" } : {}),
            ...(AC_FIELD_CURIOSITY_REASON ? { [AC_FIELD_CURIOSITY_REASON]: payload.curiosityReason ?? "" } : {}),
            ...(AC_FIELD_CURIOUS_TO_JOIN_TEXT ? { [AC_FIELD_CURIOUS_TO_JOIN_TEXT]: payload.curiosityReason ?? "" } : {}),
            ...(AC_FIELD_REASONS_FOR_SIGNUP ? { [AC_FIELD_REASONS_FOR_SIGNUP]: payload.curiosityReason ?? "" } : {}),
            ...(AC_FIELD_REASONS_FOR_JOINING ? { [AC_FIELD_REASONS_FOR_JOINING]: payload.curiosityReason ?? "" } : {}),
            ...(AC_FIELD_SUPPORT_NOTES ? { [AC_FIELD_SUPPORT_NOTES]: payload.supportNotes ?? "" } : {}),
            ...(AC_FIELD_ADDITIONAL_INFO ? { [AC_FIELD_ADDITIONAL_INFO]: payload.supportNotes ?? "" } : {}),
            ...(AC_FIELD_BIO_ABOUT_ME ? { [AC_FIELD_BIO_ABOUT_ME]: payload.supportNotes ?? "" } : {}),
            ...(AC_FIELD_UPDATES_OPTIN ? { [AC_FIELD_UPDATES_OPTIN]: payload.updatesOptIn ? "Yes" : "No" } : {}),
            ...(AC_FIELD_SUBSCRIBED_FOR_UPDATES
              ? { [AC_FIELD_SUBSCRIBED_FOR_UPDATES]: payload.updatesOptIn ? "Yes" : "No" }
              : {}),
            ...(AC_FIELD_AGE_CONFIRMED ? { [AC_FIELD_AGE_CONFIRMED]: payload.ageConfirmed ? "Yes" : "No" } : {}),
          });
          await ensureContactTags({ contactId: contact.id, stage: "captured" });
        }
      }
    } catch (error) {
      console.error("ActiveCampaign register-interest failed", error?.message || error);
    }

    appendSubmission(
      [
        "Type: Register Interest",
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `18+ Confirmed: ${payload.ageConfirmed ? "Yes" : "No"}`,
        `Days: ${(payload.days || []).join(", ")}`,
        `Times: ${(payload.times || []).join(", ")}`,
        `Curiosity (1-10): ${payload.curiosityLevel}`,
        `Heard From: ${payload.heardFrom}`,
        `Envelope Location: ${payload.envelopeWhere || "N/A"}`,
        `What made you curious to join?: ${payload.curiosityReason || "N/A"}`,
        `Support notes: ${payload.supportNotes || "N/A"}`,
        `Updates opt-in: ${payload.updatesOptIn ? "Yes" : "No"}`,
      ].join("\n")
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("Registration submission failed", error?.response?.body || error);
    return res.status(500).json({ error: "Failed to submit registration." });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const payload = req.body ?? {};
    console.log("Incoming contact payload:", {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      messageLength: payload.message ? payload.message.length : 0,
    });

    const missing = ["name", "email", "subject", "message"].filter(
      (field) => payload[field] === undefined || payload[field] === null || payload[field] === ""
    );

    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    const [firstName, ...lastParts] = String(payload.name || "").trim().split(/\s+/);
    const lastName = lastParts.join(" ");
    const subjectTag = buildContactSubjectTag(payload.subject);
    const listId = AC_LIST_ID_CONTACT || ACTIVE_CAMPAIGN_LIST_ID;
    const listIds = [listId, ACTIVE_CAMPAIGN_MASTER_LIST_ID].filter(Boolean);

    try {
      await addActiveCampaignContact({
        email: payload.email,
        firstName,
        lastName,
        tags: [subjectTag, "src:web", "LIFECYCLE: Engaged"].filter(Boolean).join(","),
        listIds,
        ip4: req.ip,
        fields: buildCustomFields([
          { id: AC_FIELD_CONTACT_SUBJECT, value: payload.subject ?? "" },
          { id: AC_FIELD_CONTACT_MESSAGE, value: payload.message ?? "" },
        ]),
      });
      if (ACTIVECAMPAIGN_BASE_URL && ACTIVECAMPAIGN_API_TOKEN) {
        const contact = await upsertContact({
          email: normalizeEmail(payload.email),
          firstName,
          lastName,
        });
        if (contact?.id) {
          await upsertFieldValues(contact.id, {
            ...(AC_FIELD_CONTACT_SUBJECT ? { [AC_FIELD_CONTACT_SUBJECT]: payload.subject ?? "" } : {}),
            ...(AC_FIELD_CONTACT_MESSAGE ? { [AC_FIELD_CONTACT_MESSAGE]: payload.message ?? "" } : {}),
          });
          await ensureContactTags({
            contactId: contact.id,
            stage: "nurturing",
            extraTags: subjectTag ? [subjectTag] : [],
          });
          if (AC_CONTACT_MESSAGE_SCHEMA_ID) {
            const fieldIds = await getContactMessageFieldIds();
            const record = {
              record: {
                externalId: `contact-message-${contact.id}-${Date.now()}`,
                fields: [
                  { id: fieldIds.name, value: payload.name || "" },
                  { id: fieldIds.email, value: payload.email || "" },
                  { id: fieldIds.topic, value: payload.subject || "" },
                  { id: fieldIds.message, value: payload.message || "" },
                ],
                relationships: {
                  "primary-contact": [Number(contact.id)],
                },
              },
            };
            await acV3Request(
              "POST",
              `/api/3/customObjects/records/${AC_CONTACT_MESSAGE_SCHEMA_ID}`,
              record
            );
          }
        }
      }
    } catch (error) {
      console.error("ActiveCampaign contact-us failed", error?.message || error);
    }

    appendSubmission(
      [
        "Type: Contact Us",
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Subject: ${payload.subject}`,
        "Message:",
        payload.message,
      ].join("\n")
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("Contact submission failed", error?.response?.body || error);
    return res.status(500).json({ error: "Failed to submit contact form." });
  }
});

app.post("/api/lead", rateLimit, async (req, res) => {
  try {
    const payload = req.body ?? {};
    const email = normalizeEmail(payload.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!payload.offer) {
      return res.status(400).json({ error: "Offer is required." });
    }

    const contact = await upsertContact({
      email,
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      phone: payload.phone || "",
    });
    if (!contact?.id) {
      return res.status(500).json({ error: "Failed to upsert contact." });
    }

    const warnings = [];
    const tagPrefix = String(payload.offer || "").startsWith("community") ? "community" : "podcast";
    const experiencePreferenceTag = buildGuestPreferenceTag(
      tagPrefix,
      "experience-preference",
      payload.experiencePreference
    );
    const conversationInterestTag = buildGuestPreferenceTag(
      tagPrefix,
      "conversation-interest",
      payload.reasonsForJoining
    );
    const tasks = [
      upsertFieldValues(contact.id, buildLeadFields(payload)).catch((error) => {
        warnings.push("field_update_failed");
        console.error("Lead field update failed", error?.message || error);
      }),
      ensureContactTags({
        contactId: contact.id,
        stage: "captured",
        extraTags: [`offer:${payload.offer}`, experiencePreferenceTag, conversationInterestTag].filter(Boolean),
      }).catch((error) => {
        warnings.push("tag_update_failed");
        console.error("Lead stage update failed", error?.message || error);
      }),
    ];

    const listIds = [ACTIVE_CAMPAIGN_LIST_ID, ACTIVE_CAMPAIGN_MASTER_LIST_ID].filter(Boolean);
    listIds.forEach((listId) => {
      tasks.push(
        acV3Request("POST", "/api/3/contactLists", {
          contactList: { contact: contact.id, list: listId, status: 1 },
        }).catch((error) => {
          warnings.push("list_subscribe_failed");
          console.error("Lead list subscribe failed", error?.message || error);
        })
      );
    });

    await Promise.all(tasks);

    const token = createLeadStatusToken(email);
    return res.json({ ok: true, status: "captured", token, warnings: warnings.length ? warnings : undefined });
  } catch (error) {
    console.error("Lead capture failed", error?.message || error);
    return res.status(500).json({ error: "Failed to capture lead." });
  }
});

app.get("/api/lead/status", rateLimit, async (req, res) => {
  try {
    const token = req.query.token ? String(req.query.token) : null;
    const emailParam = req.query.email ? String(req.query.email) : null;
    const tokenPayload = token ? verifyLeadStatusToken(token) : null;
    const email = normalizeEmail(tokenPayload?.email || emailParam);
    if (!email) {
      return res.status(400).json({ error: "Email or token is required." });
    }

    const contact = await getContactByEmail(email);
    if (!contact?.id) {
      return res.status(404).json({ error: "Contact not found." });
    }

    const fieldMap = await getFieldValuesForContact(contact.id);
    return res.json({ ok: true, ...buildStatusResponse(contact, fieldMap) });
  } catch (error) {
    console.error("Lead status lookup failed", error?.message || error);
    return res.status(500).json({ error: "Failed to load status." });
  }
});

app.post("/api/qr/lead", rateLimit, async (req, res) => {
  try {
    const payload = req.body ?? {};
    const email = normalizeEmail(payload.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const stage = String(payload.stage || "").toLowerCase();
    const name = String(payload.name || "").trim();
    const [firstName, ...lastParts] = name.split(/\s+/);
    const lastName = lastParts.join(" ");

    const contact = await upsertContact({
      email,
      firstName: firstName || "",
      lastName: lastName || "",
    });
    if (!contact?.id) {
      return res.status(500).json({ error: "Failed to upsert contact." });
    }
    console.log("QR lead upsert", { email, contactId: contact.id });

    const listIds = [ACTIVE_CAMPAIGN_LIST_ID, ACTIVE_CAMPAIGN_MASTER_LIST_ID].filter(Boolean);
    await Promise.all(
      listIds.map((listId) =>
        acV3Request("POST", "/api/3/contactLists", {
          contactList: { contact: contact.id, list: listId, status: 1 },
        }).catch((error) => {
          console.error("QR list subscribe failed", error?.message || error);
        })
      )
    );

    const resolvedStage = stage === "nurturing" ? "nurturing" : "captured";
    try {
      console.log("QR tagging start", { contactId: contact.id, stage: resolvedStage });
      await waitForContactVisible(contact.id, 3);
      const baseTags = [QR_SOURCE_TAG, STAGE_TAGS[resolvedStage]].filter(Boolean);
      await addTagsToContactNoCheck(contact.id, baseTags);
      await removeTagsFromContact(contact.id, [SOURCE_TAG]);
      console.log("QR tagging result", { contactId: contact.id, applied: baseTags });
    } catch (error) {
      console.error("QR tagging failed", error?.message || error);
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error("QR lead capture failed", error?.message || error);
    return res.status(500).json({ error: "Failed to capture lead." });
  }
});

app.get("/api/submissions", requireBasicAuth, (req, res) => {
  fs.readFile(submissionsLogPath, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to read submissions log", err);
      return res.status(500).send("Failed to read submissions.");
    }
    const contents = data || "No submissions yet.";
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"unscripted-room-submissions.txt\"");
    return res.status(200).send(contents);
  });
});

app.post("/api/debug/activecampaign/fields", requireBasicAuth, async (req, res) => {
  try {
    const payload = req.body ?? {};
    const contactId = payload.contactId ? String(payload.contactId) : null;
    const email = payload.email ? normalizeEmail(payload.email) : null;
    const fields = payload.fields || {};
    if (!contactId && !email) {
      return res.status(400).json({ error: "contactId or email is required." });
    }
    const contact = contactId ? { id: contactId } : await getContactByEmail(email);
    if (!contact?.id) {
      return res.status(404).json({ error: "Contact not found." });
    }
    await upsertFieldValues(contact.id, fields);
    const verifyFieldMap = await getFieldValuesForContact(contact.id);
    const verification = Object.entries(fields).map(([fieldId, value]) => {
      const stored = verifyFieldMap.get(String(fieldId))?.value ?? null;
      return { fieldId, expected: String(value), actual: stored, ok: stored === String(value) };
    });
    const allOk = verification.every((item) => item.ok);
    return res.json({ ok: true, contactId: contact.id, allOk, verification });
  } catch (error) {
    console.error("Debug field update failed", error?.message || error);
    return res.status(500).json({ error: "Failed to update fields." });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Registration server listening on ${port}`);
});
