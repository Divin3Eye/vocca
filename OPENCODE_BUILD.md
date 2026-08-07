# Build Vocca — open-source AI dictation (v0.1 MVP)

You are working in the repo at:

```
E:\Projects\Vocca
```

This is a fresh, empty repo (only `.git`, no source yet). Build the entire app from
scratch. **You are the builder; I (the repo owner) am an AI-native founder — I do not
hand-write code.** Produce clean, working, production-quality code and verify every step.

---

## What Vocca is

Vocca is an **open-source AI dictation app.** The user presses a mic hotkey, speaks, and
gets clean text in any text field — no account, no subscription, local-first. It's a
make-it-yourself alternative to commercial dictation tools like Wispr Flow.

**v0.1 MVP = a polished single-page web app** (the desktop-overlay version is a later
milestone; keep architecture ready for it, but DO NOT build Electron/Tauri now).

---

## Tech stack (mandatory)

- **Next.js 16** (App Router), **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **Web Speech API** for speech recognition — `webkitSpeechRecognition` / `SpeechRecognition`
  (browser-native, **free, no API key**). This is the default engine.
- **Optional AI polish pass** using an **OpenAI-compatible endpoint** (BYO-API-key). The
  user brings their own URL + key; stored **only in localStorage**. No server, no DB.

**Design system (their brand — commit to it):**
- Light theme. White canvas (`#FFFFFF`–`#FAFAFA`). Near-black text (`#0f161e`).
- **Lime green accent** `#84CC16`–`#A3E635` for primary actions, focus rings, active states.
- Clean, trust-first, "banking-grade" clarity. Generous whitespace. Rounded corners (12px).
- A single centered mic control as the hero. No clutter.

---

## Project scaffold (create exactly this)

```
E:\Projects\Vocca\
├─ app/                          # Next.js app router
│  ├─ layout.tsx                 # dark-free, light theme, font, metadata, <MobileNav?-no>
│  ├─ globals.css               # tailwind v4 import + brand CSS vars
│  └─ page.tsx                  # the dictation app (client component wrapper)
├─ components/
│  ├─ MicButton.tsx             # big lime mic button + hold/press-to-talk visual state
│  ├─ TranscriptArea.tsx        # editable text output, shows interim/listening text
│  ├─ VoiceCommandBar.tsx       # hint row: "period", "new line", "caps" commands
│  ├─ PolishButton.tsx          # "Polish with AI" → sends text to LLM for cleanup
│  ├─ SettingsSheet.tsx         # BYO-key settings (endpoint, model, key) → localStorage
│  ├─ HistoryDrawer.tsx         # past dictations (localStorage) — copy/reuse
│  └─ TipToast.tsx              # small moment-of-use guidance
├─ lib/
│  ├─ speech.ts               # SpeechRecognition wrapper (start/stop/hotkey/commands)
│  ├─ commands.ts             # "period", "comma", "new line", "paragraph", "caps" → edit actions
│  ├─ polish.ts               # LLM cleanup (OpenAI-compatible chat completions via fetch)
│  ├─ storage.ts              # localStorage helpers (settings, history)
│  └─ types.ts
├─ public/                        # favicon, og image, app icon (lime)
├─ vitest.config.ts + src/?       # only if it stays simple; otherwise a tests/ dir
├─ .eslintrc / eslint.config.*
├─ tsconfig.json
├─ next.config.ts
├─ README.md
├─ LICENSE (MIT, "Copyright (c) 2026 Divine Ey3")
└─ .gitignore
```

Use `create-next-app@latest` with the app router, TS, ESLint, and Tailwind. (If `next`
16 isn't stable on your runner, fall back to the latest stable Next 15 + `@tailwindcss/postcss`.)

---

## Core UX (the magic)

1. **One mic button, center stage.** Click = start dictation (lime pulse ring while
   recording). Click again = stop. Keep it dead simple.
2. **Live interim transcript** streams into a text area as you speak. Editing stays enabled.
3. **Voice commands** (parsed in `lib/commands.ts`): say "period", "comma", "new line",
   "new paragraph", "caps [word]". Turn those spoken tokens into text edits. These are the
   Wispr-style "AI magic" that make it feel smart, done purely client-side.
4. **Polish with AI** — a button that takes the raw transcript and, using the user's
   configured LLM (BYO key), fixes punctuation/capitalization/awkward phrasing and returns
   clean markdown text. If NO key is configured, the button gracefully explains "add a key
   in Settings to enable AI polish" (no hard crash).
5. **Copy anywhere.** A "copy" button; also a small floating "vocca bar" concept that a
   user can move and type into — but keep the minimap of that for later. Primary = copy
   to clipboard + paste.
6. **History** in localStorage: every dictation saved, with re-use/re-copy.

---

## Requirements / constraints
- **No account, no login, no backend, no database.** Everything local. This is the open-source, privacy-first selling point.
- **No API key bundled.** User always brings their own (BYO).
- Respect English as default; recognize `lang` from browser or a setting.
- Handle mic permission prompt gracefully + a "mic blocked" hint.
- Type safety everywhere; no `any` leaks, no `//@ts-ignore`.
- Keep the UI accessible (WCAG AA: focus states, aria-labels on the mic button).

---

## Verification (run ALL before you claim done)
1. `npx tsc --noEmit` → 0 errors.
2. `npm run lint` → clean.
3. `npm run build` → succeeds (production build).
4. `npm run dev` boots; open `http://localhost:3000` → the app renders, mic button visible,
   no console errors.
5. Unit tests (if any) pass.
6. Manual smoke: the mic button toggles recording visual state; SpeechRecognition is wired
   (it will show an error only if you run it on a non-`https`/non-localhost origin, which
   is expected here — note it).

Report: files created, tech choices, exact verification results, and any assumption you made
that I (the founder) should sanity-check.