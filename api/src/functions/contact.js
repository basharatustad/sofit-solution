"use strict";

const { app } = require("@azure/functions");
const { EmailClient } = require("@azure/communication-email");
const { validateContact } = require("../lib/contactValidation");
const { buildEmailMessage } = require("../lib/emailMessage");

const MAX_REQUEST_BYTES = 16_000;
let cachedEmailClient;
let cachedConnectionString;

function json(status, body) {
  return {
    status,
    jsonBody: body,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8"
    }
  };
}

function getEmailClient(connectionString) {
  if (!cachedEmailClient || cachedConnectionString !== connectionString) {
    cachedEmailClient = new EmailClient(connectionString);
    cachedConnectionString = connectionString;
  }
  return cachedEmailClient;
}

async function contactHandler(request, context) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    return json(413, { ok: false, error: "The enquiry is too large." });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_error) {
    return json(400, { ok: false, error: "The request must contain valid JSON." });
  }

  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > MAX_REQUEST_BYTES) {
    return json(413, { ok: false, error: "The enquiry is too large." });
  }

  const validation = validateContact(payload);
  if (!validation.ok) {
    return json(400, { ok: false, error: validation.error });
  }

  // Return a normal response to bots that fill the hidden honeypot field.
  if (validation.isBot) {
    return json(200, { ok: true });
  }

  const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;
  const senderAddress = process.env.EMAIL_SENDER_ADDRESS;
  const recipientAddress = process.env.CONTACT_RECIPIENT_EMAIL || "sofitcontact@gmail.com";

  if (!connectionString || !senderAddress) {
    context.error("Contact email is not configured. Required Azure application settings are missing.");
    return json(503, {
      ok: false,
      error: "The contact service is not configured yet. Please email sofitcontact@gmail.com."
    });
  }

  try {
    const message = buildEmailMessage(validation.data, {
      senderAddress,
      recipientAddress
    });
    const poller = await getEmailClient(connectionString).beginSend(message);
    const result = await poller.pollUntilDone();

    if (String(result?.status || "").toLowerCase() === "failed") {
      throw new Error("Azure Communication Services reported a failed send operation.");
    }

    context.log("Contact enquiry accepted by Azure Communication Services.");
    return json(200, { ok: true });
  } catch (error) {
    context.error("Unable to send contact enquiry.", error);
    return json(502, {
      ok: false,
      error: "Unable to send your enquiry right now. Please try again or email sofitcontact@gmail.com."
    });
  }
}

app.http("contact", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "contact",
  handler: contactHandler
});

module.exports = { contactHandler };
