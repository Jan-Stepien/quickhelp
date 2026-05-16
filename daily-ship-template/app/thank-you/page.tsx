import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-3">You're in!</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        {/* REPLACE: describe what they just unlocked */}
        You now have unlimited access. Go generate something great.
      </p>
      <Link
        href="/app"
        className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        Back to the tool
      </Link>
    </main>
  );
}
