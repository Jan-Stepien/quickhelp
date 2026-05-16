"use client";

import { useState } from "react";
import Link from "next/link";

// REPLACE: form fields, system prompt, and result display to match your app
export default function AppPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({
    field1: "",
    field2: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data.result);
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2">
          {/* REPLACE */}
          Get your [output]
        </h1>
        <p className="text-gray-500 mb-8">
          {/* REPLACE */}
          Fill in the form below and we'll generate it instantly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* REPLACE: add/remove/rename fields to match your spec */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field 1
            </label>
            <input
              type="text"
              required
              placeholder="e.g. placeholder text"
              value={form.field1}
              onChange={(e) => setForm({ ...form, field1: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field 2
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. placeholder text"
              value={form.field2}
              onChange={(e) => setForm({ ...form, field2: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating…" : "Generate →"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Your result</h2>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1 rounded-md"
              >
                Copy
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm leading-relaxed whitespace-pre-wrap">
              {result}
            </div>

            {/* Upsell — only show after result */}
            <div className="mt-6 bg-gray-900 text-white rounded-xl p-6">
              <p className="font-semibold mb-1">Want unlimited [outputs]?</p>
              <p className="text-gray-400 text-sm mb-4">
                Upgrade for $X/mo and get [paid features].
              </p>
              <button
                onClick={() => window.location.href = "/api/checkout"}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Upgrade — $X/mo
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
