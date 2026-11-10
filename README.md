# Newly
<img width="956" height="402" alt="image" src="https://github.com/user-attachments/assets/11a68584-9f9e-4556-99c1-887413ebcdca" />

A calm, glassy new tab page with an Apple Liquid Glass UI — a wallpaper you choose, weather, clock, calendar, quotes, shortcuts and prayer times. Chrome / Brave / Edge and Firefox 128 ESR+ (Manifest V3), from one shared folder.

**Download:** [HERE!](https://github.com/zClovince/Newly/Releases) — free, source included, fork it and make it yours.

### What's new in 2.1 — Silk Waves

- **Layered silk-wave gradient** — the Calm Gradient is now a live wallpaper of parallel ribbons tilted to fall from the upper-left to the lower-right, each a flat colour with a soft shadow where it laps over the ribbon behind. Colours ramp from near-black at the back to pale cream at the front, and the whole ramp always spans the window, whatever its size.
- **One clean loop** — the field is a single SVG slid exactly one wavelength along the ribbons on the compositor, so it flows with no seam, no jitter and no colour snap.
- **Aim and pace it** — the flow pad picks one of eight directions (left/right glide continuously, the other six rock gently), and the speed slider now spans a calm crawl to a lively flow.
- **Fixed** — the earlier gradient only ever showed the middle of its colour ramp, which is what made it look washed out. It now fills the screen edge to edge at every size.
- **Also** — the calendar resizes from one shared control (Clock pane, Widgets pane and the calendar window), sheets fade their blur in and out, settings and widget windows share one open/close animation, and the greeting auto-fits like the weather and quote cards.

### What's new in 2.0 — Liquid Glass (beta)

- **A real glass lens** — behind every card and sheet, the scene is bent through a small SVG displacement lens, not just blurred. The rim gathers the backdrop like a curved pane; the middle stays calm and readable.
- **Sheets without the flash** — panels no longer fade their opacity on open (which disabled `backdrop-filter` for a moment and showed the wrong, darker glass). The scrim fades its colour instead, and the scene behind a sheet blurs softly on its own layer.
- **One recipe everywhere** — settings, every widget window, prayer and changelog now share the search bar's scrim-then-sheet structure, so content is readable over any wallpaper.
- **Apple-style controls** — a thin accent-filled slider with a white capsule thumb, and a pill segmented control with a raised capsule for the selected segment.
- **Calmer details** — selection boxes and rich dropdowns match the glass, scrollbars stay inside rounded panels, and clock/date option previews show the live time and date.
- **Fixed** — the calendar follows the chosen time source (device or weather city), and the weather's rain-time line follows 12/24-hour correctly.
- **Credit** — the design follows Apple's [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass) guidance; the SVG-displacement approach is inspired by the liquid-glass CSS recipes collected at [freefrontend.com](https://freefrontend.com/). The lens, its runtime map and the sheet structure are Newly's own implementation.

### Everything else

- **Liquid Glass everywhere** — every card, panel, button and popup is made of the same material, with adjustable blur, tint and thickness. (1.0 was glassmorphism; 2.0 adds the refractive lens.)
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


## Credits

- Original base: [TheKaveman12 – Custom New Tab for Brave](https://github.com/TheKaveman12/Custom-New-Tab-for-Brave/releases/tag/v1.0)
- Liquid Glass design guidance: [Apple — Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass). SVG-displacement approach inspired by the liquid-glass CSS recipes collected at [freefrontend.com](https://freefrontend.com/). The lens, its runtime map and the sheet structure are Newly's own implementation.
- Made & designed by **[Clovince](https://github.com/zClovince)**
- Code ideas & polishing: **[ChatGPT](https://chatgpt.com/) · [Claude](https://claude.ai/) · [Gemini](https://gemini.google.com/)**
- Earlier performance passes, UI polish, rain timing and Firefox support: **[DeepSeek](https://www.deepseek.com/)**
- Weather & geocoding: **Open-Meteo**
- Prayer times: **Aladhan**
- Quotes: **dummyjson**, **bible-api.com**, **alquran.cloud**
- Qur'an translation: **Muhammad Marmaduke Pickthall** (public domain)

uopyright © [Clovince](https://github.com/zClovince) – 2026. Remix it, break it, improve it.
