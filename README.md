# Newly
<img width="958" height="430" alt="image" src="https://github.com/user-attachments/assets/3c90b3d4-639e-4e5d-b072-06d3ef7930a9" />

A calm, glassy new tab page with an Apple Liquid Glass UI — a wallpaper you choose, weather, clock, calendar, quotes, shortcuts and prayer times. Chrome / Brave / Edge and Firefox 128 ESR+ (Manifest V3), from one shared folder.

**Repository:** [github.com/zClovince/Newly](https://github.com/zClovince/Newly) — free, source included, fork it and make it yours.

## 1.0

Newly is the new name for this project (it began as *Custom New Tab*). Everything sits on one screen, and you decide what shows, where it sits and how it looks.

- **Liquid Glass everywhere** — every card, panel, button and popup is frosted glass with soft blur, a gentle hover lift and springy animations. Blur, tint and thickness are adjustable.
- **A wallpaper you choose** — **Calm Gradient** (a still, soft colour scheme that asks a little less of your battery) or **Video Wallpaper** (your own clip behind the glass, with zoom and pan). New tabs open on the gradient, so there's never a black screen.
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
- **One build, two browsers** — the same folder runs in Chrome, Brave, Edge and Firefox.

## Install

1. Open `brave://extensions/` or `chrome://extensions/`.
2. Enable **Developer mode**.
3. **Load unpacked** → select this folder.
4. Open a new tab.

Indonesian step-by-step: see **`CARA-INSTALL.txt`**.

## Publish / share

This folder is already repo-ready: `manifest.json`, `newtab.html`, `script.js`, `README.md`, `CHANGELOG.md`, `LICENSE` (CC0) and the Indonesian guide. `.gitignore` keeps build artifacts.

1. Create a repository on GitHub (public is fine — it is CC0).
2. Upload the files above (or `git init` + push this folder).
3. Tag a release and attach the ZIP **without** the video: the extension needs no media to run.

A ready-to-share `Newly-1.0.zip` is generated next to this folder on request.

## Credits

- Original base: [TheKaveman12 – Custom New Tab for Brave](https://github.com/TheKaveman12/Custom-New-Tab-for-Brave/releases/tag/v1.0)
- Made & designed by **[Clovince](https://github.com/zClovince)**
- Code ideas & polishing: **[ChatGPT](https://chatgpt.com/) · [Claude](https://claude.ai/) · [Gemini](https://gemini.google.com/)**
- Earlier performance passes, UI polish, rain timing and Firefox support: **[DeepSeek](https://www.deepseek.com/)**
- Weather & geocoding: **Open-Meteo**
- Prayer times: **Aladhan**
- Quotes: **dummyjson**, **bible-api.com**, **alquran.cloud**
- Qur'an translation: **Muhammad Marmaduke Pickthall** (public domain)

unCopyright © [Clovince](https://github.com/zClovince) – 2026. Remix it, break it, improve it.
