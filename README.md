# Haanim Pietersen · Portfolio

Personal portfolio: software developer & AI engineer, Cape Town.

## Files

- `index.html`: the page and all its content
- `css/style.css`: all the styling (colours are at the top, under `:root`)
- `js/main.js`: the 3D scenes and animations
- `js/portrait.js`: your photo, embedded for the 3D opening scene
- `assets/haanim-portrait.webp`: your photo, used in the header, menu and footer

## Opening it

You need to be online, because the fonts, Three.js (3D), GSAP (scroll animations) and Lenis (smooth scrolling) load from the web.

**In VS Code (recommended):**
1. Open the `haanim-portfolio` folder in VS Code (File → Open Folder).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.

You can also just double-click `index.html` to open it in your browser.

## Putting it online

Drag the whole `haanim-portfolio` folder onto Netlify Drop (app.netlify.com/drop), or push it to GitHub and deploy it with Vercel or Netlify.

## Editing content

- **Projects:** in `js/main.js`, search for `const ITEMS`. Each line is one project: type, name, tag, description, link, preview, colours.
- **Experience and education:** in `js/main.js`, search for `const E = [` (experience) and `const S = [` (education).
- **Causes:** in `index.html`, search for `class="causes"`.
- **Kind words:** in `index.html`, search for `class="kwc"`.
