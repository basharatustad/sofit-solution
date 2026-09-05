"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));

function localTargets(html) {
  return Array.from(html.matchAll(/(?:href|src)=["']?([^"' >]+)/giu))
    .map((match) => match[1])
    .filter((target) => !/^(?:https?:|mailto:|tel:|#)/iu.test(target))
    .map((target) => target.split(/[?#]/u)[0])
    .filter(Boolean);
}

test("every local HTML, script, stylesheet and image reference exists", () => {
  const missing = [];

  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    for (const target of localTargets(html)) {
      if (!fs.existsSync(path.join(root, target))) {
        missing.push(`${file} -> ${target}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test("all public pages expose Blog and Resources navigation", () => {
  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(
      html,
      /href=["']?blog\.html/iu,
      `${file} is missing Blog navigation`,
    );
    assert.match(
      html,
      /href=["']?resources\.html/iu,
      `${file} is missing Resources navigation`,
    );
  }
});

test("MuleSoft Foundation no longer contains the removed project passage", () => {
  const html = fs.readFileSync(
    path.join(root, "mulesoft-foundation.html"),
    "utf8",
  );
  assert.doesNotMatch(html, /Client\s*→\s*HTTP Listener/iu);
  assert.doesNotMatch(html, /Build a working Mule application using/iu);
  assert.doesNotMatch(
    html,
    /Then debug the application, inspect the Mule Event/iu,
  );
});

test("contact form preserves the backend contract", () => {
  const html = fs.readFileSync(path.join(root, "contact.html"), "utf8");
  for (const id of [
    "contactForm",
    "contactName",
    "contactEmail",
    "contactService",
    "contactMessage",
    "sendBtn",
    "contactStatus",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`, "u"));
  }
  assert.match(html, /assets\/contact\.js/u);
});

test("non-home content images use the training image dimensions", () => {
  const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "assets/style.css"), "utf8");

  assert.match(home, /<body\s+class=["']home-page["']>/iu);
  assert.match(
    css,
    /body:not\(\.home-page\)\s+main\s+img\s*\{[^}]*height:\s*180px;[^}]*max-height:\s*180px;[^}]*object-fit:\s*cover;[^}]*object-position:\s*center;/isu,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*620px\)\s*\{[\s\S]*body:not\(\.home-page\)\s+main\s+img\s*\{[^}]*height:\s*140px;[^}]*max-height:\s*140px;/iu,
  );
});

test("blog presents BizTalk artwork and AI integration guidance", () => {
  const html = fs.readFileSync(path.join(root, "blog.html"), "utf8");

  assert.match(html, /src=["']biztalk-modernisation\.png["']/iu);
  assert.match(html, /AI and intelligent integrations/iu);
  for (const topic of ["AI agents", "ChatGPT", "OpenAI", "Claude", "MuleSoft"]) {
    assert.match(html, new RegExp(topic, "iu"));
  }
});

test("service and home pages present expanded digital capabilities", () => {
  const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const services = fs.readFileSync(path.join(root, "services.html"), "utf8");

  for (const topic of ["Dell Boomi", "AI Services &amp; Automation"]) {
    assert.match(home, new RegExp(topic, "iu"));
  }
  for (const topic of [
    "Desktop support",
    "DNS, domains &amp; business email",
    "Website setup &amp; maintenance",
    "SEO &amp; search visibility",
    "Social media &amp; business setup",
  ]) {
    assert.match(services, new RegExp(topic, "iu"));
  }
});
