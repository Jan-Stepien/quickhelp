import Link from "next/link";

// REPLACE: all placeholder content with your app's copy
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="font-bold text-lg">AppName</span>
        <Link
          href="/app"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Try free
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          {/* REPLACE: crisis hook badge */}
          Free — no account required
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 max-w-2xl leading-tight mb-4">
          {/* REPLACE: headline — lead with the outcome, not the tool */}
          [Specific outcome] in 60 seconds
        </h1>

        <p className="text-xl text-gray-500 max-w-xl mb-8">
          {/* REPLACE: one sentence on who it's for and what problem it solves */}
          Placeholder description of the pain this tool removes.
        </p>

        <Link
          href="/app"
          className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          {/* REPLACE: action-oriented CTA */}
          Get my [output] now — free
        </Link>

        <p className="mt-4 text-sm text-gray-400">
          No signup. No credit card. Works in your browser.
        </p>
      </section>

      {/* Social proof / how it works */}
      <section className="border-t border-gray-100 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { step: "1", title: "Enter your details", desc: "Fill in the short form — takes under a minute." },
              { step: "2", title: "Get your result", desc: "AI generates a personalized output instantly." },
              { step: "3", title: "Use it", desc: "Copy, download, or share — done." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-black text-white px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to [outcome]?</h2>
        <p className="text-gray-400 mb-8">Free. No signup. Takes 60 seconds.</p>
        <Link
          href="/app"
          className="bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
        >
          Get started
        </Link>
      </section>
    </main>
  );
}
