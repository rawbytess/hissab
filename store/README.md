# Chrome Web Store assets

Everything needed to fill in the Hissab extension's Chrome Web Store listing.

| Path | What it is |
| --- | --- |
| `listing.md` | Paste-ready text for every dashboard field: short description, description, single purpose, remote code, data usage, privacy policy URL. |
| `images/` | Final store images (5 screenshots, small and marquee promo tiles). Upload these. |
| `mockups/` | The HTML pages the images are rendered from, one per image, plus `styles.css`. |
| `mockups/captures/` | Real 2x screenshots of the built popup, used inside the mockups. Generated. |
| `samples/` | The calculations shown in each popup capture. |
| `scripts/render.mjs` | Captures the popup and renders the mockups to `images/`. |

## Re-rendering

The popup in every image is the real, built popup, not a redraw. To refresh
the images after changing the extension, a sample, or a mockup:

```bash
pnpm -F ./extension build     # from the repo root
cd store
npm install                   # first time only: playwright-core + sharp
npm run render                # capture the popup, then render all images
npm run render:mockups        # re-render from existing captures only
node scripts/render.mjs --skip-capture --only=promo-small   # one image
```

This needs Google Chrome installed; Playwright drives it directly and downloads
no browser. The capture serves `extension/dist` with the same CSP the manifest
declares, so anything the extension's policy would block also fails in the
captures. Dates in the samples (`today + 3 weeks`) resolve to the day you
render.

To preview a mockup while editing it, serve the folder (`npx serve
store/mockups`) and open the page in Chrome at its store size. Opened from
`file://`, the Chillax headline font may be blocked.
