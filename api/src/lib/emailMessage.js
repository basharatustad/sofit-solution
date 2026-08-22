"use strict";

function buildEmailMessage(data, configuration) {
  const receivedAt = new Date().toISOString();
  const plainText = [
    "New enquiry from the SOF IT Solution website",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone / WhatsApp: ${data.phone || "Not provided"}`,
    `Service: ${data.service}`,
    `Received (UTC): ${receivedAt}`,
    "",
    "Message:",
    data.message,
  ].join("\n");

  return {
    senderAddress: configuration.senderAddress,
    content: {
      subject: `Website enquiry - ${data.service}`,
      plainText,
    },
    recipients: {
      to: [
        {
          address: configuration.recipientAddress,
          displayName: "SOF IT Solution",
        },
      ],
    },
    replyTo: [
      {
        address: data.email,
        displayName: data.name,
      },
    ],
  };
}

module.exports = { buildEmailMessage };
