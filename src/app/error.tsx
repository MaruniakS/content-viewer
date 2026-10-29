"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-10">
      <h1 className="text-2xl font-semibold">This page couldn’t load</h1>
      <p className="mt-3 text-slate-600">
        The content service may be temporarily unavailable.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
      >
        Try again
      </button>
    </main>
  );
}
