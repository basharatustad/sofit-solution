
const https = require("https");

module.exports = async function (context, req) {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const service = String(body.service || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: "Name, email and message are required." }
    };
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || "sofitcontact@gmail.com";
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: "Email service is not configured yet." }
    };
    return;
  }

  const subject = `SOF IT Solution enquiry - ${service || "General enquiry"} - ${name}`;
  const text = [
    "New enquiry from SOF IT Solution website",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Service: ${service || "Not specified"}`,
    "",
    "Message:",
    message
  ].join("\n");

  const payload = JSON.stringify({
    from: fromEmail,
    to: [toEmail],
    reply_to: email,
    subject,
    text
  });

  const options = {
    hostname: "api.resend.com",
    path: "/emails",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  };

  const result = await new Promise((resolve, reject) => {
    const request = https.request(options, response => {
      let data = "";
      response.on("data", chunk => data += chunk);
      response.on("end", () => resolve({ status: response.statusCode, data }));
    });
    request.on("error", reject);
    request.write(payload);
    request.end();
  });

  if (result.status >= 200 && result.status < 300) {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true }
    };
  } else {
    context.log.error("Resend error:", result.status, result.data);
    context.res = {
      status: 502,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: "The enquiry could not be sent. Please try again." }
    };
  }
};
