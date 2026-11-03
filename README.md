# Newly
<img width="952" height="432" alt="image" src="https://github.com/user-attachments/assets/277ad2f9-bc19-4725-ab25-c15bf59438d7" />

A calm, glassy new tab page with an Apple Liquid Glass UI — a wallpaper you choose, weather, clock, calendar, quotes, shortcuts and prayer times. Chrome / Brave / Edge and Firefox 128 ESR+ (Manifest V3), from one shared folder.

**Repository:** [github.com/zClovince/Newly](https://github.com/zClovince/Newly) — free, source included, fork it and make it yours.

### What's new in 2.0 — Liquid Glass

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

## Earlier releases (as Custom New Tab)

### 5.0.0

- **Firefox implementation** — the headline of this release. The same folder, `manifest.json`, `newtab.html` and `script.js` now run in Firefox 128 ESR and newer as well as every Chromium browser. No separate build, no duplicated files: Chrome ignores the Firefox keys, Firefox ignores the Chrome ones.
- **Browser picker gains Firefox** — a Firefox card sits beside Chrome, Brave and Edge in the **Browser** pane; clicking it swaps the tab favicon just like the others.
- **Valid MV3 security policy** — the CSP is now the standard `{"extension_pages": "script-src 'self'; object-src 'self'"}` form accepted by both engines.
- **Firefox add-on identity** — `browser_specific_settings.gecko` supplies a stable ID (`newly@clovince`), a 128 ESR minimum and a “no data collected” declaration.
- **Thin scrollbars everywhere** — a `scrollbar-width` / `scrollbar-color` fallback replaces Firefox's chunky default bars in settings, prayer and changelog lists.
- **Permission-free connection test** — the Google ping uses an opaque `no-cors` request, so it works in Firefox even though MV3 host permissions are not granted automatically.
- **Wallpaper chooser** — **Calm Gradient** or **Video Wallpaper**, with only the settings for the chosen one shown. It never waits on a battery reading; the gradient just happens to ask a little less of your battery. **Pause wallpaper on hidden tab** stays in **Widgets → Performance**.
- **Fresh install starts on the gradient** — new profiles open to a finished gradient instead of a black rectangle; existing profiles keep their chosen wallpaper.
- **Gradient picker in the Video pane** — six Apple-style dark schemes (Nebula, Midnight, Aurora, Sunset, Ocean, Graphite) used whenever the wallpaper is off, including when no video is set.
- **Left / Top sliders no longer fight** — each mirrors the widget's real position into both rows, so adjusting one never resets the other.
- **Shortcut tiles lose the glow** — the text-colour tint and icon drop-shadow are gone; tiles are plain glass again.
- **One hover feel for every widget** — calendar, prayer and the shortcut pill animate like the rest, and every card plus the status, layout and gear buttons share the same soft outer glow.
- **Four-up browser grid** — the **Browser** pane fits Chrome, Brave, Edge and Firefox in one clean row, with a crisper cached Firefox logo.
- **Video codec fallback** — an undecodable wallpaper falls back to the static gradient instead of a black page, and the video returns when a playable file loads.
- **Chromium parity** — nothing was removed for Chrome users; the fixes above apply to every browser.
- **Firefox install** — no “Load unpacked” exists there. Use `about:debugging → This Firefox → Load Temporary Add-on` and pick `manifest.json`; the add-on vanishes when Firefox closes and removing it clears its saved settings. Permanent use requires signing on addons.mozilla.org.

## Earlier releases (continued)

### 4.0.0

- **Rain timing** — the weather card reads Open-Meteo's hourly forecast and adds a small line under the rain chance: “Expect rain around 21:00”, so you know *when*, not just *whether*. The headline % and the time come from the same peak hour, so they always agree, and the timing line no longer repeats the percentage. If the rest of the day is dry it says so.
- **Cleaner weather stack** — condition and rain chance now sit on separate centred lines instead of sharing one, so “Overcast” and “Rain very likely 75%” each get room to breathe.
- **Instant weather refresh** — a refresh button sits on the weather card (same as the quote one), plus an **Update now** button in **Widgets → Weather**.
- **First-load weather state** — the card fills every line while it waits (“Fetching forecast from Open-Meteo…”), with a plain hint if the connection is the problem.
- **Offline browser logo** — the chosen browser icon is cached as a data URL after it changes, so later new tabs paint instantly and still work offline.
- **Clickable version badge** — the **4.0** badge in the `:)` pane opens the full changelog in a liquid-glass window that can be closed with the ✕, the backdrop or Esc.
- **Credit links** — ChatGPT, Claude, Gemini and DeepSeek now link to their official sites; the ↗ arrows next to TheKaveman12 and Open-Meteo are gone.
- **All Glory to God** — centred beneath the Qur'an translation credit in the `:)` pane.
- **Open invitation** — a small centred “Feel free to modify, remix and share it.” under the subtitle in the `:)` pane.
- **New default layout** — shortcut tiles as their own pill above the search bar, weather anchored top-left, saved positions untouched.
- **Device status tile** - a connection dot and renameable network label next to the layout/gear buttons; click for connection, device and storage details plus a Google ping test.
- **Battery removed** - Chromium's placeholder reading made the number useless, so the UI no longer shows battery. The documented code stays in `script.js` behind `BATTERY_UI = false` in case a browser ever exposes real data.
- **Calendar** — month grid under the clock, today highlighted, draggable/resizable like the other widgets.
- **Prayer times** - appears only while the Quran verse category is selected: next prayer, time and live countdown, click for today's five prayers based on the weather city's coordinates. Optional 5 / 10 / 15 / 30-minute reminder as a centred, dimmed glass popup with a soft chime, plus a Test reminder button that previews the real next prayer and countdown. A city change refreshes prayer times immediately; unchanged cities use the day's cache.
- **README is inside the release ZIP**, alongside the extension and full changelog.

### 3.2.0

- Weather unit **C / F** is uppercase, uses the text colour, and is now the same size as the temperature number; the **°** stays a small superscript.
- Quote card hugs its text again; rotation-off actually keeps the last quote; Philosophy label cleaned up.
- Custom font card added (Inter removed) with a hidden input until selected; every widget auto-fits after font, clock or content changes; widget toggles fade instead of popping.
- Search icon alignment fixed and lazier placeholders added; credits shortened to **3.0 update**; Drift, Glide and Unfold animations added; Pop removed; the gear button now closes the panel too.

## Features

- **Widgets on/off** - greeting, clock, calendar, prayer times, search, shortcuts, weather, quote and the device status tile.
- **Device status** - an online/offline dot with your own network label, plus a glass popover with connection estimates, device details, storage usage and a Google ping test. Standard browser APIs only; no permissions and nothing is sent anywhere.
- **Free widget resizing** — in layout mode, drag the blue corner dot to resize weather, quote, clock, greeting, search and shortcuts. The content scales with the card (text, icons, tiles), so a bigger card really shows more. Per-widget **↺** resets just that one; the layout section in **Widgets** has a **Reset** row per widget too.
- **Layout button next to the gear** (bottom-right) — the default quote now sits bottom-left, mirroring the search pill. Dragging and resizing happen on the page itself, so the settings panel never covers the widgets you are arranging.
- **Weather with a city name** — the city label sits above the temperature in small caps, with a °C/°F unit label beside the number and an **“Last updated HH:MM”** line that follows the clock's 12/24-hour setting. Manual city only, powered by Open-Meteo.
- **Plain-language rain forecast** — instead of “% rain”, the widget says “Slight chance of rain”, “Likely to rain”, “Rain very likely”, and so on, with a small “Expect rain around HH:MM” line underneath.
- **Quote rotation** — General / Philosophy / **Bible** / **Quran** / Random mix / **Custom**, with an explicit **on/off toggle** and a seconds field (minimum 5 s). A hand-written custom quote is never replaced automatically.
- **Clock & date size** — a 16–80 px slider; the date scales with the clock, and each clock style keeps its own default until you move it.
- **Video view** — zoom the wallpaper from 100 % to 250 % and pan it left/right and up/down, with a **Reset video view** button. Only the wallpaper moves.
- **Offline shortcut icons** — icons are fetched once, cached as data URLs in `localStorage`, and refreshed when you edit a shortcut's URL.
- **Greeting that follows the clock** — morning starts at 05:00, “night” replaces “evening” after 20:00.
- **Settings panel size** — Small / Default / Large.
- **Screen scaling presets** — Compact (13–14″), 1080p, 2K/1440p and 4K, plus **Fit this window**. Presets never shrink below 100 % and use each card's measured natural size, so cards stay readable and nothing clips.
- **Apple-style hover** — widgets lift and brighten with a short spring; icon buttons scale and rotate their glyphs on hover.
- **Smart search** — Google / Brave / DuckDuckGo / Bing / YouTube, direct URL detection, `Ctrl/⌘ + K` or `/` to focus.
- **Glass presets** — Clear / Frosted / Tinted / Liquid.
- **Settings export & import** — JSON backup, now at the end of the `:)` pane.
- **Battery saver** — static gradient instead of the video when on battery (<40%) or when the OS asks for reduced motion. Wallpaper pauses on hidden tabs.
- **`: )` tab** — credits, privacy notes, shortcuts and backup. The original creator is linked in honour of the base project.

## Performance pass (3.0)

- Shortcut tiles no longer each carry their own `backdrop-filter`; one blur per group.
- Hover animations rotate the SVG instead of the blurred surface.
- Glass is driven by CSS variables (no stylesheet rebuild while dragging sliders).
- One clock timer aligned to the second/minute, memory-cached settings, no writes when nothing changed.
- Removed the `document.title` marquee (5 title changes/second) and the dead `clock.js` reference.
- Settings panel builds its grids once, fonts load lazily (tiny `&text=` subsets on hover).
- Shortcut editor is debounced; wallpaper object URLs are revoked; video pauses when hidden.

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

1. Create a repository on GitHub (public is fine — it is CC0).
2. Upload the files above (or `git init` + push this folder).
3. Tag a release and attach the ZIP **without** the video: the extension needs no media to run.

A ready-to-share `Newly-2.0.0.zip` is generated next to this folder on request.

## Known issues

- **Shortcut icons don't recolour with the text colour.** The tiles and letter fallbacks pick up the chosen colour, but Google/Spotify/YouTube favicons keep their brand colours. Tinting or recolouring them looked worse in testing, so it was left alone for now. Planned for a later pass — when not lazy.

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

unCopyright © [Clovince](https://github.com/zClovince) – 2026. Remix it, break it, improve it.
