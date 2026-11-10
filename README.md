# Newly

A calm, glassy new tab page with an Apple Liquid Glass UI — a wallpaper you choose, weather, clock, calendar, quotes, shortcuts and prayer times. Chrome / Brave / Edge and Firefox 128 ESR+ (liquid glass don't work on firefox sadly..) (Manifest V3), from one shared folder.

**Download:** [HERE!](https://github.com/zClovince/Newly/Releases) — free, source included, fork it and make it yours.

### What's new in 2.2 — Polish

- **Liquid Glass polish** — every card, panel and popup now reflects the scene at all four edges (perhaps will improve it later if found new implemantation)
- **Weather (BMKG)** —  Weather now fetched from BMKG if Indonesian City is placed,Open-Mateo if the api fail/non Indonesian city was typed.
- **Stocks/Crypto** — New Stocks / Cyrptocurrency Widget with Realtime Update, fully customizable, Fetched from Yahoo!
- **Minor Improvement** — Honestly, i'm too lazy to explain it but few re-wording for few feature so it match the whole feature like "Calm Wave" instead old "Calm Flow" 
- **Fix** — Few polishment to upgrade performance

### What's new in 2.1 — Silk Waves

- **Layered silk-wave gradient** — the Calm Gradient (now is Calm Flow in 2.2) is now a live wallpaper of parallel ribbons tilted to fall from the upper-left to the lower-right, each a flat colour with a soft shadow where it laps over the ribbon behind. Colours ramp from near-black at the back to pale cream at the front, and the whole ramp always spans the window, whatever its size.


### What's new in 2.0 — Liquid Glass (Beta)

- **A real glass lens** — behind every card and sheet, the scene is bent through a small SVG displacement lens, not just blurred. The rim gathers the backdrop like a curved pane; the middle stays calm and readable.
- **Sheets without the flash** — panels no longer fade their opacity on open (which disabled `backdrop-filter` for a moment and showed the wrong, darker glass). The scrim fades its colour instead, and the scene behind a sheet blurs softly on its own layer.
- **One recipe everywhere** — settings, every widget window, prayer and changelog now share the search bar's scrim-then-sheet structure, so content is readable over any wallpaper.
- **Apple-style controls** — a thin accent-filled slider with a white capsule thumb, and a pill segmented control with a raised capsule for the selected segment.
- **Calmer details** — selection boxes and rich dropdowns match the glass, scrollbars stay inside rounded panels, and clock/date option previews show the live time and date.
- **Fixed** — the calendar follows the chosen time source (device or weather city), and the weather's rain-time line follows 12/24-hour correctly.
- **Credit** — the design follows Apple's [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass) guidance; the SVG-displacement approach is inspired by the liquid-glass CSS recipes collected at [freefrontend.com](https://freefrontend.com/). The lens, its runtime map and the sheet structure are Newly's own implementation.

### So what does Newly do that your default new tab doesn't do??

- **Liquid Glass everywhere** — every card, panel, button and popup is made of the same material, with adjustable blur, tint and thickness. (1.0 was glassmorphism; 2.0 adds the refractive lens.)
- **A wallpaper you choose** — **Calm Flow** (a still, soft colour scheme that asks a little less of your battery) **or??**
- **Video Wallpaper** (your own clip behind the glass, with zoom and pan). New tabs open on the gradient, so there's never a black screen. (feature from the original fork Kaveman12)
- **Weather** — Open-Meteo for a city you type: conditions, temperature, rain chance and an “expect rain around HH:MM” line, in °C or °F.
- **Clock, date and calendar** — a 12/24-hour choice, several clock styles, and a month grid with today ringed.
- **Greeting** — use your name, show the time, or keep it minimal.
- **Quotes** — flip through categories, grab a new one on demand, or add your own.
- **Prayer times** — shown while the Qur'an verse category is on: next prayer, time and live countdown, with an optional reminder popup before each prayer.
- **Shortcuts and search** — a row of tiles you can point at any site, favicons cached offline, and a Google search bar (Ctrl / ⌘ + K).
- **Status tile** — connection at a glance, plus device details, storage use, a connection test and a rename field.
- **Make it yours** — drag and resize every widget, nudge with Left / Top sliders, change text colour and overall scale, style the browser tab, and export / import your settings.
- **Fonts** — **Plus Jakarta Sans** is bundled inside Newly, so a clean typeface is there from the first tab, offline. A few more are one click away, and any Google Fonts name works — with a clear “applied” or “couldn't find it” message.
- **Private by design** — all local: settings in the browser's storage, video in an offline cache. No accounts, no tracking, no GPS. Weather and prayer times send only the city you typed.
- **One build, two browsers** — the same folder runs in Chrome, Brave, Edge and Firefox. (bug on firefox since it doesn't behave like chromium, sadly it won't work on Safari..)

psstt if you're muslim, you'll love using Qur'an Verse, secret feature will appear (already teased in the upper above tho) 

## Files

- `newtab.html` — markup + styles.
- `script.js` — everything else (settings, widgets, APIs, backups).
- `manifest.json` — MV3 manifest.
- `fonts/` — bundled Plus Jakarta Sans (latin + latin-ext), so the default font works offline.
- `README.md` — this file.
- `CHANGELOG.md` — full version history (included in every release ZIP).
- `CARA-INSTALL.txt` — step-by-step install guide in Indonesian.
- `LICENSE` — CC0 1.0 Universal (public domain).

## Install

1. Open `brave://extensions/` or `chrome://extensions/`.
2. Enable **Developer mode**.
3. **Load unpacked** → select this folder.
4. Open a new tab.

Indonesian step-by-step: see **`CARA-INSTALL.txt`**.

## Publish / share

This folder is already repo-ready: `manifest.json`, `newtab.html`, `script.js`, `README.md`, `CHANGELOG.md`, `LICENSE` (CC0) and the Indonesian guide. `.gitignore` keeps build artifacts, the unused `sample.mp4` and personal notes out of the repo.

1. Create a repository on GitHub (public is fine).
2. Upload the files above (or `git init` + push this folder).
3. Tag a release and attach the ZIP **without** the video: the extension needs no media to run.

## Known issues

- **Firefox bug**  — Since firefox works differently and Newly is focused on chromium based browser, it won't behave as intended
- **Microsoft Edge icon bug** — Known bug on Microsoft Edge won't change even if you choose/upload your own icon (don't kno why lol)
- **Widget size/position changing randomly**  — Still on works, sometime on different enviroment the widget keep "dancing" on it's own
- **Performance drop** — Random fps drop when liquid glass applied, already polished but who knows when the bug linger?
- **BMKG API Fails** — Few known bug happen that even if Indonesian city is placed, the weather still fetched from Open Mateo, will fix if know the "why?" 

## Credits

- Original base: [TheKaveman12 – Custom New Tab for Brave](https://github.com/TheKaveman12/Custom-New-Tab-for-Brave/releases/tag/v1.0)
- Liquid Glass design guidance: [Apple — Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass). SVG-displacement approach inspired by the liquid-glass CSS recipes collected at [freefrontend.com](https://freefrontend.com/). The lens, its runtime map and the sheet structure are Newly's own implementation. (more like deepseek & claude haha)
- Made & designed by **[Clovince](https://github.com/zClovince)**
- Code ideas & polishing: **[ChatGPT](https://chatgpt.com/) · [Claude](https://claude.ai/) · [Gemini](https://gemini.google.com/)**
- Earlier performance passes, UI polish, rain timing and Firefox support: **[DeepSeek](https://www.deepseek.com/)**
- Weather & geocoding: **Open-Meteo**
- Prayer times: **Aladhan**
- Quotes: **dummyjson**, **bible-api.com**, **alquran.cloud**
- Qur'an translation: **Muhammad Marmaduke Pickthall** (public domain)

unCopyright © [Clovince](https://github.com/zClovince) – 2026. Remix it, break it, improve it.
