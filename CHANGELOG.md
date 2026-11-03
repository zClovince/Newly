# Changelog

All notable changes to **Newly**. Newly began life as *Custom New Tab — Clovince*; the releases from that era are kept further down, unchanged, so the whole story stays in one file.
This file is included in every release ZIP, so the history travels with the extension.

---

## 1.0.0 — Newly

Newly is a calm, glassy new tab page. Everything rests on one screen, and you decide what stays, where it sits, and how it feels. Here's how everything gently unfolds :)

### The look

- **Liquid Glass, everywhere.** Every card, panel, button and popup is frosted glass — a soft blur, a quiet lift on hover, and springy little animations, in the spirit of Apple's iOS and macOS. The blur, tint and thickness are yours to soften or deepen whenever you like.
- **Two ways to dress the background.** Settle on **Calm Gradient** — a still, soft colour scheme (Nebula, Midnight, Aurora, Sunset, Ocean or Graphite) that asks a little less of your battery — or let **Video Wallpaper** play your own clip quietly behind the glass, with gentle zoom and pan. New tabs open on the gradient, so you are never met with a black screen.

### The widgets

Each one can rest quietly off-screen, be moved anywhere, resized, or reset on its own.

- **Weather**, from Open-Meteo, for a city you choose — the conditions, the temperature, the chance of rain, and a soft "expect rain around HH:MM" line, in °C or °F.
- **Clock and date**, with a 12 or 24-hour choice and several clock styles.
- **Calendar**, a month grid resting under the clock, with today quietly ringed.
- **Greeting**, which can call you by name, show the time, or simply stay minimal.
- **Quote card**, with categories to wander through, a "new quote now" button, and room for words of your own.
- **Prayer times**, which appear when the Qur'an verse category is on: the next prayer, its time, a live countdown, and an optional reminder that arrives before each prayer as a centred, dimmed popup.
- **Shortcuts**, a row of tiles you can point at any site, with favicons kept close so they still show offline.
- **Search bar**, always within reach — Ctrl / ⌘ + K brings you straight to it.
- **Status tile**, a small pill showing your connection, opening a glass panel with device details, storage, a connection test, and a rename field.

### Make it yours

- **Rearrange everything.** A little handle moves each widget, a blue corner resizes it, and Left / Top sliders nudge it by number, with a reset for one or for all.
- **Fonts.** Newly carries **Plus Jakarta Sans** inside itself, so a clean, modern typeface is there from the very first tab, offline. A few more are one click away, and you can type in any Google Fonts name — if it doesn't exist, Newly will simply tell you.
- **Text colour and overall scale**, so it reads the way you like on any screen.
- **Browser tab name, favicon and logo**, so the tab itself can match the browser you love.
- **Export and import your settings** to carry your setup to a new machine. The video stays with your device.

### Private by design

- Everything stays local: settings in your browser's own storage, the video in an offline cache. No accounts, no tracking, no GPS. Your weather city goes to Open-Meteo, and — only while Qur'an verses are on — that same city goes to Aladhan for prayer times. That's all.
- **One build, two browsers.** The very same folder runs in Chrome, Brave, Edge and Firefox.

### New in this 1.0

- A brand-new name: **Newly**.
- The **Wallpaper** tab (the old Video tab) is now one simple choice — Calm Gradient or Video Wallpaper.
- Plus Jakarta Sans, carried inside Newly, and custom fonts that simply tell you whether they loaded.
- A city that doesn't exist now says **"City not found — check the spelling"** in both weather and prayer times, and the prayer window shows the city it is using.
- The old `:)` tab is now **About**.

### The little things, right after launch

- Windows close only with **✕** or **Esc** — a stray click on the dimmed backdrop no longer dismisses what you were reading.
- The search engine list opens **above** the bar and stays clickable while you type; choosing one leaves the cursor in the search box.
- **Clock size** has its own slider with a live preview while you drag, plus a reset. **Calendar size** now scales the whole card, not just the numbers inside it.
- The **quote window** shows the verse that is on your new tab right now, explains where each source comes from, and can set how often it changes on its own — from every minute to staying on the same one.
- **Greeting** options and the greeting window preview the greeting as you type, in the same weight and colour as the card.
- The weather card says **"No rain expected"** instead of leaving that line blank.
- **Screen scaling** now says plainly that it can look off on some screens. The layout editor also gives a quiet, soft-toned nudge — with a small shake — when a click lands on the page instead of a card.

### The finishing pass

- **A first-run welcome**, only for brand-new installs — a few calm steps for your name, city, clock, search engine, quote source, glass and wallpaper. Every step is skippable, and anyone upgrading keeps their page exactly as it was.
- **Widgets keep their place.** Resizing the window now re-applies every saved position proportionally instead of scattering them.
- **An update checker** in the status panel — it asks GitHub quietly once every twelve hours and simply tells you when a newer Newly exists.
- **A tidier widget list**, with an icon, name and one-line description for each, grouped into "On the page" and "Extras".
- **Soft dropdowns everywhere**, so every choice wears the same frosted glass instead of a plain system menu.
- **Living gradients.** Calm Gradient can now drift — *Still, Slow* or *Flowing* — with a Speed slider to taste. The motion is a single compositor transform, so it stays kind to your battery and rests while the tab is hidden.
- **Glass you can feel** while you set it up: the first run shows glass presets, blur, opacity and tint live, and lets you import a video wallpaper right there.

Earlier releases, from when this project was called Custom New Tab, follow below.

## 5.0.0 — Firefox implementation

- **Firefox support (headline)**: the same folder, the same `manifest.json`, the same `newtab.html` and `script.js` now run in Firefox 128 ESR and newer as well as Chrome, Brave, Edge and other Chromium browsers. There is no separate Firefox build and nothing to maintain twice — Chrome ignores the Firefox-only keys, Firefox ignores the Chrome-only ones.
- **Browser picker gains Firefox**: the **Browser** pane now offers a Firefox card beside Chrome, Brave and Edge. Clicking it swaps the tab favicon to the Firefox logo, exactly like the others.
- **Valid MV3 security policy**: the old Chrome-shaped `{"script-src": ["'self'"]}` CSP is replaced with the standard `{"extension_pages": "script-src 'self'; object-src 'self'"}` form, which both engines accept.
- **Firefox add-on identity**: `browser_specific_settings.gecko` gives the add-on a stable ID (`custom-new-tab@clovince`), a minimum of Firefox 128 ESR, and a “no data collected” declaration for AMO.
- **Thin scrollbars everywhere**: Firefox has no `::-webkit-scrollbar`, so a `scrollbar-width` / `scrollbar-color` fallback now keeps the settings, prayer and changelog lists looking the same instead of showing chunky system bars.
- **Connection test works without permissions**: the Google ping now uses an opaque `no-cors` request. Firefox MV3 does not auto-grant host permissions, so the old CORS check could fail even with a working connection; the new one only measures whether the network answers.
- **Wallpaper chooser**: the Video pane now opens with two simple choices — **Calm Gradient** or **Video Wallpaper** — and only the settings for the chosen one are shown. No battery reading is involved (that API is a placeholder on Chromium and missing on Firefox), so it always works. The gradient quietly asks a little less of your battery, which is all the old toggle ever needed to mean. **Pause wallpaper on hidden tab** stays in **Widgets → Performance** and stops the video reliably (it checks both `document.hidden` and `visibilityState`, and removes the surface from the paint tree while stopped).
- **Gradient picker in Video**: the static fallback moved out of the Widgets performance section and into **Video → Gradient colours**, with six Apple-style dark schemes (Nebula, Midnight, Aurora, Sunset, Ocean, Graphite). The gradient is also used when no video is set or the browser cannot play the chosen file.
- **First run starts on the gradient**: a brand-new profile opens to a finished gradient instead of a black rectangle waiting for a video. Existing profiles keep whatever they had, so nobody's wallpaper changes underneath them.
- **Video codec fallback**: if the browser cannot decode the chosen wallpaper (Firefox uses the operating system's decoder), the page falls back to the chosen gradient instead of showing a black rectangle, and returns to video as soon as a playable file is loaded. With no video set, the gradient is shown instead of a flat black page.
- **Left / Top sliders stop fighting**: the two position sliders for a widget now read the widget's real on-screen spot and mirror it into both rows, so moving Left updates Top's value to match instead of resetting it, and vice versa.
- **Shortcut tiles lose the glow**: tinting their background with the text colour and adding a drop-shadow to the icons made them look brighter and hazier than every other card. Both are gone; tiles are plain glass again, while the letter fallback still follows the chosen text colour.
- **One hover feel for every widget**: the calendar and prayer cards now use the same lift and animation as the rest, and every card — including the shortcut pill — plus the status, layout and gear buttons share one identical soft outer glow instead of each having its own.
- **Four-up browser grid**: the **Browser** pane is now a clean 4-column grid, so the Firefox card sits beside Chrome, Brave and Edge without adding a second row, and the Firefox logo uses a crisp 500 px Wikipedia asset (cached offline like the others).
- **Chromium parity**: no feature was removed or reworked for Chrome users; the layout, widgets, prayer times and Liquid Glass visuals stay as they were, with the fixes above applying to every browser.
- **Install notes**: Firefox has no “Load unpacked”. Testers load the folder once via `about:debugging → This Firefox → Load Temporary Add-on`; a temporary add-on disappears when Firefox closes, and removing it also clears its saved settings. Permanent use needs signing on addons.mozilla.org.

## 4.0.0 — rain timing & links

- **Rain timing**: weather now pulls hourly precipitation probability and adds a small “Expect rain around HH:MM” line under the daily chance, in the same 12/24-hour format as the clock. The headline % and the time now use the same upcoming peak hour, so the two numbers stop disagreeing; the duplicate percentage on the timing line is gone. If the rest of the day has no rain window, it says so.
- **Cleaner weather stack**: the condition (“Overcast”) and the rain chance (“Rain very likely 75%”) now sit on separate centred lines instead of being squeezed onto one, so the card stays readable at any width.
- **Instant weather refresh**: a refresh button on the weather card, plus **Update now** in **Widgets → Weather**.
- **Honest first-load state**: the weather card now fills every line while it waits — “Fetching forecast from Open-Meteo…” with “If this sticks, check your internet connection.” — instead of sitting blank on a fresh new tab. If the request fails and nothing is cached, it says so plainly.
- **Offline browser logo**: the chosen browser icon is fetched once, stored locally as a data URL and painted from that cache on every later new tab, so it no longer hits the source each time and still shows offline when the logo changes.
- **Version badge is a button**: clicking **4.0** in the `:)` pane opens the full changelog in a closable liquid-glass window.
- **Credit links**: ChatGPT, Claude, Gemini and DeepSeek link to their official sites; the ↗ arrows next to TheKaveman12 and Open-Meteo are gone.
- **All Glory to God** closes the credits in the `:)` pane, centred beneath the Qur'an translation note.
- **Open invitation**: the `:)` pane now carries a small centred “Feel free to modify, remix and share it.” under the app subtitle.
- **New default layout**: the shortcut tiles float as their own pill directly above the search bar, the weather card anchors the top-left, and the greeting, clock and quote keep the centre and corners. Saved manual positions always win, so existing layouts are untouched.
- **Device status tile**: a compact pill left of the layout and gear buttons shows a connection dot with your own network label. Clicking opens a glass popover with connection estimate, device details, storage usage, a Google ping test and a rename field. It reads standard browser APIs only - no permissions, nothing sent anywhere.
- **Battery removed**: the battery readout is gone from the UI. Chromium on Windows feeds the Battery Status API a fixed placeholder (“100 %, charging”) and no web API can reach the real level, so the code stays in `script.js` behind `BATTERY_UI = false`, documented, ready if a browser ever exposes honest data.
- **Calendar**: a compact month grid under the clock, Monday-first, with adjacent-month days dimmed and today ringed in glass blue. It is a normal draggable, resizable widget with its own toggle.
- **Prayer times**: a widget that only appears while the Quran verse category is selected, showing the next prayer, its time and a live countdown, calculated from the weather city's coordinates (Aladhan API, method chosen per region). Clicking it opens a centred, dimmed glass window with today's Fajr / Dhuhr / Asr / Maghrib / Isha. A reminder selector offers off / 5 / 10 / 15 / 30 minutes before, shown as a centred glass popup that dims the page until dismissed, with a soft generated chime. A **Test reminder** button closes the settings window first and previews the popup using the real next prayer and real remaining minutes, so it matches the widget exactly without waiting. Changing the weather city refreshes prayer times immediately; an unchanged city keeps using the day's cache.
- **Release ZIP**: includes `README.md` with the 3.2 → 4.0 changelog, plus the full `CHANGELOG.md`.

## 3.2.0 — small things, fixed properly

- **Weather unit, take three.** The number is big, the **°** is a small superscript above it, and **C / F** sits at normal size on the baseline. The whole icon + number + unit row is centred again instead of the unit dragging it off-balance.
- **Quote card hugs its text again.** Rotation no longer leaves a fixed-height box behind — the card grows and shrinks with each quote. One-time migration clears any old stored quote height.
- **Rotation off now means off.** With automatic quote changes disabled, a new tab reuses the last quote instead of quietly rolling a fresh one. “New quote now” and changing category still work on demand.
- **Philosophy** category label cleaned up — the “incl. radical” note is gone.
- **Lazier search placeholders** for every engine: “google it, or whatever...”, “brave it, i guess...”, “duck it, why not...”, “bing it, sure...”, “watch something, or don't...”.
- **Search bar alignment** — the engine icon and magnifier button are locked to the same 22×22 box and centred, so the icon no longer sits taller than the field and the magnifier no longer hangs lower.
- **Credits cleaned up** — the long “3.0 performance pass & 3.1–3.2 UI polish…” line is now just **3.0 update**, and `bible-api.com` / `alquran.cloud` are proper links to the original APIs.
- **Custom font card, finally.** Inter is gone; **Custom** is the last font card. Its Google Fonts name field only appears once Custom is selected, and stays hidden for every other font.
- **More animations** — **Drift**, **Glide** and **Unfold** join Spring, Fade, Slide, Zoom and Blur, each with its own panel and tab transition.
- **Widget toggles now fade.** Turning a widget off fades and soft-blurs it out before it leaves the layout; turning it back on fades it in. No more hard pop.
- **Weather C / F is uppercase and uses the same text colour** as the rest of the card.
- **Weather unit sizing** — **C / F** is now the same size as the temperature number instead of a small tag, so the row reads as one unit.
- **Weather “Last updated” follows the clock** — it shows 12-hour times with AM/PM when the clock is set to 12-hour, and 24-hour times when the clock is 24-hour. Changing the clock format updates the stamp immediately.
- **Clock option changes now re-fit the card** — toggling 12/24-hour, seconds, date format, clock style or clock size re-measures the clock widget, so AM/PM and seconds no longer leave the card at a stale size.
- **Changing font no longer breaks the widgets.** Every widget now stores an auto-height flag, re-measures itself after a font or content change, and lets the card grow with its text. Weather rerenders and quote rotation no longer clip or lose the city name. A one-time migration (`nt_auto_sizes_v1`) marks existing saved sizes as auto; manually resizing a widget still pins its height.
- **The gear button closes the panel too** — pressing it again with settings open now closes settings instead of doing nothing.
- **Pop animation removed** — it didn’t fit the rest; Drift, Glide and Unfold remain.
- **Custom font card** now just says **Custom** instead of echoing the last font name.
- **Version bumped to 3.2.**
- **Known issue (deliberately not fixed yet):** shortcut brand icons (Google, Spotify, YouTube…) can't really take the global text colour. Tiles and letter fallbacks do; the favicons keep their brand colours. Noted in the README for a future pass — when not lazy.

## 3.1.0 — UI polish batch

### Fourth polish pass
- **Peek mode for the video sliders** — dragging Zoom, Left or Up now fades the settings panel out just like the layout sliders, with a small HUD showing the live value, so you can actually watch the wallpaper move.
- **Proper °C / °F** — the unit now sits on the baseline next to the number (27°C, not a floating superscript), sized a little smaller so it reads like every other weather app.
- **720p scaling preset** added, and the useless “Choose a preset…” placeholder is gone. Presets are now 720p (100%), 1080p (100%), 2K/1440p (125%) and 4K (150%), and the selected preset is remembered across reloads.
- **Global text colour now reaches the rest of the UI** — the search icon, quote refresh button, shortcut tiles, resize knob, reset knob, panel labels/hints/tabs/dropdowns/buttons/credits all pick up a tint of the chosen colour. Panel text keeps a light floor so a dark colour stays readable on the glass, and favicons keep their brand colours with a subtle hairline glow in the chosen colour.
- **Greeting text style and Greeting color moved** from Display into the **Greeting** tab, right under the greeting text/style fields.
- **Settings copy got lazier** — every explanation line rewritten again in a more offhand, nonchalant voice, same facts as before.

### Third polish pass
- **Screen scaling presets** in **Display → Screen scaling**: Compact (13–14″ laptop, 100%), 1080p (100%), 2K/1440p (125%) and 4K (150%), plus **Fit this window**. A preset now measures each card's *real* natural size before scaling — padding is kept fixed, content scales with it — so nothing clips and no preset ever drops below 100%. Applying one resets widget sizes, positions and clock size to that preset's corner layout.
- **Weather unit indicator**: the temperature is now a plain number with a small **°C / °F** label beside it, and the icon sits a little closer to the number.
- **Weather API credited**: both **Widgets → Weather** and the `:)` credits now name **Open-Meteo** explicitly (credits link to open-meteo.com).
- **Settings text, rewritten lazier**: every explanatory line in the panel now reads in a more offhand, nonchalant tone while keeping the same technical facts (minimums, APIs, no GPS, resets). The pre-rewrite markup is backed up at `_backup/newtab.before-lazy-text.html`.
- **Weather**: the 📍 pin was removed from the city line, and the refresh interval now accepts a **minimum of 1 minute** (default stays 30).
- **Scrolling tab title is now a visible option** in **Browser → Scrolling title for long names** (on by default). It only animates titles longer than 16 characters.
- **Gear and layout buttons now use the same Liquid Glass recipe** as the widgets — blur, tint, opacity and border highlights all follow the current glass settings.
- **Global text colour** in **Display → Text color (all widgets)**: 20+ swatches plus a custom colour picker, applied to the clock, date, greeting (unless it has its own colour), weather, quote, shortcut letters and search field.

### Second polish pass
- **Quote typography** — text can be aligned **left / center / right / justify**, set **normal / italic / bold / bold italic**, and resized (10–32 px). The **author or verse reference has its own align, style and size controls** (9–24 px).
- **Tighter weather card** — the icon and temperature now sit close together, in the same centred Apple-style rhythm, instead of leaving an awkward gap.
- **“Last updated HH:MM”** replaces the shorter “Updated”, and the city line starts with **📍**.
- **Weather refresh interval** — new setting in **Widgets → Weather** (minutes, minimum 5, default 30). The widget refreshes itself on that schedule and restarts the timer when the city, unit or interval changes.
- **License row removed** from the `:)` pane.
- **Position sliders are back** in **Widgets → Layout**, one Left/Top pair per widget, in addition to on-screen drag. While a slider is dragged the settings panel and dimmer **fade out (peek mode)** and a small floating readout shows the live coordinates, so you can actually see the widget move.
- **Tab-title marquee restored** — long tab names scroll gently (550 ms steps) instead of being cut off; it pauses on hidden tabs and only runs for titles longer than 16 characters.

### Settings layout
- **Tab pane removed.** Tab-name style now lives in **Browser**; Layout moved into **Widgets**.
- **Info tab renamed to `:)`** — same credits, privacy notes and shortcuts, a little more fun.
- **Backup (Export / Import settings)** moved to the end of the `:)` pane.

### Layout editing
- The **layout (⊞) button now sits next to the gear** at the bottom-right.
- The default **quote moved to the bottom-left**, matching the search pill's spacing, so the two bottom corners are balanced.
- Layout is driven mainly from the on-screen drag/resize handles, so the settings panel no longer covers the widgets you are arranging. A **peek mode** fades the panel while the position sliders are used (second pass).
- The Layout section keeps per-widget **Reset** rows plus **Reset all widgets**.

### Clock
- **Clock & date font size slider** (16–80 px). The date scales with the clock. Each clock style keeps its own default until you move the slider.

### Video
- **Wallpaper zoom (100–250 %)** plus horizontal and vertical pan, with a **Reset video view** button. Only the wallpaper moves — widgets stay put.

### Greeting
- **Morning now starts at 05:00**, and **after 20:00 the greeting says “night”** instead of “evening”.
- The greeting refreshes itself when the hour changes, so “Good night” does not stay “Good evening”.

### Weather
- **“Updated HH:MM”** line shows when the data was last fetched.
- **“% rain” replaced by a plain-language prediction**: “No rain expected”, “Slight chance of rain”, “Chance of rain”, “Likely to rain”, “Rain very likely”.

### Quotes
- **Automatic rotation is now an explicit on/off toggle**, followed by the seconds field. This fixes the bug where quotes kept changing even at 0 / non-network categories.
- Minimum interval is 5 seconds; the field is disabled while the toggle is off; a hand-written **custom** quote is never replaced automatically.

### Shortcuts
- **Icons are cached offline** as data URLs in `localStorage`, so opening a new tab no longer re-downloads them. Editing a shortcut's URL refreshes (and re-caches) its icon.
- Cache is bounded automatically to keep storage small; the remote favicon URL remains the fallback if a fetch fails.

### Credits
- The **original author (TheKaveman12)** is now a clickable link to <https://github.com/TheKaveman12/Custom-New-Tab-for-Brave>, honouring the original project.
- Privacy note updated to mention the offline icon cache.

---

## 3.0.0 — Liquid Glass rebuild

- Full rewrite of the original extension around an **Apple Liquid Glass / iOS-macOS** aesthetic.
- **Fully customizable Liquid Glass**: the early glass morphism from 2.5 grew into a complete material system with Clear / Frosted / Tinted / Liquid presets, adjustable blur, transparency and tint, all driven live through CSS variables.
- **Video wallpaper** (stored locally in IndexedDB) with a static-gradient fallback.
- **Widgets on/off**: greeting, clock, search, shortcuts, weather, quote.
- **Free widget resizing** — drag the blue corner dot; content scales with the card. Per-widget **↺** reset.
- **Weather** by manual city name (no GPS), Open-Meteo, cached 30 minutes.
- **Quotes**: General / Philosophy / Bible / Quran / Random / Custom, with offline fallbacks.
- **Smart search**: Google / Brave / DuckDuckGo / Bing / YouTube, direct URLs, `Ctrl/⌘ + K` or `/`.
- **Glass presets**: Clear / Frosted / Tinted / Liquid, plus blur and transparency sliders.
- **Settings panel size**: Small / Default / Large.
- **Settings export & import** (JSON backup).
- **Battery saver** and wallpaper pause on hidden tabs.
- **Performance pass**:
  - one `backdrop-filter` per shortcut group instead of one per tile;
  - hover animations rotate the SVG, not the blurred surface;
  - glass driven by CSS variables (no stylesheet rebuild while dragging);
  - a single clock timer aligned to the second/minute, cached settings, no redundant writes;
  - removed the `document.title` marquee and the dead `clock.js` reference;
  - settings grids built once, fonts loaded lazily;
  - debounced shortcut editor, revoked object URLs, video paused when hidden.

---

## 2.5.0 — Liquid Glass, beta

- Introduced a **beta liquid-glass treatment** across the interface: lighter transparency, softer edge definition, and restrained highlight accents that suggested depth without becoming decorative.
- Extended the iOS 18-style blur foundation with early refraction-like light behaviour, giving each panel a subtle sense of material rather than a flat translucent fill.
- Refined tint, opacity and border contrast so text remained legible across bright and dark wallpapers.
- Applied the treatment consistently to all main surfaces while keeping the existing layout and interactions unchanged.
- An exploratory visual pass — the direction that would later become the fully configurable glass system in 3.0.
- Design and implementation exploration with **Claude**.

---

## 2.0.0 — Apple blur direction

- Replaced the original flat Kaveman layout with an **Apple-inspired frosted-glass** visual language: translucent surfaces, soft depth, rounded geometry, and a calmer, more spacious composition.
- Introduced the first blurred widget backgrounds and layered transparency, bringing a macOS / iOS atmosphere to the new tab while preserving the original shortcut model.
- Reworked typography, spacing, and icon treatment for a clearer visual hierarchy and a more deliberate reading rhythm.
- Unified the colour and border treatment across cards so the interface read as one continuous material instead of separate panels.
- Established the visual foundation that the later liquid-glass iterations would build upon.
- Design exploration with **Gemini** and **Claude**; layout and concept brainstorming with **ChatGPT**.

---

## 1.0.0 — Original

- **TheKaveman12 — Custom New Tab for Brave** (<https://github.com/TheKaveman12/Custom-New-Tab-for-Brave>).
- The starting point this project was forked and rebuilt from.

---

unCopyright © Clovince 2026 · CC0 1.0 Universal.
