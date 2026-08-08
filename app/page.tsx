import Link from "next/link";
import Aurora from "@/components/Aurora";
import ShinyText from "@/components/ShinyText";
import Beams from "@/components/Beams";

const features = [
  {
    title: "Instant by default",
    body: "Press Ctrl+Space, talk, and text lands on screen while you're still speaking. No waiting, no round-trips. Sub-100ms dictation.",
    icon: "⚡",
  },
  {
    title: "Voice commands built in",
    body: "Say \u201Cperiod\u201D, \u201Cnew line\u201D, \u201Ccaps lock on\u201D, \u201Cadd comma\u201D — punctuation and formatting, handled locally as you speak.",
    icon: "🗣️",
  },
  {
    title: "AI Polish that thinks",
    body: "One tap turns raw speech into clean, publishable prose. It resolves spoken corrections (\u201C6 PM — no, 9 PM\u201D → 9 PM) instead of just tidying typos.",
    icon: "✨",
  },
  {
    title: "English + Hindi",
    body: "Dictate in English or Hindi, and translate between them on the fly. Your voice, both worlds.",
    icon: "🌐",
  },
  {
    title: "Private by design",
    body: "Instant mode never leaves your device. Bring your own AI key and your polished text goes straight to you — no account, no cloud copies.",
    icon: "🔒",
  },
  {
    title: "Open source, MIT",
    body: "No lock-in, no dark patterns. Vocca is built in the open — read it, fork it, self-host it.",
    icon: "🧡",
  },
];

const steps = [
  {
    n: "01",
    title: "Press Ctrl+Space",
    body: "The lime mic pulses. You're live — anywhere in the app.",
  },
  {
    n: "02",
    title: "Talk like you write",
    body: "Say \u201Cperiod new line\u201D for formatting, or just speak naturally.",
  },
  {
    n: "03",
    title: "Copy, drive it, or polish",
    body: "Text appears instantly. Add AI polish for clean paragraphs, or copy as-is.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111] overflow-x-clip relative">
      {/* ---------- NAV ---------- */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-black/5 bg-[#fafafa]/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-lime-500 text-white text-sm font-black shadow-sm">
              V
            </span>
            Vocca
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-black/60">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#how" className="hover:text-black transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Divin3Eye/vocca"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex text-sm font-medium text-black/60 hover:text-black transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-[#111] text-white text-sm font-semibold px-5 py-2.5 hover:bg-black transition-colors shadow-sm"
            >
              Open Vocca
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="absolute inset-0 -z-10 opacity-90">
          <Aurora colorStops={["#84CC16", "#fafafa", "#A3E635"]} amplitude={0.8} blend={0.6} speed={0.8} />
        </div>
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-xs font-semibold text-black/70 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
            Open-source Wispr alternative
          </span>
          <div className="mt-8">
            <h1 className="animate-rise text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-black">
              Speak. It&apos;s already written.
            </h1>
          </div>
          <p className="mt-6 text-lg md:text-xl text-black/60 leading-relaxed max-w-2xl mx-auto animate-rise [animation-delay:120ms]">
            Press a key, say what you want, and it shows up on screen — instantly, accurately, and privately.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-sm bg-[#84CC16] hover:bg-[#A3E635] text-black font-bold px-8 py-4 text-base transition-colors shadow-[0_8px_30px_rgba(132,204,22,0.35)]"
            >
              Start dictating <span className="text-black/60">→</span>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white/80 px-8 py-4 text-base font-semibold hover:border-black/30 transition-colors"
            >
              See how it works
            </a>
          </div>
          <p className="mt-6 text-sm text-black/50 font-mono">
            Ctrl+Space · free forever core · BYO key for AI polish
          </p>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="py-24 border-t border-black/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <ShinyText text="Why people steal their résumés for Vocca" speed={3} color="#111" shineColor="#84CC16" className="text-xs uppercase tracking-[0.2em] font-bold" />
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              Everything Wispr does.
              <span className="text-lime-600 ml-2">Nothing it charges for.</span>
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-black/8 bg-white/70 p-7 backdrop-blur-sm hover:border-black/15 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-4 font-bold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="py-24 border-t border-black/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <ShinyText text="Three steps. Zero friction." speed={3} color="#ffffff" shineColor="#84CC16" className="uppercase tracking-[0.2em]" />
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">From thought to text in three breaths</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-[#111] text-white p-8">
                <span className="absolute top-6 right-6 text-5xl font-bold text-white/10">{s.n}</span>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-3 text-white/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section id="pricing" className="py-24 border-t border-black/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Pricing that respects you</h2>
            <p className="mt-4 text-black/60">The core is free forever. AI polish costs only what you already pay for AI.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-black/10 bg-white p-8 flex flex-col">
              <h3 className="font-bold text-lg">Free</h3>
              <p className="mt-1 text-sm text-black/50">The whole dictation core</p>
              <p className="mt-6 text-4xl font-bold">
                $0<span className="text-base font-medium text-black/40">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Unlimited instant dictation",
                  "Voice commands & formatting",
                  "English + Hindi",
                  "Local history",
                  "AI Polish with your own key",
                ].map((li) => (
                  <li key={li} className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">✓</span>
                    <span className="text-black/70">{li}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className="mt-8 rounded-xl bg-[#111] text-white font-semibold py-3.5 text-center hover:bg-black transition-colors"
              >
                Start free
              </Link>
            </div>
            {/* Pro / Patron */}
            <div className="rounded-2xl border-2 border-[#84CC16] bg-[#111] text-white p-8 flex flex-col relative overflow-hidden">
              <span className="absolute top-4 right-4 rounded-full bg-[#84CC16] text-black text-xs font-bold px-3 py-1">SOON</span>
              <h3 className="font-bold text-lg">Patron</h3>
              <p className="mt-1 text-sm text-white/50">Support the open build — features to come</p>
              <p className="mt-6 text-4xl font-bold">
                $9<span className="text-base font-medium text-white/40">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Everything free", "In-app AI polish (no key needed)", "Hindi↔English translation built-in", "Priority features & changelog access", "Reserved: desktop overlay, hotkey anywhere"].map((li) => (
                  <li key={li} className="flex items-start gap-2">
                    <span className="text-lime-400 font-bold">✓</span>
                    <span className="text-white/75">{li}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-8 rounded-xl bg-white/10 text-white/60 font-semibold py-3.5 text-center cursor-not-allowed border border-white/10"
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="py-24 border-t border-black/5">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">Questions? Sure.</h2>
          <div className="mt-10 space-y-4">
            {[
              ["Does my audio leave my device?", "In Instant mode, no. In AI Polish and translation modes, the text you dictate is sent to the AI provider you choose (or the built-in one with a Patron plan). You control your data."],
              ["Why a browser app and not a desktop overlay?", "Because speed and simplicity first. A browser app is one click to start, zero install, and works everywhere. A desktop overlay is on the roadmap."],
              ["Which AI models work with Polish?", "Anything OpenAI-compatible. Set your endpoint + key in settings — Vocab works with Zen, OpenAI, and more."],
              ["Do I need an account?", "No. Vocab is deliberately sign-in-free. History lives in your browser."],
            ].map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-black/10 bg-white p-6 open:shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-base">
                  {q}
                  <span className="text-lime-600 text-lg transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-black/60">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA / FOOTER ---------- */}
      <section className="relative py-28 border-t border-black/5 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60">
          <Beams />
        </div>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Your voice is faster than your hands.</h2>
          <p className="mt-6 text-lg text-black/60 max-w-xl mx-auto">Stop typing what you can say. Start dictating what you mean.</p>
          <Link
            href="/app"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#84CC16] hover:bg-[#A3E635] text-black font-bold px-8 py-4 text-base transition-colors shadow-[0_8px_30px_rgba(132,204,22,0.35)]"
          >
            Open Vocab
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-black/50">
          <div className="flex items-center gap-2 font-semibold text-black/70">
            <span className="grid place-items-center w-6 h-6 rounded-md bg-lime-500 text-white text-[10px] font-bold">V</span>
            Vocca — free, open-source dictation
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Divin3Eye/vocca" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">GitHub</a>
            <a href="mailto:admin@mythrixai.xyz" className="hover:text-black transition-colors">Contact</a>
            <span>© {new Date().getFullYear()} Vocca · xohosting.in</span>
          </div>
        </div>
      </footer>
    </div>
  );
}