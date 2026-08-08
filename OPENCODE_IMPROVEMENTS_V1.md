# Vocca — IMPROVEMENTS V1 (build prompt)

Apply these changes to the existing Vocca app at `E:\Projects\Vocca`. Build on the current
committed state (`3226e4a`, dashboard v2 — 64 tests green). Do NOT rewrite from scratch.
Do NOT break the working build.

I am an AI-native founder; I do not hand-write code. You are the builder. Verify everything:
`npm test` green and `npm run build` clean before you stop.

---

## SOURCE OF TRUTH (read first)

The visual reference for the new settings surface is the HTML mockup:

**`design/vocca-improvements-v1.html`** (open it in a browser; it is interactive).

Use it for layout/feel/colors of the new Settings areas (hotkey recorder rows, custom-word
rows, feature list). The mockup's demo JS is decorative — wire real components with real
state, real storage, real speech. Do not copy its toy JavaScript.

Existing design system (unchanged): background `#f7f7f4` · cards `#ffffff` · borders
`#e7e7e1` · ink `#1a1a17` · muted `#6f6f66` · accent lime `#84cc16` (active states,
mic) · lime-soft `#ecfccb` (new-feature pills) · danger `#ef4444` (recording, destructive).
Radii: cards 18–22px, pills 999px, buttons 11–12px. Keep it airy and calm.

---

## WHY (the founder's brief — product direction, keep it in mind)

Vocca competes with Wispr Flow and Handy for people who think faster than they type.
This pass ships three founder-locked upgrades plus a competitor-feature sweep:

1. **Custom Keys with chord triggers** — any action can be bound to a 2- or 3-button
   combo (e.g. `Ctrl+Alt+S`), not just a single fixed shortcut.
2. **Custom Words with judgment** — say "linkedin" and Vocca inserts the user's LinkedIn
   profile link — BUT ONLY when the user actually *wants the snippet*. If the user says
   "Setup Linkedin to get connected to professional people and leads", the word must stay
   a normal word. The AI/vocab layer must apply judgment, not blind replace.
3. **Competitor feature sweep** — Transforms (re-shape already-dictated text), Re-insert
   last dictation (paste recovery), per-language hotkeys, quit-mid-dictation recovery,
   hands-free snooze/shake affordances, voice editing of selected text.

Polishing a raw transcript that mangles the user's name/terms remains forbidden:
My Words + Custom Words must never corrupt the canonical polish guarantee
(`"Let's do a meeting at 6 PM — no, 9 PM"` → `…9 PM`, the correction resolves).

---

## DESIGN SYSTEM additions (only what's new)

- Replace the literal «Ctrl+Space» label in Settings with a **hotkey recorder row**: a
  dashed-border chip that says «press keys…» while capturing, then shows the captured
  chord (e.g. `Ctrl+Alt+S`). Recording state: lime border + lime-soft fill + gentle
  pulse animation.
- Custom Words editor uses the same row pattern as the mockup: `say → insert` rows with
  an ✕ delete; a dotted `+ Add custom word…` button that appends an empty row.
- Every hotkey row shows a pill: «default» (lime-soft) for the built-in defaults,
  «custom» (neutral) once the user changed it.

---

## CHANGES

### 1. Chord hotkeys (the headline feature)

Replace the single `registerHotkey(key, modifiers, callback)` with a chord model:

- `HotkeyChord = { keys: string[] }` — 2 or 3 keys pressed simultaneously
  (e.g. `["ctrl"," "]` for Ctrl+Space, `["ctrl","alt","s"]`). One key is not enough;
  four+ is not allowed. Case-insensitive, `,`-separated ordering normalized by a
  canonical `normalizeChord()` (so `["ctrl","alt","s"]` equals `["alt","ctrl","s"]`).
- `lib/hotkeys.ts`: rewrite to register a *set* of chords; a chord fires its action on
  keydown when ALL its keys are held simultaneously and no chord shares that exact set.
  On keyup of the final key, fire `onRelease` if the action defines one (push-to-talk).
- Settings gains a **Hotkeys manager**: rows mapped to actions:
  1. **Dictate (push-to-talk)** — default `Ctrl+Space` (press = start, release = stop).
  2. **Dictate + polish** — default `Ctrl+Shift+Space`.
  3. **Dictate in Hindi (second language)** — default `Ctrl+Alt+Space`.
  4. **Re-insert last dictation** — default `Ctrl+Alt+Shift+V` (or any 3-key combo you
     pick — do NOT collide with defaults above; this one stays unset until the user
     sets it).
  5. **Toggle floating mic** — default `Ctrl+M`.
- Clash protection: when the user records a chord already used by another action, show a
  small inline warning («Already used by Dictate») and do NOT set it.

Each binding is stored in `Settings.hotkeys: Record<HotkeyAction, HotkeyChord>` with a
migration from the old `hotkeyEnabled` boolean (if `hotkeyEnabled:false`, dictation
stays off until the user re-enables; the toggle remains as a master switch).

### 2. Custom Words (voice snippets) with context judgment

New storage `vocca_words` … **NO — use a new key `vocca_snippets`**, shape:

```ts
interface DictSnippet {
  id: string;          // crypto.randomUUID()
  cue: string;         // spoken cue, lowercase, e.g. "linkedin"
  replacement: string; // inserted text, e.g. "https://www.linkedin.com/in/divine-eye"
  enabled: boolean;
}
```

- `lib/storage.ts`: `loadSnippets()`, `saveSnippets()`, `addSnippet()`, `removeSnippet()`
  mirroring the existing My Words helpers. Cap 50 snippets, dedupe by cue (case-insensitive).
- **No more than ONE expansion path**: remove the idea of a blind "replace cue with the
  snippet" insert — instead, expansion lives at the command level and is **context-judged**:

#### Expansion rules (golden)

The snippet list is passed where any command processing or polish runs. Expansion is
governed by the TWO rules below; the LinkedIn teaching case is a hard test in `tests/`:

1. **Instant path (no AI)**: expand a cue only when the user's phrasing *requests the
   snippet's value* — plain cues preceded by an action verb or possessive: «"paste my"
   |"use my" |"insert my" |"send it to (my)" ?(cue)» → the replacement. A bare cue
   standing alone as a sentence (not prefaced) is ALSO expanded (that's the 1-word
   shortcut), but a cue used as a normal noun in an informative sentence (e.g. *"Setup
   Linkedin to get connected to professional people and leads"*) must NOT be expanded —
   that's the founder's example; encode it literally as a test.

B. **AI paths (Email/Chat/Note/Code / polish / word-command)**: the polish prompt
   receives the snippet list (cue → value) and an extra instruction line:

   > You have Custom Words: each maps a spoken cue to a piece of the user's personal
   > text, and you have these entries: `<cue> → <value>`. When the user clearly asks
   > for their value («send it to my linkedin», «use my email», «insert my signature»,
   > «my linkedin», «my email», «my signature»), substitute the value. When the user is
   > talking about the thing itself (e.g. "setup linkedin to get connected to
   > professionals", "my email account is getting hacked"), keep the plain word. Never
   > invent a value; never substitute inside quotes/URLs/repeats.

C. **Edge**: cue must match as a whole word (linkedin never matches inside
   "linkedinfo"); replacement does not re-run through commands (a URL must not be
   un-slashed by a "/" rule).

The two golden snippets pre-seeded in `DEFAULT` state (only on first run, when key
absent): `linkedin → https://www.linkedin.com/in/divine-eye` (user's real profile),
`my email → admin@xohosting.in`. (empty cue rows are dropped on save.)

### 3. Transforms (re-shape existing text)

Wispr-style: select any text in the TranscriptArea (via highlight) or a History entry →
the mode row becomes a transform bar for *already-dictated text*:

- A「Transform」chip row appears under the transcript whenever text is selected:
  **Email · Chat · Note · Code · Summary** — plus **Trim** (remove filler: "um",
  "like", repeated words) and **Rewrite** («make it more professional»).
- Clicking a transform runs the existing `polishText(text, settings, mode, words)` with
  the target mode and *replaces the selected range* (or the whole transcript when no
  selection). Word y/n — but the result replaces; original lost? NO — keep the original
  in the new entry so Undo (existing) restores it.

### 4. Re-insert last dictation (paste recovery)

- `lib/storage.ts` new key `vocca_last`: the last committed dictation (string + mode +
  timestamp) — written every time dictation ends (on insert).
- The **Re-insert last** hotkey (or a History row button) re-runs the last insertion:
  appends the last dictation into whatever text field has focus at that moment (same
  caveat as today: within the Vocca page). If nothing in the history, no-op and show a
  soft «Nothing to re-insert» toast for 2s.
- User story it fixes (from Handy): a paste that lost focus mid-dictation is recoverable
  without re-dictating.

### 5. Quit-mid-dictation recovery

- The **quit** case today: if a dictation ends because the page was closed mid-transcript,
  the final interim text is already in `vocca_history` (actual design):
  - Confirm the existing behavior: interim transcript is saved on「stop」. Add a
    pagehide (not unload) handler: if a transcript exists and `recording===false`, do a
    final `addToHistory` so nothing is lost. On a fresh load, show a banner when the last
    history entry is under 60s old: **»Recover last dictation«** → re-inserts it.

### 6. Hands-free snooze + voice editing of selected text

- **Snooze**: a «Snooze 5 min» option in the mic menu (and default `Ctrl+Alt+S`? NO — do
  not conflict: snooze is NOT a hotkey by default; it's a mic-menu button). When active,
  the floating mic dims and the hotkey does not start dictation until the timer ends.
- **Voice editing of selected text**: while a selection exists in the transcript area,
  pressing **Dictate+polish** routes the new dictation text as an *edit* instruction
  (e.g. say «make that more professional», «shorter», «as bullet points») →
  `polishTheText(selection, instruction…)` and replace. This is the web-app-worthy slice
  of Wispr's highlight-and-edit. Command hints mention: «select text, then dictate an edit».

### 7. Word count / WPM / pulse — verify & keep

The v2 header already shows live word count, ⚡WPM, dictations, streak. Keep as-is;
just add the **pulse meter** from the mockup (an animated lime progress ring/bar that
moves while speaking) if not already present — mockup reference only.

---

## DO NOT

- Do NOT touch `app/page.tsx` (landing page) — the founder owns it.
- Do NOT change the canonical polish test (6PM-no-9PM resolution).
- Do NOT add analytics, telemetry, or any external auth.
- Do NOT rename existing storage keys (`vocca_settings`, `vocca_history`, `vocca_words`,
  `vocca_stats`) — migrate, never break.
- Do NOT make the app look like generic SaaS — keep the airy white/lime aesthetic
  accents from the mockup.
- Do NOT remove BYO AI (OpenCode Zen default `deepseek-v4-flash-free`) or the Hindi
  path.

---

## VERIFY (all must pass before you say done)

1. `npm test` — all suites green, including new tests:
   - `tests/snippets.test.ts` — custom-word expansion (action cues), the literal
     LinkedIn teaching case (NO expansion), whole-word safety, insert-your-value
     phrases, dedupe by cue, 50-cap.
   - `tests/hotkeys.test.ts` — chord matching (2-key and 3-key, any modifier order,
     case-insensitive), conflict rejection, release-to-stop, disable toggle.
   - `tests/polish.test.ts` — existing canon tests still pass; new: transform mode
     via snippets-aware prompt does not invent cues.
2. `npm run build` — clean, no type errors.
3. Manual sanity: in dev server, record a chord change, restart the page — the
   binding persists (localStorage), click-clash warns inline.
4. Report: files changed, what each does, test/build output, and anything you had to
   decide that the founder should know.

You are the builder. The founder is not a coder — be precise, be complete, be verified.