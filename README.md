# Newly
<img width="1899" height="798" alt="image" src="https://github.com/user-attachments/assets/c121ff59-04e9-42b6-a552-46ae7813430b" />

A calm, glassy new tab page with an Apple Liquid Glass UI (inspired like typical perfumery) — a wallpaper you choose, weather, clock, calendar, quotes, shortcuts and prayer times. Chrome / Brave / Edge and Firefox 128 ESR+ (liquid glass won't work on firefox sadly..).

**Download:** [HERE!](https://github.com/zClovince/Newly/releases) — free, source included, fork it and make it yours.

### So what does Newly do that your default new tab don't??

- **Liquid Glass everywhere** — every card, panel, button and popup is made of the same material, with adjustable blur, tint and more. (1.0 was glassmorphism; 2.0 was a whole Brand New Day!)
- **A wallpaper you choose** — **Calm Flow** (a wave or still, soft colour scheme that will dance even she asks a little less of your battery) **or??**
- **Video Wallpaper** (your own clip behind the glass) want to use custom waifu wallpaper? go ahead no one gonna judge you anyway.. (feature from the original fork Kaveman12)
- **Weather** — Open-Meteo/BMKG source weather for a city you type: conditions, temperature, rain information, of course come  in °C or °F if you use other metrics like american.
- **Stocks/Crypto** — Want to know whether ihsg/$RACA crashed again today? just let the widget do her things.
- **Clock, date and calendar** — a 12/24-hour choice, several clock styles, and a month grid with today ringed.
- **Greeting** — use your weirdest name, show the time, or keep it minimal.
- **Quotes** — flip through existential dread or Religious vibe categories, grab a new one on demand, or shove your own.
- **Prayer times** — shown while the Qur'an verse category is on: next prayer, time and live countdown, with an optional reminder popup before each prayer.
- **Shortcuts and search** — a row you can point at any site, favicons cached offline, and a Google search bar (Ctrl / ⌘ + K).
- **Status tile** — your typical all-in-one device check (not really accurate but who will be mad anyway?) also check update for Newly!
- **Make it yours** — drag and resize every widget, nudge with Left / Top sliders, change text colour and overall scale, style the browser tab, and export / import your settings.
- **Fonts** — **Plus Jakarta Sans** is bundled inside Newly, so a clean typeface is there from the first tab, offline. A few more are one click away, and any Google Fonts name works, just type let newly do her things!
- **Private by design** — all local: settings in the browser's storage, video in an offline cache. No accounts, no tracking, no GPS. Weather and prayer times send only the city you typed. No Tracking No information sent to intelligence (trust me bro!).
- **One build, two browsers** — the same folder runs in any chromium browser Chrome, Brave, Edge or Firefox. (bug on firefox since it doesn't behave like chromium, sadly it won't work on Safari..)

psstt if you're muslim, you'll love using Qur'an Verse, secret feature will appear (already teased in the upper above tho)

### What's new in 2.2 — Polish

- **Liquid Glass polish** — every card, panel and popup now reflects the scene at all four edges (perhaps will improve it later if found new implemantation)
- **Weather (BMKG)** —  Weather now fetched from BMKG if Indonesian City is placed,Open-Mateo if the api fail/non Indonesian city was typed.
- **Stocks/Crypto** — New Stocks / Cyrptocurrency Widget with Realtime Update, fully customizable, Fetched from Yahoo!
- **Minor Improvement** — Honestly, i'm too lazy to explain it but few re-wording for few feature so it match the whole feature like "Calm Wave" instead old "Calm Flow" 
- **Fix** — Few polishment to upgrade performance

## Files you'll break if you pour too much love innit 

- `newtab.html` — markup + styles.
- `script.js` — everything else (settings, widgets, APIs, backups).
- `manifest.json` — MV3 manifest.
- `fonts/` — bundled Plus Jakarta Sans (latin + latin-ext), so the default font works offline.
- `README.md` — this whole file you read.
- `CHANGELOG.md` — full version history (included in every release ZIP).
- `CARA-INSTALL.txt` — step-by-step install guide in Indonesian.
- `LICENSE` — CC0 1.0 Universal (public domain).

## Install

1. Open `brave://extensions/` or `chrome://extensions/`.
2. Enable **Developer mode**.
3. **Load unpacked** → select this folder.
4. Open a new tab.
5. Explore!

Indonesian step-by-step: see **`CARA-INSTALL.txt`**.

## Known issues

- **Firefox bug**  — Since firefox works differently and Newly is focused on chromium based browser, it won't behave as intended
- **Microsoft Edge icon bug** — Edge's persistency is annoying, icon won't change even if you choose/upload your own icon (don't kno why lol)
- **Widget size/position changing randomly**  — Still on works, sometime on different enviroment the widget keep "dancing" on it's own
- **Performance drop** — Random fps drop when liquid glass applied, already polished but who knows when the bug linger?
- **BMKG API Fails** — Few known bug happen that even if Indonesian city is placed, the weather still fetched from Open Mateo, will fix if know the "why?"

## Credits

- Original base: [TheKaveman12 – Custom New Tab for Brave](https://github.com/TheKaveman12/Custom-New-Tab-for-Brave/)
- Liquid Glass design guidance: [Apple — Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass). SVG-displacement approach inspired by the liquid-glass CSS recipes collected at [freefrontend.com](https://freefrontend.com/). The lens, its runtime map and the sheet structure are Newly's own implementation. (more like deepseek & claude haha)
- Made & designed by **[Clovince](https://github.com/zClovince)**
- Code ideas & polishing: **[ChatGPT](https://chatgpt.com/) · [Claude](https://claude.ai/) · [Gemini](https://gemini.google.com/)**
- Every single vibecoding, hail to chineese model: **[DeepSeek](https://www.deepseek.com/)**
- Weather & geocoding: **Open-Meteo**
- Prayer times: **Aladhan**
- Quotes: **dummyjson**, **bible-api.com**, **alquran.cloud**
- Qur'an translation: **Muhammad Marmaduke Pickthall** (public domain)

[Clovince](https://github.com/zClovince) – 2026. Remix it, break it, improve it.
