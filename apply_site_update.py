#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
html_files = list(ROOT.glob("*.html"))
style_path = ROOT / "assets" / "style.css"

if not html_files:
    print("ERROR: No HTML files found. Put this script in the repository root.")
    sys.exit(1)
if not style_path.exists():
    print("ERROR: assets/style.css not found.")
    sys.exit(1)

# 1) Site-wide brand and navigation naming.
for path in html_files:
    text = path.read_text(encoding="utf-8")
    text = text.replace("SOF IT Solution", "SOF IT Solutions")
    text = text.replace("SOF <span>IT Solution</span>", "SOF <span>IT Solutions</span>")
    text = text.replace(
        'SOF <span style="color:#1677ff">IT Solution</span>',
        'SOF <span style="color:#1677ff">IT Solutions</span>',
    )
    text = re.sub(
        r'(<a\s+href=["\']?about\.html["\']?[^>]*>)About(</a>)',
        r'\1About Us\2',
        text,
        flags=re.IGNORECASE,
    )
    path.write_text(text, encoding="utf-8")

# 2) Training page targeted updates.
training = ROOT / "training.html"
if training.exists():
    text = training.read_text(encoding="utf-8")

    # Remove only the top hero tag; lower 1:1 coaching content remains.
    text = re.sub(
        r'\s*<span class="tag">Online\s*•\s*Corporate\s*•\s*1:1</span>\s*',
        "\n          ",
        text,
        count=1,
    )

    # Remove previous inline compact-banner style, if present.
    text = re.sub(
        r'\s*<style>\s*/\*\s*Compact featured course artwork: banner rather than full-height image\s*\*/.*?</style>\s*',
        "\n",
        text,
        flags=re.DOTALL,
    )

    if 'BizTalk Developer &amp; Integration program' in text and 'alt="BizTalk and Azure integration concept"' not in text:
        old = '''<article class="card">
              <span class="tag">BizTalk &amp; Azure</span>
              <h3>BizTalk Developer &amp; Integration program</h3>'''
        new = '''<article class="card feature-media">
              <img
                src="cloud-integration-hero.webp"
                width="1672"
                height="941"
                loading="lazy"
                alt="BizTalk and Azure integration concept"
              />
              <div class="card-body">
                <span class="tag">BizTalk &amp; Azure</span>
                <h3>BizTalk Developer &amp; Integration program</h3>'''
        text = text.replace(old, new, 1)

        old_end = '''<a href="biztalk-complete-training.html">View curriculum →</a>
            </article>'''
        new_end = '''<a href="biztalk-complete-training.html">View curriculum →</a>
              </div>
            </article>'''
        text = text.replace(old_end, new_end, 1)

    training.write_text(text, encoding="utf-8")

# 3) Blog page: add image to the BizTalk article card.
blog = ROOT / "blog.html"
if blog.exists():
    text = blog.read_text(encoding="utf-8")
    if 'Modernise integration without a big-bang migration' in text and 'alt="BizTalk and Azure modernisation concept"' not in text:
        old = '''<article class="card">
              <span class="tag">BizTalk &amp; Azure</span>
              <h2>Modernise integration without a big-bang migration</h2>'''
        new = '''<article class="card article-card">
              <img
                src="cloud-integration-hero.webp"
                width="1672"
                height="941"
                loading="lazy"
                alt="BizTalk and Azure modernisation concept"
              />
              <div class="card-body">
                <span class="tag">BizTalk &amp; Azure</span>
                <h2>Modernise integration without a big-bang migration</h2>'''
        text = text.replace(old, new, 1)

        old_end = '''<a href="blog-biztalk-modernisation.html">Read article →</a>
            </article>'''
        new_end = '''<a href="blog-biztalk-modernisation.html">Read article →</a>
              </div>
            </article>'''
        text = text.replace(old_end, new_end, 1)

    blog.write_text(text, encoding="utf-8")

# 4) About page title/hero naming.
about = ROOT / "about.html"
if about.exists():
    text = about.read_text(encoding="utf-8")
    text = re.sub(
        r'<title>.*?</title>',
        '<title>About Us | SOF IT Solutions</title>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = text.replace('<span class="tag">About us</span>', '<span class="tag">About Us</span>')
    about.write_text(text, encoding="utf-8")

# 5) Shared image banner styling.
css = style_path.read_text(encoding="utf-8")

css = re.sub(
    r'\.feature-media img,\s*\.article-card img\s*\{\s*width:\s*100%;\s*aspect-ratio:\s*3/2;\s*object-fit:\s*cover;\s*\}',
    '''.feature-media img,
.article-card img {
  width: 100%;
  height: 180px;
  max-height: 180px;
  aspect-ratio: auto;
  object-fit: cover;
  object-position: center;
}''',
    css,
    flags=re.DOTALL,
)

css = re.sub(
    r'\.resource-hero-image\s*\{\s*width:\s*100%;\s*max-height:\s*520px;\s*object-fit:\s*cover;',
    '''.resource-hero-image {
  width: 100%;
  height: 180px;
  max-height: 180px;
  object-fit: cover;
  object-position: center;''',
    css,
    flags=re.DOTALL,
)

mobile_rule = '''
/* Compact image banners on smaller screens */
@media (max-width: 620px) {
  .feature-media img,
  .article-card img,
  .resource-hero-image {
    height: 140px;
    max-height: 140px;
  }
}
'''

if "/* Compact image banners on smaller screens */" not in css:
    marker = "@media (prefers-reduced-motion: reduce)"
    if marker in css:
        css = css.replace(marker, mobile_rule + "\n" + marker)
    else:
        css += "\n" + mobile_rule

style_path.write_text(css, encoding="utf-8")

print(f"Updated {len(html_files)} HTML files.")
print("Updated assets/style.css.")
print("Site-wide name: SOF IT Solutions")
print("Navigation: About Us")
print("Training top Online/Corporate/1:1 tag removed; lower 1:1 section retained.")
print("BizTalk training/blog images added.")
print("Training/Blog/Resources images: 180px desktop, 140px mobile.")
