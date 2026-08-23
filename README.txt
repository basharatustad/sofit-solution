SOF IT Solutions — Whole Website Update

Put BOTH Python files in the ROOT of your current sofit-solution repository
(the same folder as index.html, training.html, blog.html, resources.html).

Run:

1) Before applying, the verification should fail because the old site does not
   meet all new requirements:
   python3 verify_site_update.py

2) Apply:
   python3 apply_site_update.py

3) Verify:
   python3 verify_site_update.py

The update:
- Changes "SOF IT Solution" to "SOF IT Solutions" across all root HTML pages.
- Changes navigation "About" to "About Us", keeping about.html as the URL.
- Changes the About page title to "About Us | SOF IT Solutions".
- Removes only the top "Online • Corporate • 1:1" tag on Training.
- Keeps the lower 1:1 coaching section.
- Adds an image to the BizTalk & Azure training card.
- Adds an image to the BizTalk article card on blog.html.
- Makes Training and Blog card images 180px desktop / 140px mobile.
- Makes the Resources hero image 180px desktop / 140px mobile.
- Keeps images undistorted using object-fit: cover.

After PASS:

git add .
git commit -m "Update SOF IT Solutions branding and compact image banners"
git push origin main

Azure Static Web Apps will then deploy from main.
