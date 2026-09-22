# Chrome Web Store listing: Hissab

Paste-ready answers for each field in the Chrome Web Store developer dashboard.
Everything here describes version 4.0.0 of the extension (`extension/`) as
built from this repo.

---

## Store listing tab

### Short description

127 characters (limit 132):

```
Type math the way you'd say it. Exact answers for units, dates, percentages, money, developer math and graphs, in your toolbar.
```

If the dashboard shows the summary as read-only ("from package"), it is taken
from `description` in `extension/manifest.config.ts`, which currently reads
*"Strict, unit-aware calculator for units, dates, percentages, finance and
developer math, with inline results and graphs."* To use the line above
instead, change it there and rebuild.

### Description

The store renders this as plain text: line breaks are kept, markdown is not.

```
Hissab is a calculator you write in like a notepad. Put one calculation on each line, in plain words, and the answer appears on the right as you type.

5 km to miles → 3.1069 miles
20% of 150 → 30
3:30 pm pst in london → 11:30 pm london
emi(360000, 6.5%, 30 years) → 2,275.4449
255 to hex → 0xff

What it can do
• Units: length, weight, volume, temperature, speed, area, data, energy, pressure and more, including compound units such as km per hour. If the units don't match, you get an error instead of a wrong answer.
• Dates and times: add durations to dates, measure the time between two dates, convert times across time zones, and turn Unix timestamps into readable dates.
• Percentages and money: percent of, discounts, sales tax, tips, loan EMIs, simple and compound interest, CAGR, NPV and IRR.
• Developer math: hex, binary and octal, bitwise operators, IPv4 and IPv6 addresses and subnets, colors, hashes (MD5, SHA-1, SHA-256, SHA-3, CRC32 and more), UUIDs and random IDs.
• Math and science: trigonometry, logarithms, statistics, combinatorics, complex numbers, matrices, symbolic algebra, and derivatives and integrals shown in proper math notation.
• Graphs: draw(sin(x), cos(x)) plots curves right under your calculations.

Works like a scratchpad
• Name a value once (price = 1299) and use it on any later line.
• Refer to earlier results with prev, or by line number (line3).
• Double-click a result to copy it.
• Click a color or a date to change it with a picker.
• Your sheet saves automatically and is waiting the next time you open the popup.

Private by design
• No account and no sign-in.
• No permissions: Hissab can't see or change the pages you visit.
• No analytics or tracking. Your calculations stay on your device.
• Works offline.

Upgrading from Hissab 3.x? The calculations from your last notebook are brought over the first time you open the new popup.

More from Hissab
The full notebook app, with multiple notebooks and optional AI features, is free at https://hissab.io. There is also a command-line tool and an npm library for developers, and a skill that lets AI agents hand their math to Hissab.

Hissab is open source under the MIT license: https://github.com/rawbytess/hissab
```

### Category and language

- Category: **Tools** (the closest fit; **Education** is the alternative if
  you'd rather reach students).
- Language: **English**.

### Graphics

All files are in `store/images/`, 24-bit PNG with no alpha, at the exact
required sizes.

| Dashboard slot | File |
| --- | --- |
| Screenshot 1 | `screenshot-1-overview-1280x800.png` |
| Screenshot 2 | `screenshot-2-units-dates-1280x800.png` |
| Screenshot 3 | `screenshot-3-finance-1280x800.png` |
| Screenshot 4 | `screenshot-4-developer-1280x800.png` |
| Screenshot 5 | `screenshot-5-graphs-1280x800.png` |
| Small promo tile (440×280) | `promo-small-440x280.png` |
| Marquee promo tile (1400×560) | `promo-marquee-1400x560.png` |

The store icon (128×128) is `extension/public/icons/128.png`.

### Links

- Official URL / homepage: `https://hissab.io`
- Support URL: `https://github.com/rawbytess/hissab/issues`

---

## Privacy practices tab

### Single purpose

```
Hissab is a calculator. The user types calculations in plain language into the toolbar popup and sees exact results as they type. Everything the extension does (unit, date, percentage, finance and developer calculations, and plotting the functions the user writes) serves that one purpose. It has no features that read, change or interact with web pages or browsing.
```

### Permission justification

The extension requests **no permissions and no host permissions**, so there is
nothing to justify. If the dashboard still shows a permissions section, leave it
empty.

### Are you using remote code?

Select **No, I am not using remote code.**

If a justification box appears anyway, or a reviewer asks:

```
All JavaScript, WebAssembly and CSS ship inside the extension package. The popup loads no external scripts or modules and does not use eval() or new Function(). Expressions the user types are parsed and evaluated by the bundled Hissab engine; they are never executed as JavaScript. The manifest's CSP adds 'wasm-unsafe-eval' only so the bundled hashing library (hash-wasm, for md5/sha256/crc32 etc.) can instantiate its own WebAssembly, which is packaged with the extension. The only external request is a font file (Chillax) from fonts.cdnfonts.com, which is not code.
```

### Data usage: what user data do you collect?

Leave **every box unchecked**. The extension collects nothing. For your records
(and a reviewer), here is why each category is empty:

| Category | Collected? | Why not |
| --- | --- | --- |
| Personally identifiable information | No | No account, sign-in, or form. |
| Health information | No | Health formulas such as BMI run on numbers typed into the popup and are never stored off the device or sent anywhere. |
| Financial and payment information | No | Finance formulas run locally; no payments or account data. |
| Authentication information | No | No logins, passwords or API keys. |
| Personal communications | No | No messaging, email or chat. |
| Location | No | No geolocation or IP lookup; time-zone conversion uses built-in data. |
| Web history | No | No `tabs`, `history` or host permissions; it can't see what you browse. |
| User activity | No | Keystrokes go only into the popup's own editor and are evaluated on the device. No analytics, click or scroll tracking. |
| Website content | No | No content scripts or host permissions; it can't read pages. |

The calculations typed into the popup are kept in the extension's own
`localStorage` on the user's device and are never transmitted, so they don't
count as collected data under the Web Store definition.

### Certifications

Check all three:

- [x] I do not sell or transfer user data to third parties, outside of the
  approved use cases.
- [x] I do not use or transfer user data for purposes that are unrelated to my
  item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for
  lending purposes.

### Privacy policy URL

```
https://hissab.io/privacy/
```

This page was missing: the Astro site that used to serve it was removed from
the repo in June. It is now a static page in the web app at
`app/public/privacy/index.html`, and goes live the next time the app deploys.
It covers the extension, the web app, the CLI and the npm package.
