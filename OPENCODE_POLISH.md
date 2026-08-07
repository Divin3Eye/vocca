# Vocca — POLISH PASS (improvements to v0.1, founder-specified)

Apply these changes to the existing Vocca app at `E:\Projects\Vocca`. Build on the current
working v0.1 — do NOT rewrite from scratch. Do NOT change the working build.

I am an AI-native founder; I do not hand-write code. You are the builder. Verify everything.

---

## THE TWO CHANGES (founder's exact complaint — do both)

### CHANGE 1 — Mode switcher visible from the START (not buried in Settings)

Currently AI Polish is effectively hidden (only "Instant" shows; Settings holds the choice,
and there's NO visible "AI Polish" tab). Fix so a user can switch **Instant ⇄ AI Polished
right from the main screen, one tap, before dictating.**

- Add a clear **Instant / AI Polish** segmented toggle at the top (above the transcript box,
  near/around the existing tabs), styled consistently: a two-option pill/segmented control
  using the lime accent for the active side.
- **Empty transcript hint changes per mode:** when "AI Polish" is selected, the placeholder
  in the text box should say something like *"Dictate — Vocca will clean it up like a pro"*;
  Instant keeps *"Your dictation will appear here…"* (or similar).
- When the user is in AI Polish mode and stops speaking, run the polish pipeline
  (below). Show a subtle "Polishing…" state that never blocks the UI. Instant mode stays
  instant (live streaming, no wait).
- Settings still has the shared default, but the on-screen toggle is the immediate control.

### CHANGE 2 — The AI polish must be genuinely intelligent (not "random polishing")

The founder's exact example (surfacing the bug):

> User says: *"Let's do meeting at 6PM — no 9PM"*
> Expected clean result: **"Let's do the meeting at 9 PM."**
> Current (wrong) behavior randomly keeps/cleans in a way that can leave "6 PM" in, or
> produce incoherent output.

So the polish pass must UNDERSTAND spoken wording, not just split/replace. Requirements:

1. **Resolve voice corrections & self-edits.** Recognize phrases like "no, X", "actually X",
   "I mean X", "wait — X", "let's make it X" and RE-PLACE the prior value with the corrected
   one. In the example, "6PM — no 9PM" must become "9 PM" (the "6" is DELETED; "9 PM" wins).
2. **Produce clean, coherent final prose:** correct punctuation, capitalization, sentence
   boundaries, spacing. Remove stumbles, fillers ("um", "uh", "like"), and spoken commands
   that were already applied.
3. **Do not invent facts.** If the speaker gave only one time/one number, that value stays.
4. Return **only the final text** — no commentary, no quotes, no "Here's your text:".

Implement this with a **well-engineered system prompt** for the polish call. This is the
"AI magic" the resume demo is built on — make the prompt good. Example system prompt to
build on (tune freely):

```
You are a precise dictation editor. A user is speaking, and their raw speech has stumbles,
corrections, and spoken punctuation. Produce the final clean text they meant.
Rules:
- Resolve self-corrections: if they say a value then correct it ("6 PM, no 9 PM",
  "on Tuesday — actually Wednesday"), keep ONLY the corrected value.
- Remove fillers and stumbles (um, uh, like, I mean).
- Apply proper punctuation, capitalization, and sentence breaks.
- Keep every real fact and number the speaker actually settled on. Never invent or drop
  information that wasn't corrected away.
- "The meeting" vs "meeting": keep the speaker's word choice; only fix obvious grammar that
  does not change meaning.
Output ONLY the cleaned text. No preamble, no quotes, no explanation.
```

Wire the endpoint/model: default = **OpenCode Zen** (`https://opencode.ai/zen/v1`,
**model `deepseek-v4-flash-free`**) — the app should already read this from Settings; make
sure this default endpoint+model is prefilled so polish works out of the box. (User brings
the key; the endpoint+model defaults are now fixed.)

---

## DO NOT
- No rewrite of the whole app. Minimal, surgical change to add the mode toggle + upgrade the
  polish prompt/pipeline.
- No account/login/backend/DB/telemetry. Still local-first. Key stays in localStorage.
- No dark theme change, no lime-brand change.

---

## VERIFY (all pass)
1. `npx tsc --noEmit` → 0 errors
2. `npm run lint` → clean
3. `npm test` → all pass (add a test for the polish system prompt text being wired, and for
   the mode-toggle state logic)
4. `npm run build` → succeeds
5. Dev boots; **both** "Instant" and "AI Polish" toggle options are visible on load; toggling
   changes the empty-state hint; mic + copy still work.
6. If you can, run one polish call against the configured endpoint and report the input/output
   for the example: "Let's do meeting at 6PM — no 9PM" — confirm it returns "Let's do the
   meeting at 9 PM." (If you can't hit network, describe exactly what you'd change.)

Report: files changed, the final polish system prompt, verification results, and any
assumptions for me to sanity-check.