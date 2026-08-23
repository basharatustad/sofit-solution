const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const api = fs.readFileSync(path.join(root, 'api/contact/index.js'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'api/package.json'), 'utf8'));
const contact = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');

assert(contact.includes("fetch('/api/contact'"), 'contact form must POST to /api/contact');
assert(!api.includes('RESEND_API_KEY'), 'API must not depend on Resend');
assert(!api.includes('api.resend.com'), 'API must not call Resend');
assert(api.includes('COMMUNICATION_SERVICES_CONNECTION_STRING'), 'API must use Azure Communication Services connection string');
assert(api.includes('@azure/communication-email'), 'API must use Azure Communication Services Email SDK');
assert(pkg.dependencies && pkg.dependencies['@azure/communication-email'], 'package.json must declare Azure Communication Services Email SDK');

const bannerPath = path.join(root, 'assets/banner-overrides.css');
assert(fs.existsSync(bannerPath), 'banner override stylesheet must exist');
const banner = fs.readFileSync(bannerPath, 'utf8');
assert(banner.includes('object-fit: cover'), 'banner images must crop with object-fit: cover');
assert(/max-height:\s*(1[6-9]\d|2[0-4]\d)px/.test(banner), 'desktop banner height should stay thin (160-240px)');

console.log('patch checks passed');
