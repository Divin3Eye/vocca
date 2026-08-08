# Vocca — DASHBOARD V2 (build prompt)

Apply these changes to the existing Vocca app at `E:\Projects\Vocca`. Build on the current
working v0.1+ codebase — do NOT rewrite from scratch. Do NOT break the working build.

I am an AI-native founder; I do not hand-write code. You are the builder. Verify everything.

---

## SOURCE OF TRUTH (read first)

The visual design for this pass is fully specified in the HTML mockup:

**`design/vocca-dashboard-v2.html`** (open it in a browser; it's interactive).

Build the REAL app to look and feel like that mockup — layout, colors, spacing, states,
copy. But the mockup's demo JavaScript is decorative: wire the real components with real
state, real speech, real storage, real AI calls. Do not copy the mockup's toy JS.

---

## WHY (the founder's brief — this is the product direction, keep it in mind)

We are building Vocca to compete with Wispr Flow for people who think faster than they type.
Real Reddit complaints about dictation apps (r/ProductivityApps, r/Productivitycafe,
r/WisprFlow) define the features:

| User pain (Reddit, paraphrased) | Vocca v2 answer |
|---|---|
| "It typed 'AWS lambda logs' as 'Alice's lamb belongs'" | Live streaming interim text + **Scratch that** undo for the last segment, re-dictate instantly |
| "First words are about 30%" (dropped first words) | Interim text streams live so nothing feels eaten; no blank-wait UX |
| "If I pause a second it loses the thread" | Pause-proof listening: thinking pauses don't end the dictation |
| "Wispr takes screenshots of your screen — dealbreaker" | **"No screenshots. Ever."** badge — a web app physically cannot see your screen; no account, no cloud storage of audio |
| "Way overpriced, $150/yr" | Free forever + BYO AI key (OpenCode Zen default, `deepseek-v4-flash-free`) |
| "Not on Windows. Anything similar?" | Works on Windows, Mac, Linux — it's a web app |
| "My surname had to be put in the system" | **My Words** dictionary: user-added terms are protected — never "corrected" by AI polish |
| "30 → 100+ wpm is the superpower" | **Speed stats**: live WPM while talking, words today, day streak 🔥 |
| "Screen-aware formatting" (competitor's touted feature) | **Format presets**: Instant / Email / Chat / Note / Code — dictate once, get the shape you want |

---

## DESIGN SYSTEM (match the mockup)

- Background `#f7f7f4` · cards `#ffffff` · borders `#e7e7e1` · ink `#1a1a17` · muted `#6f6f66` · faint `#a3a39a`
- Accent: lime `#84cc16` (active states, mic), lime-dark `#4d7c0f` (text on lime-soft), lime-soft `#ecfccb` (pill backgrounds)
- Danger `#ef4444` (recording state, destructive hover)
- Radii: cards 18–22px, pills 999px, buttons 11–12px · soft shadows (`0 1px 2px rgba(20,20,10,.04), 0 8px 24px -12px rgba(20,20,10,.10)`)
- Typography: existing Geist font stack; large tracking-tight headings for the status line
- Keep it airy and calm — this must NOT look like generic AI-slop SaaS. Plenty of whitespace, one strong accent, honest microcopy.

---

## CHANGES

### 1. Modes → Format presets (the headline feature)

Replace the current Instant / AI-Polish toggle with a **format preset row** (the mockup's
segmented control): **Instant** (default) · **Email** · **Chat** · **Note** · **Code**.

- `Mode` type in `lib/types.ts` becomes: `"instant" | "email" | "chat" | "note" | "code"`.
  Update `Settings.mode` and every consumer (`page.tsx`, `SettingsSheet`, `ModeBadge`,
  tests). Keep backward-compat where cheap: treat any stored `"polish"` as `"email"` on load.
- **Instant** = raw dictation, commands applied, no AI wait (existing behavior).
- **Email / Chat / Note / Code** = dictate, and when the user stops speaking, run the AI
  polish pipeline with a **format-specific system prompt** (see CHANGE 2). Show a subtle
  "Polishing…" state that never blocks the UI.
- **Status line + placeholder change per mode** (match mockup):
  - Instant → "Ready when you are." / "Say “period”, “new paragraph”, “caps” — or just talk. Vocca cleans as you go." / placeholder "Your dictation will appear here…"
  - Email → "Email mode." / "Vocca will shape what you say into a clean, professional email." / "Dictate — Vocca will shape it…"
  - Chat → "Chat mode." / "Short, natural, message-ready. No formality, just flow."
  - Note → "Note mode." / "Fast bullet-friendly notes — ideas before they evaporate."
  - Code → "Code mode." / "Dictate code in plain words — Vocca formats it as code blocks."
- The transcript header label changes per mode (Transcript / Email draft / Message / Note / Snippet) and shows "Listening…" while recording.
- Settings still stores the shared default mode; the on-screen row is the immediate control.

### 2. AI polish upgrades (keep the healthy-canon guarantee)

The polish engine must keep the existing guarantee (test case, must still pass):
> "Let's do a meeting at 6 PM — no 9 PM" → **"Let's do the meeting at 9 PM."**
> (self-correction resolved, nothing invented, only final text returned).

Now make polish **format-aware**. `polishText(text, settings, format)` — extend the system
prompt per format:
- **email**: shape into a clean professional email (greeting only if dictated; keep every
  real fact; do not invent names/dates)
- **chat**: short, natural, message-ready; no formality
- **note**: terse, scannable, bullet-friendly
- **code**: turn plain-spoken instructions into a code block; infer a sensible language if
  obvious, else plaintext
- **instant**: never called (no AI wait in Instant mode)

Add the **protected terms injection**: if the user has dictionary words (CHANGE 5), append
to every polish system prompt: "These terms must appear exactly as written and must never
be 'corrected' or respelled: [list]". A term used in the dictation must appear verbatim in
the output (casing may follow sentence rules; spelling must not change).

Keep: return ONLY the final text; OpenCode Zen default endpoint
(`https://opencode.ai/zen/v1`, model `deepseek-v4-flash-free`) prefilled; `localPolish`
fallback when the AI call fails (Instant-style cleanup, no format shaping).

### 3. Transcript card redesign

Build the mockup's transcript card (header meta + body + footer toolbar) on top of the
existing `TranscriptArea`/`page.tsx` state:

- **Header**: label (per-mode, "Listening…" while recording), pulsing red live-dot while
  recording (muted otherwise), **word count chip** (live), **⚡WPM chip** (live estimate
  while recording: words / elapsed minutes), animated **mic-level equalizer** (6 bars) that
  animates while listening and sits quiet otherwise. If a real mic-level API isn't
  available in the browser, animate the bars while `recording === true` and keep them idle
  otherwise — do not over-engineer.
- **Body**: interim text styled italic/faint appended after final text (existing behavior),
  plus the per-mode placeholder.
- **Footer toolbar** (left): **Scratch that** (removes the last finalized utterance —
  keep a stack of finalized segments; "scratched" state shows a gentle confirmation in the
  placeholder area), **Rephrase** (runs the current text through the format's polish and
  replaces it), **हिंदी / EN** translate button (existing translate flow, one tap toggle of
  translation output). (right): **Copy** (dark primary button; flips to "✓ Copied!" for
  ~1.4s). Buttons use the mockup's styles; disabled states when transcript is empty.

### 4. Mic + recording states

- Big circular lime mic (84px) centered below the card, with the mockup's icon, hover
  scale, and **expanding ring animation while recording**; recording state turns the mic
  red with a red glow (existing `MicButton` upgraded to match).
- Card border glows lime while listening (`border-lime + 4px lime ring at 15%`).
- Hint line under the mic: "Hold Ctrl+Space while talking, release when done · or tap the mic".
- Keep the floating draggable `VoccaBar` (mic + copy) — unchanged behavior.

### 5. My Words dictionary (new, localStorage)

- New card "My words (dictionary)" with an add-input + Add button and removable tags
  (mockup behavior). Store as `string[]` under a `vocca:dictionary` key in `localStorage`
  (`lib/storage.ts`: `loadDictionary` / `saveDictionary`).
- Protected-term injection into every polish prompt (CHANGE 2) is the functional core.
- Microcopy under the card (mockup): "Words you add are protected: Vocca never 'corrects'
  them, and AI polish keeps them exactly as written. Fixes the 'it butchered my
  name/product' problem."
- Validate: trim, dedupe, ignore empty; cap at ~200 terms.

### 6. Speed stats (new, localStorage)

- "Today" card with four stats: **words dictated today**, **⚡ WPM today** (best or latest —
  your call, state it in the report), **dictations today**, **day streak 🔥** (consecutive
  days with ≥1 dictation).
- Track on dictation end: word count, elapsed recording time, timestamp. Store a compact
  daily rollup under `vocca:stats` in localStorage (`lib/storage.ts`: `recordDictation`,
  `loadStats`). Rollups keyed by `YYYY-MM-DD`; prune entries older than 90 days.
- Microcopy under the grid (mockup): "Typing average is 40 wpm. You talk at 94. That's the superpower." — substitute real numbers.

### 7. Voice commands — expand

Extend `lib/commands.ts` (`processCommands`) with the mockup's command set, all tested:
- existing: "period", "comma", "new line", "new paragraph", "caps <word>"
- new: **"quote"** → `"`, **"dash"** → `—`, **"colon"** → `:`, **"question mark"** → `?`,
  **"exclamation"** → `!`, **"scratch that"** → removes the last segment (returns a control
  signal the page consumes — see CHANGE 3; if that's awkward, handle "scratch that" at the
  page level on finalized segments and keep commands.ts purely textual — your choice,
  document it)
- Keep command recognition forgiving (word-boundary, case-insensitive, optional trailing "s"/"point" variants: "question mark"/"questionmark", "exclamation"/"exclamation mark").

### 8. Privacy positioning (copy + honest)

- **Privacy pill in the header** (mockup): shield icon + "No screenshots. Ever." — stays
  visible at all times.
- **"Why Vocca is safe" card** (mockup) with three honest checkmark lines:
  1. No screenshots. Vocca is a web app — it cannot see your screen.
  2. No account, no cloud storage of your audio. Dictation runs through your browser's
     speech engine.
  3. AI polish uses your own key (BYO AI). Free tier: DeepSeek v4 flash, no charge.
- Copy must stay accurate — never claim features we don't have (no claim that audio never
  touches the speech engine's servers; frame it as "no Vocca account, no Vocca cloud").

### 9. Layout assembly (page.tsx)

Rebuild `app/app/page.tsx` to the mockup's structure, keeping all existing wiring
(hotkeys, speech callbacks, history drawer, settings sheet, VoccaBar, translation,
polish/instant logic):

1. Top bar: brand (lime mic glyph + "Vocca") left; privacy pill, History, Settings right.
2. Status line (kicker + h1 + sub) — swaps per mode and recording state
   ("Ready when you are." → "Go ahead — I'm listening." → "Nice. Want me to polish it?").
3. Format preset row.
4. Transcript card.
5. Mic zone + hint.
6. Voice-command chips ("Voice commands — just say these while dictating", with the mockup's
   expanded set; a dashed "+ more in settings" chip that opens Settings).
7. Two-column grid: left = Today stats card; right = My Words card + Why Vocca is safe card.
8. Footer line: "Vocca · open-source (MIT) · works on Windows, Mac, Linux · free forever".

Keep `Aurora/Beams/BlurText/ShinyText/SplitText` untouched — they belong to the landing
page, which is out of scope.

---

## DO NOT

- No rewrite of the whole app. Surgical, structured changes only.
- No landing page work (`app/page.tsx` at the root is the landing page — DO NOT TOUCH).
- No account/login/backend/DB/telemetry. Still local-first; keys in localStorage.
- No dark theme. No new brand color beyond the lime system above.
- No new npm dependencies unless truly unavoidable (state the reason in your report if so).
- Do not invent privacy claims beyond CHANGE 8's copy.

---

## VERIFY (all must pass)

1. `npx tsc --noEmit` → 0 errors
2. `npm run lint` → clean
3. `npm test` → all existing tests pass; ADD tests for:
   - new commands (quote, dash, colon, question mark, exclamation, variants)
   - dictionary load/save/dedupe/trim and polish-prompt protected-terms injection
   - stats rollup (words/day, streak across date boundaries, pruning)
   - format preset switching updates mode state + placeholder
   - polish format prompts contain the format instruction
   - the healthy-canon case still resolves "6 PM — no 9 PM" → "9 PM" (keep existing test)
4. `npm run build` → succeeds
5. Dev boots; all five presets render; switching changes status line + placeholder; mic
   starts/stops speech; Copy copies; Scratch that removes the last segment; dictionary add
   + remove persists across reload; stats update after a dictation (you can fabricate a
   small dictation in devtools or a unit test).
6. If network is available, run one polish call per format against the configured endpoint
   and paste the input/output pairs in your report. If you cannot hit the network, describe
   exactly what you changed in the prompts.

Report: files changed, the final polish system prompts per format, the command list,
verification results, and any assumptions I should sanity-check.
