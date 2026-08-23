const { EmailClient } = require('@azure/communication-email');

function jsonResponse(status, body) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function clean(value, maxLength = 2000) {
  return String(value || '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store'
      }
    };
    return;
  }

  if (req.method !== 'POST') {
    context.res = jsonResponse(405, { ok: false, error: 'Method not allowed.' });
    return;
  }

  // Azure Static Web Apps application settings.
  // Use the ACS connection string from the Communication Services resource.
  const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'sofitcontact@gmail.com';

  if (!connectionString || !fromEmail || !toEmail) {
    context.log.error('Missing Azure Communication Services email configuration.');
    context.res = jsonResponse(500, {
      ok: false,
      error: 'Contact service is temporarily unavailable.'
    });
    return;
  }

  const input = req.body || {};
  const name = clean(input.name, 120);
  const email = clean(input.email, 254);
  const phone = clean(input.phone, 80);
  const service = clean(input.service, 160);
  const message = clean(input.message, 5000);

  if (!name || !email || !message) {
    context.res = jsonResponse(400, {
      ok: false,
      error: 'Please enter your name, email and message.'
    });
    return;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    context.res = jsonResponse(400, {
      ok: false,
      error: 'Please enter a valid email address.'
    });
    return;
  }

  const subject = `SOF IT Solution enquiry - ${service || 'General enquiry'} - ${name}`;
  const plainText = [
    'New SOF IT Solution website enquiry',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '-'}`,
    `Service: ${service || '-'}`,
    '',
    'Message:',
    message
  ].join('\n');

  const html = `<!doctype html>
<html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
  <h2>New SOF IT Solution website enquiry</h2>
  <p><strong>Name:</strong> ${escapeHtml(name)}<br>
  <strong>Email:</strong> ${escapeHtml(email)}<br>
  <strong>Phone:</strong> ${escapeHtml(phone || '-')}<br>
  <strong>Service:</strong> ${escapeHtml(service || '-')}</p>
  <p><strong>Message:</strong></p>
  <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
</body></html>`;

  const emailMessage = {
    senderAddress: fromEmail,
    content: {
      subject,
      plainText,
      html
    },
    recipients: {
      to: [{ address: toEmail }]
    },
    replyTo: [{ address: email, displayName: name }]
  };

  try {
    const emailClient = new EmailClient(connectionString);
    const poller = await emailClient.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    if (!result || result.status !== 'Succeeded') {
      context.log.error('Azure Communication Services email send did not succeed.', result);
      context.res = jsonResponse(502, {
        ok: false,
        error: 'Unable to send your enquiry right now. Please try again or email sofitcontact@gmail.com.'
      });
      return;
    }

    context.res = jsonResponse(200, {
      ok: true,
      message: 'Enquiry sent successfully.',
      id: result.id
    });
  } catch (error) {
    context.log.error(
      'Azure Communication Services email exception:',
      error && error.message ? error.message : error
    );
    context.res = jsonResponse(502, {
      ok: false,
      error: 'Unable to send your enquiry right now. Please try again or email sofitcontact@gmail.com.'
    });
  }
};
