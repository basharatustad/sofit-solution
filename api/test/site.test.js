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
