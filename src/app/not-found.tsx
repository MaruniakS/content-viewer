import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-10">
      <h1 className="text-3xl font-semibold">This shelf is empty.</h1>
      <p className="mt-4 text-slate-600">
        That content couldn’t be found. Check the link or explore the
        collection.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block font-semibold text-blue-700 underline underline-offset-4"
      >
        Back to the collection
      </Link>
    </main>
  );
}
