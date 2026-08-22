"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateContact } = require("../src/lib/contactValidation");
const { buildEmailMessage } = require("../src/lib/emailMessage");

const validPayload = {
  name: "Basharat Ahmed",
  email: "basharat@example.com",
  phone: "+61 400 000 000",
  service: "Azure Training",
  message: "Please contact me about Azure training.",
  website: "",
};

test("accepts and normalizes a valid enquiry", function () {
  const result = validateContact(validPayload);
  assert.equal(result.ok, true);
  assert.equal(result.isBot, false);
  assert.equal(result.data.email, "basharat@example.com");
});

test("rejects an invalid email", function () {
  const result = validateContact({ ...validPayload, email: "not-an-email" });
  assert.equal(result.ok, false);
  assert.match(result.error, /valid email/i);
});

test("rejects a service that is not in the form", function () {
  const result = validateContact({ ...validPayload, service: "Unknown" });
  assert.equal(result.ok, false);
  assert.match(result.error, /valid service/i);
});

test("silently accepts a honeypot submission", function () {
  const result = validateContact({ ...validPayload, website: "spam.example" });
  assert.equal(result.ok, true);
  assert.equal(result.isBot, true);
});

test("builds a plain-text email with reply-to", function () {
  const message = buildEmailMessage(validPayload, {
    senderAddress: "DoNotReply@example.azurecomm.net",
    recipientAddress: "sofitcontact@gmail.com",
  });

  assert.equal(message.senderAddress, "DoNotReply@example.azurecomm.net");
  assert.equal(message.recipients.to[0].address, "sofitcontact@gmail.com");
  assert.equal(message.replyTo[0].address, "basharat@example.com");
  assert.match(message.content.plainText, /Azure Training/);
});
