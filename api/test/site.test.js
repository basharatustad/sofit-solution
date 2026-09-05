"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

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

test("BizTalk artwork is a complete 3:2 PNG", () => {
  const image = fs.readFileSync(path.join(root, "biztalk-modernisation.png"));
  assert.equal(image.readUInt32BE(16), 1536);
  assert.equal(image.readUInt32BE(20), 1024);

  const idat = [];
  for (let offset = 8; offset < image.length; ) {
    const length = image.readUInt32BE(offset);
    const type = image.toString("ascii", offset + 4, offset + 8);
    if (type === "IDAT") idat.push(image.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  assert.doesNotThrow(() => zlib.inflateSync(Buffer.concat(idat)));
});

test("Training, Blog and Home insight photos share responsive heights", () => {
  const css = fs.readFileSync(path.join(root, "assets/style.css"), "utf8");
  assert.match(
    css,
    /\.feature-media img,\s*\.article-card img\s*\{[^}]*height:\s*180px;[^}]*max-height:\s*180px;/isu,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*620px\)[\s\S]*\.feature-media img,\s*\.article-card img\s*\{[^}]*height:\s*140px;[^}]*max-height:\s*140px;/iu,
  );
});

test("every Home insight card uses the aligned image-card structure", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const insights = html.slice(
    html.indexOf("Architecture guidance you can use"),
    html.indexOf("Start a conversation"),
  );
  const cards = Array.from(
    insights.matchAll(
      /<article class="card article-card">([\s\S]*?)<\/article>/giu,
    ),
  );

  assert.equal(cards.length, 3);
  for (const [, card] of cards) {
    assert.match(card, /<img\b[^>]*>/iu);
    assert.match(card, /<div class="card-body">/iu);
  }
  assert.match(
    cards[2][1],
    /src="biztalk-modernisation\.png"[\s\S]*width="1536"[\s\S]*height="1024"/iu,
  );
});

test("Resources includes the official Boomi Integration Editions guide", () => {
  const html = fs.readFileSync(path.join(root, "resources.html"), "utf8");
  const boomiSection = html.match(
    /<section class="resource-section" aria-labelledby="boomi-resources">([\s\S]*?)<\/section>/iu,
  );

  assert.ok(boomiSection, "Dell Boomi resource section is missing");
  assert.match(boomiSection[1], /<h2 id="boomi-resources">/iu);
  assert.match(boomiSection[1], /<h3>Boomi Integration Editions<\/h3>/iu);
  assert.match(
    boomiSection[1],
    /href="https:\/\/help\.boomi\.com\/docs\/Atomsphere\/Integration\/Getting%20started\/c-atm-AtomSphere_Editions_bde0b272-5d32-46ec-82ea-6f9ffe98bd63"/iu,
  );
  assert.match(boomiSection[1], /target="_blank"/iu);
  assert.match(boomiSection[1], /rel="noopener"/iu);
});
