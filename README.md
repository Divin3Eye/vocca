# Vocca 🎙️

> Open-source AI dictation. Speak → get clean text — anywhere, no account, no subscription.

Vocca lets you **dictate with your voice and get polished text** you can use in any app.
Press the mic, talk, stop, and Vocca hands you clean text — with Wispr-style voice
**commands** ("period", "new line", "caps") parsed locally, and **AI polish** that tidies
punctuation and phrasing.

## Why

Commercial dictation tools lock this behind a subscription. Vocca is the privacy-first,
free, **make-it-yourself** alternative: **no account, no backend, no telemetry.**

- 🎙️ **Fast, free transcription** using your browser's native speech recognition (no API key)
- ✨ **AI polish (BYO key)** — clean up punctuation, grammar, and phrasing with any
  OpenAI-compatible model you bring; keep it local in your browser
- ⌨️ **Speak commands** — "period", "comma", "new line", "new paragraph", "caps" edit as you talk
- 🔒 **Local-first** — settings and history live only in your browser (`localStorage`)
- ⚖️ **MIT licensed** — fork it, sell it, ship it

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Web Speech API

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## AI polish (optional)

Enable it in ⚙️ Settings: provide an OpenAI-compatible **endpoint**, **model**, and your
**key**. Everything stays in your browser — nothing is sent anywhere except to *your*
chosen endpoint.

## License

[MIT](LICENSE) — © 2026 Divine Ey3 · made at [xohosting.in](https://xohosting.in)