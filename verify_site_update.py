#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent

def fail(msg):
    print("FAIL:", msg)
    sys.exit(1)

html_files = list(ROOT.glob("*.html"))
if not html_files:
    fail("No HTML files found")

for p in html_files:
    text = p.read_text(encoding="utf-8")
    if "SOF IT Solution" in text.replace("SOF IT Solutions", ""):
        fail(f"{p.name}: singular brand still appears")
    if re.search(r'href=["\']?about\.html["\']?[^>]*>About</a>', text, re.I):
        fail(f"{p.name}: About nav label not updated")

training = ROOT / "training.html"
if training.exists():
    t = training.read_text(encoding="utf-8")
    if "Online • Corporate • 1:1" in t:
        fail("Training top hero tag still present")
    if "1:1 coaching" not in t.lower():
        fail("Training lower 1:1 coaching section was removed")
    if 'alt="BizTalk and Azure integration concept"' not in t:
        fail("BizTalk training image missing")

blog = ROOT / "blog.html"
if blog.exists():
    b = blog.read_text(encoding="utf-8")
    if 'alt="BizTalk and Azure modernisation concept"' not in b:
        fail("BizTalk blog image missing")

about = ROOT / "about.html"
if about.exists():
    a = about.read_text(encoding="utf-8")
    if "<title>About Us | SOF IT Solutions</title>" not in a:
        fail("About page title not updated")

css_path = ROOT / "assets" / "style.css"
if not css_path.exists():
    fail("assets/style.css missing")
css = css_path.read_text(encoding="utf-8")
for required in [
    "height: 180px;",
    "max-height: 180px;",
    "height: 140px;",
    ".resource-hero-image",
]:
    if required not in css:
        fail(f"CSS missing expected banner rule: {required}")

print("PASS: branding, About Us navigation, Training hero/BizTalk image, Blog BizTalk image, and banner sizing.")
