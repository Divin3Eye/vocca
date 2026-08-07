# Build Vocca — v0.1 (LOCKED VISION — do not deviate)

Repo: `E:\Projects\Vocca`. Build the entire app from scratch in this repo.
**I am an AI-native founder — I do not hand-write code. You are the builder.**
Produce production-quality code and verify every step. If a requirement conflicts
with speed, SPEED WINS.

---

## The one-sentence vision (from the founder, verbatim)

> "Press a key, say what I want, and it shows up on screen — **everywhere**."

A dictation app that is **instant-first, keyboard-driven, minimal, and bilingual** —
the founder builds it because he needs it daily and refuses to pay a subscription.
Show it off = proof of real product skill.

---

## Hard product rules (founder's priorities — treat as law)

1. **Efficiency first.** ONE action to dictate. No navigating menus. No "next" buttons.
2. **Speed is the product.** In **Instant mode**, recognized text must appear on screen
   with **no perceptible wait** (browser-native recognition streams as you speak).
   A 10-second wait for one line = product failure. Never block the UI.
3. **Mode selector (user-pickable, default = Instant):**
   - **Instant** — raw browser-native transcript streams live, zero wait.
   - **Minor Polish** — after you stop, a quick AI cleanup pass (~1–3s) fixes
     punctuation/capitalization/fluency. The user *chooses* which mode is active;
     Instant is the default.
4. **Everywhere** — architecture must keep the door open for a future desktop overlay
   (Electron/Tauri) that types into ANY app. DO NOT build Electron now, but keep the
   speech/command logic in `lib/` modules decoupled from React UI so it can be reused.
5. **Show-off quality** — clean minimal UI (founder's brand: light theme, white canvas,
   near-black text, lime `#84CC16`–`#A3E635` accent, 12px radius, generous whitespace),
   plus a **visible "AI" moment** (polish/translate) so the demo proves AI skill too.

---

## Tech stack (mandatory)

- **Next.js 16** (App Router) or latest stable Next 15 fallback, **React 19**, **TypeScript strict**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Web Speech API** (`SpeechRecognition`/`webkitSpeechRecognition`) — free, no key, instant
- **BYO-key AI** for polish + translation: OpenAI-compatible chat completions via `fetch`,
  endpoint/model/key stored in **localStorage only**. No server, no DB, no account.
- Design: light theme + lime accent as specified. WCAG AA. aria-labels everywhere.

---

## Features (v0.1 scope — implement ALL)

### A. Start/stop dictation — the ONE action
1. **Global hotkey `Ctrl+Space`** toggles start/stop dictation (register + handle in a
   way that works when the page is focused; note: true "global" across apps comes with
   the future desktop shell — for v0.1 the hotkey works while the Vocca page/tab is focused).
2. **On-screen lime mic button** as backup (same toggle; big pulse-ring while recording).
3. **Settings toggle to disable the hotkey** (some users don't want shortcuts hijacked)
   and a **settings toggle to hide the floating mic button**. Both optional — user can
   keep either or both. Default: both ON.

### B. Modes — user picks in Settings, default **Instant**
- **Instant:** recognition streams `onresult` into the transcript live. No processing delay.
- **Minor Polish:** while speaking, stream raw text (still instant feel); on stop, call the
  AI endpoint for a quick cleanup pass (punctuation, caps, light fluency). Show a subtle
  "polishing…" state that never blocks the UI. If no AI key configured, fall back to a
  local light cleanup (capitalize sentence starts, fix spacing) so it still improves.

### C. Voice commands (spoken, client-side, instant)
Parse spoken tokens as commands and apply edits: **"period", "comma", "new line",
"new paragraph", "caps <word>"** (e.g. "caps Raj" → capitalize Raj). Commands must be
stripped from the final text (not left as words). Keep the command list small & snappy.

### D. Bilingual + translation (English + Hindi, both ways)
1. **Language setting:** English (`en-US`) or Hindi (`hi-IN`) — the recognition language
   the mic uses.
2. **Translate toggle** (default OFF): when ON, after you stop speaking the text is sent
   to the BYO AI endpoint for translation — **Hindi → English** if mic language is Hindi,
   **English → Hindi** if mic language is English. Output replaces/shows translated text
   with a clear "Translated from Hindi" note. Needs AI key; if missing, show a gentle
   "add a key in Settings to use Translate" hint (no crash).

### E. Capture & reuse (the "everywhere" feel)
1. **Copy button** — copy transcript to clipboard in one click (big, primary, lime).
2. **Floating capture bar** — a small draggable pill ("vocca bar") you can move around the
   page; it holds the mic + copy. Desktop-overlay-ready in spirit.
3. **History drawer** — past dictations in localStorage; click to restore/copy.

### F. Settings sheet (single ⚙️, keyboard-openable, `?` or `Ctrl+,`)
- Hotkey on/off · mic button on/off
- Mode: Instant / Minor Polish
- Language: English / Hindi
- Translate: off / on
- BYO AI: endpoint, model, API key (password field)
- All persisted in localStorage. Instant save. No save button.

---

## Project structure (create exactly this)

```
E:\Projects\Vocca\
├─ app/
│  ├─ layout.tsx            # light theme, metadata, fonts
│  ├─ globals.css           # tailwind v4 + brand tokens
│  └─ page.tsx              # main app (client)
├─ components/
│  ├─ MicButton.tsx         # lime mic, pulse ring, recording state
│  ├─ VoccaBar.tsx          # draggable floating capture bar (mic + copy)
│  ├─ TranscriptArea.tsx    # editable, live text, interim styling
│  ├─ ModeBadge.tsx         # shows current mode (Instant/Polish/Translated)
│  ├─ SettingsSheet.tsx     # all settings above, localStorage
│  ├─ HistoryDrawer.tsx     # past dictations
│  └─ CommandHints.tsx      # tiny hint row: period · new line · caps X
├─ lib/
│  ├─ speech.ts             # SpeechRecognition wrapper (start/stop/language/stream)
│  ├─ commands.ts           # "period","comma","new line","new paragraph","caps X"
│  ├─ polish.ts             # AI cleanup + local fallback light-cleanup
│  ├─ translate.ts          # Hindi<->English via BYO AI
│  ├─ storage.ts            # localStorage helpers
│  ├─ hotkeys.ts            # Ctrl+Space toggle (with enable/disable)
│  └─ types.ts
├─ public/                  # favicon/icon (lime)
├─ tsconfig.json · next.config.ts · eslint.config.*
├─ vitest.config.ts + tests/ (lib logic: commands, storage, polish-fallback)
├─ README.md · LICENSE (MIT, © 2026 Divine Ey3) · .gitignore
```

---

## Performance gates (NON-NEGOTIABLE)
1. In Instant mode: **first transcript word appears while still speaking** — no post-stop
   processing. Nothing waits on network.
2. No jank on the mic toggle; UI thread never blocked by AI calls (all async, non-blocking).
3. `npm run build` succeeds; `tsc --noEmit` zero errors; lint clean.
4. `npm run dev` → `http://localhost:3000` renders the app, mic toggles, no console errors.

---

## What NOT to do
- No account/login/backend/database/telemetry. Local-first is the selling point.
- No bundled API key, ever. BYO only.
- No Electron/Tauri in v0.1 — but keep `lib/speech.ts` and `lib/commands.ts` framework-free.
- No dark theme. Light + lime only.
- Don't restyle or "improve" the spec — build exactly this.

---

## Verification checklist (run ALL, then report)
1. `npx tsc --noEmit` → 0 errors
2. `npm run lint` → clean
3. `npm test` → all pass
4. `npm run build` → succeeds
5. Dev server boots; page renders; mic button shows recording state on click
6. Manual smoke: type a voice-command string through `lib/commands.ts` in a unit test
   ("Hello period new line world" → "Hello.\nworld")
7. Confirm hotkey toggle works while page is focused (note: browser-only limitation is
   expected and documented in README)

Report: files created, decisions made, verification results, and anything you
assumed that I (the founder) should sanity-check.