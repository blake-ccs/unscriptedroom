import "dotenv/config";
import express from "express";
import sgMail from "@sendgrid/mail";

const app = express();
app.use(express.json({ limit: "1mb" }));

const { SENDGRID_API_KEY } = process.env;
if (!SENDGRID_API_KEY) {
  console.warn("Missing SENDGRID_API_KEY env var. Emails will fail to send.");
} else {
  console.log(
    `SENDGRID_API_KEY loaded: yes (length ${SENDGRID_API_KEY.length}, ending ${SENDGRID_API_KEY.slice(-4)})`
  );
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const requiredFields = ["name", "email", "ageConfirmed", "days", "times", "curiosityLevel", "heardFrom"];

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

    if (!SENDGRID_API_KEY) {
      return res.status(500).json({ error: "Email service is not configured." });
    }

    const messageBody = [
      "You’ve taken a meaningful step toward a different kind of conversation.",
      "",
      "Your curiosity brought you here, and we’re glad it did.",
      "",
      "",
      "Your session will take place at:",
      "",
      "21 Water Street, Suite 306",
      "",
      "Amesbury, MA 01913",
      "",
      "",
      "You’re now confirmed for an upcoming Unscripted Room Session. This experience is simple in structure and rich in meaning: curated questions, a shared room and the space to explore what emerges when curiosity leads the way.",
      "",
      "There’s nothing you need to study or bring. Just yourself, your attention, and a willingness to sit in a space where conversation unfolds without scripts, introductions or expectations.",
      "",
      "The Unscripted Room is built around three ideas:",
      "",
      "Curiosity. Presence. Truth.",
      "",
      "You’ll experience each of them in your own way.",
      "",
      "",
      "If you have any questions in the meantime, you can reply directly to this email.",
      "",
      "We’re looking forward to having you in the room.",
      "",
      "",
      "The Unscripted Room",
      "",
      "A Curiosity Strategy Experience",
    ].join("\n");

    const emailMessage = {
      to: payload.email,
      from: { email: "randal@ccs.global", name: "The Unscripted Room" },
      replyTo: "randal@ccs.global",
      bcc: ["brett@ccs.global", "randal@ccs.global"],
      subject: "Your Spot in The Unscripted Room",
      text: messageBody,
    };

    console.log("Sending email via SendGrid:", {
      to: emailMessage.to,
      from: emailMessage.from,
      replyTo: emailMessage.replyTo,
      bcc: emailMessage.bcc,
      subject: emailMessage.subject,
      textLength: emailMessage.text.length,
    });

    const [response] = await sgMail.send(emailMessage);
    console.log("SendGrid response status:", response.statusCode);
    console.log("SendGrid response headers:", response.headers);

    return res.json({ ok: true });
  } catch (error) {
    console.error("Registration email failed", error?.response?.body || error);
    return res.status(500).json({ error: "Failed to send email." });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Registration server listening on ${port}`);
});
