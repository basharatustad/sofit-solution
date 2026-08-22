# SOF IT Solution — website and Azure contact email

This repository contains the public SOF IT Solution website and its managed
Azure Functions contact API.

## Website content

- Responsive consulting and training pages with an accessible mobile menu.
- Original, compressed WebP artwork for cloud and integration content.
- A cloud and integration architecture blog.
- Curated official resources for Azure, AWS, Google Cloud, MuleSoft and BizTalk.
- Detailed Azure iPaaS, MuleSoft and BizTalk training curricula.
- A single secure enquiry form shared by all consulting and training paths.

The website is plain HTML, CSS and JavaScript, so Azure Static Web Apps can
serve it directly without a frontend build step.

This package fixes the website contact failure by adding a managed Azure Function at `POST /api/contact`. The Function validates each enquiry and sends it to `sofitcontact@gmail.com` with Azure Communication Services Email (ACS Email).

Every **Contact**, **Enquire**, **Book Training** and **Free Consultation** link in the supplied website leads to `contact.html`, so all enquiries use this one Azure Function and the same mail configuration. Do not place the Azure connection string in HTML or browser JavaScript.

## What was fixed

- Added the missing `/api/contact` backend.
- Added the missing `assets/style.css` and `assets/script.js` files.
- Moved contact submission code into `assets/contact.js`.
- Added server-side validation, a 16 KB request limit and a honeypot field.
- Added a 20-second browser timeout and useful fallback errors.
- Sends plain-text mail and sets the visitor's email as `Reply-To`.
- Added security headers for Azure Static Web Apps.
- Added automated tests for contact validation and email construction.
- Kept the demo login non-persistent and moved its inline script into `assets/login.js`.

## Azure resources required

1. An **Email Communication Services** resource with an Azure-managed or custom verified domain.
2. An **Azure Communication Services** resource connected to that email domain.
3. An **Azure Static Web App** connected to the repository containing this folder.

## Deploy to Azure Static Web Apps

1. Push the complete folder to a GitHub repository.
2. In Azure Portal, create an Azure Static Web App and connect that repository.
3. Use these build settings:
   - App location: `/`
   - API location: `api`
   - Output location: leave empty

4. In the Static Web App, open **Settings → Environment variables** (called **Configuration** in some portal views) and add:

   | Name                                       | Value                                                                                               |
   | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
   | `COMMUNICATION_SERVICES_CONNECTION_STRING` | The connection string from the connected Azure Communication Services resource                      |
   | `EMAIL_SENDER_ADDRESS`                     | The MailFrom address shown for the verified ACS Email domain, such as `DoNotReply@...azurecomm.net` |
   | `CONTACT_RECIPIENT_EMAIL`                  | `sofitcontact@gmail.com`                                                                            |

5. Redeploy the Static Web App after saving the settings.
6. Open the deployed `contact.html`, send a test enquiry and confirm that it arrives in `sofitcontact@gmail.com`.

`COMMUNICATION_SERVICES_CONNECTION_STRING` is a secret. Never commit its real value. Rotate it in Azure if it is ever exposed.

## Local test

Prerequisites: Node.js 22 or 24, Azure Functions Core Tools and Azure Static Web Apps CLI.

1. In `api`, run `npm install`.
2. Copy `api/local.settings.example.json` to `api/local.settings.json`.
3. Put your real ACS connection string and verified MailFrom address only in `api/local.settings.json`.
4. From the project root, run:

   ```bash
   swa start . --api-location api
   ```

5. Open the local URL printed by the CLI and test `contact.html`.

Opening `contact.html` directly as a `file://` page cannot reach `/api/contact`; use the Static Web Apps CLI or the deployed Azure URL.

## Automated validation

Run:

```bash
cd api
npm test
```

The code can be syntax-checked without Azure credentials. A real delivery test requires a valid ACS connection string, a connected verified domain and the exact MailFrom address.

## Optional service preselection

The contact page supports an allow-listed `service` query parameter. For example:

```text
contact.html?service=Azure%20Training
```

The backend still validates the selected service before sending.

## Production recommendations

- Enable Application Insights for API logs and delivery troubleshooting.
- Add rate limiting through Azure Front Door/WAF or API Management if public traffic grows.
- Configure Azure Static Web Apps managed authentication before turning the demo login into real member access.
