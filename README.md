# Donate Timer

StreamKit+ application addon: a marathon timer that donations extend. Port of the desktop app
[s3r4tv/donate-timer](https://github.com/s3r4tv/donate-timer) (Python/Tkinter). The desktop app connected
to DonationAlerts, DonatePay and DonateX on its own; this addon takes donations from the StreamKit+
dashboard feed, so any donation platform addon you have installed works.

- **Addon id:** `donate-timer`
- **Type:** `application`
- **Minimum StreamKit+:** `1.3.8`

## Features

- Countdown timer with start, pause and reset; remaining time can be set by hand. After a restart a
  running timer comes back paused.
- Rate in two modes: money per second, or seconds per money unit.
- Base currency: the StreamKit+ main currency or a fixed one. Other currencies are converted with
  StreamKit+ exchange rates. A donation that cannot be converted adds no time and shows a notification.
- "Time is up" blink (30 s by default). Donations that arrive during the blink are buffered and applied
  when it ends; the timer restarts if time was added.
- Manual control: 12 quick buttons (±1 min to ±1 h), custom time, time for a nickname (journal row
  without money), and a manual donation with nickname, amount and currency (defaults to the StreamKit+
  currency, converted like a real donation).
- Donation journal: remove last (takes time back), clear history (donations already processed are not
  counted again), reset widget statistics without touching the journal.
- Alert plate colors by amount (blue, purple, green, red).
- Donation goal with start amount, start date and bar opacity.
- Marathon statistics: start date, on-air clock, gross and net amount (platform commission), Top-6.
- Marathon time goal: how much time donations still need to add (goal − on air − timer).
- Bonus rate windows: viewer benefit in percent; a window opens on a bank step, a big donation or a
  reached donation goal, or by hand. Random length, cooldown, a countdown bomb sound and an optional
  open sound play in the bonus widget.
- Widget accent palette, including a random color that changes every hour.

## OBS widgets

Copy the links from the **OBS widgets** section of the addon window and add them as Browser sources.

| Widget | File |
| --- | --- |
| Timer | `widgets/timer_new.html` |
| Timer, marathon block | `widgets/timer_marathon_block.html` |
| Marathon gold (compact) | `widgets/marathon_gold_small_v2.html` |
| Top-6 line | `widgets/top5_marathon_inline.html` |
| Top-6 block (with time goal) | `widgets/top5_marathon_block.html` |
| Donation goal | `widgets/donation_goal.html` |
| Bonus rate (plays sounds) | `widgets/bonus_rate.html` |
| Date and time | `widgets/clock_datetime_inline.html` |
| Webcam frame | `widgets/webcam_frame.html` |

Add `&sound=0` to a bonus widget URL to mute that copy.

### GTA 6 theme

| Widget | File | OBS source |
| --- | --- | --- |
| Timer plate (golden hour during the bonus rate, time-left stages, donation toasts) | `widgets/gta_timer.html` | 520 × 120 |
| Top-6, one donor at a time in a loop | `widgets/gta_top_rotate.html` | 480 × 37 |
| Top-6, all six at once | `widgets/gta_top_list.html` | 480 × 262 |

Settings (tab **OBS widgets → GTA 6 theme**): plate title (up to 3 lines), three time-left stages in
minutes — yellow, orange, red critical (0 = stage off; defaults 30 / 15 / 5), Top-6 display time and cross-fade duration. Fonts Archivo and Space Grotesk are
bundled in `widgets/fonts/` under the SIL Open Font License (`widgets/fonts/OFL.txt`). Widget texts are in Russian, as in the desktop app.

## Architecture

| Path | Role |
| --- | --- |
| `src/index.ts` | Worker entry: subscribes to `dashboard.onRecord`, runs the 250 ms tick |
| `src/engine.ts` | Timer, donation application, blink buffer, manual actions, bonus windows |
| `src/bonus.ts` | Bonus window decisions (port of `bonus_rate.py`) |
| `src/stats.ts` | Totals, Top-6, donation goal, time goal, accent |
| `src/store.ts` | Persisted state in addon `storage` (settings, journal, timer, bonus) |
| `src/widgets.ts` | Widget snapshot, Socket.IO namespace `live`, `GET snapshot` fallback |
| `src/endpoints.ts` | Control panel API: `GET panel`, `POST action` (token required) |
| `src/app.ts` | Control panel entry: builds tabs from components, polls state every second |
| `src/panel/` | Panel core: `api.ts` (HTTP), `store.ts` (state, tab switching), `dom.ts`, `format.ts`, `i18n.ts` |
| `src/panel/ui/` | Reusable UI: card, buttons, segmented control, fields, settings card with save bar, confirm dialog, toasts |
| `src/panel/sections/` | Header, tabs, getting-started guide and one module per tab (control, setup, marathon, bonus, widgets) |
| `src/widgets/*.html` | Widget pages ported from the desktop app |
| `src/widgets/bridge.js` | Serves the desktop "files" (`timer.txt`, `rate.txt`, `blink.flag`, …) to the widget code from the snapshot |

The desktop widgets polled text files from a local HTTP server. `bridge.js` replaces `XMLHttpRequest`
and `fetch` for those file names and answers from a snapshot that the worker pushes over Socket.IO
(with HTTP polling as a fallback), so the original widget code runs nearly unchanged.

## Differences from the desktop app

- No platform tokens or OAuth: donations come from StreamKit+.
- Sounds play in the bonus widget (captured by OBS) instead of on the PC. The desktop app's Mario
  jingle is not bundled; set any sound URL in **Open sound URL** instead.
- Reset restores the configured initial time (the desktop app always reset to 1:01:01).
- Quick time changes during the blink are applied after it (the desktop app dropped them).
- "Reset widget stats" works with a non-empty journal and hides the current rows from widget totals.

## Build

```bash
npm install
npm run build
npm run typecheck
```

Install the `dist/` folder in **StreamKit+ → Settings → Applications** (or drop it on the window).
