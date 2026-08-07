# Vocca

Open-source AI dictation. Speak, get clean text, everywhere.

Vocca lets you dictate with your voice and get polished text you can use in any app.
Press the mic or hit Ctrl+Space, talk, stop, and Vocca hands you clean text.

## Features

- Instant dictation via browser-native Web Speech API (no API key needed)
- Voice commands: "period", "comma", "new line", "new paragraph", "caps X"
- AI polish mode: cleanup punctuation, capitalization, fluency (BYO key)
- Bilingual: English and Hindi recognition, both-way translation
- Floating draggable capture bar
- History drawer with restore/copy
- Settings persisted in localStorage, no account needed

## Stack

Next.js 16 / React 19 / TypeScript strict / Tailwind CSS v4

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Tests

```bash
npm test
```

## AI features (optional)

In Settings, provide an OpenAI-compatible endpoint, model, and API key for:
- Minor Polish mode (auto-cleanup after dictation)
- Translation (English to Hindi or vice versa)

Everything stays in your browser. Nothing is sent except to your chosen endpoint.

## Limitations

- Web Speech API is browser-only; works best in Chrome
- Ctrl+Space hotkey works while the Vocca page is focused (true global hotkey requires the future desktop shell)
- Speech recognition is not supported in all browsers

## License

[MIT](LICENSE) - (c) 2026 Divine Ey3
