"use strict";

const SERVICE_OPTIONS = Object.freeze([
  "IT Consulting",
  "IT Support",
  "Technology Recommendation",
  "Industry Support",
  "IT Automation & Business Support",
  "Social Media Support",
  "Meta Ads & Business Promotions",
  "On-the-Job Training",
  "Azure Training",
  "MuleSoft Training",
  "BizTalk / Azure Integration Training",
  "1:1 Coaching / Career Help",
]);

function singleLine(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function messageText(value, maxLength) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function validateContact(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Invalid request." };
  }

  const data = {
    name: singleLine(payload.name, 100),
    email: singleLine(payload.email, 254).toLowerCase(),
    phone: singleLine(payload.phone, 50),
    service: singleLine(payload.service, 100),
    message: messageText(payload.message, 4000),
    website: singleLine(payload.website, 200),
  };

  if (data.website) {
    return { ok: true, isBot: true, data };
  }

  if (data.name.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(data.email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (!SERVICE_OPTIONS.includes(data.service)) {
    return { ok: false, error: "Please select a valid service." };
  }

  if (data.message.length < 10) {
    return {
      ok: false,
      error: "Please enter at least 10 characters in your message.",
    };
  }

  return { ok: true, isBot: false, data };
}

module.exports = { SERVICE_OPTIONS, validateContact };
