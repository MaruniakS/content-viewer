import { Suspense } from "react";
import { ContentGallery } from "@/components/content-gallery";
import { UploadForm } from "@/components/upload-form";
import { RefreshButton } from "@/components/refresh-button";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const cursor =
    typeof params.cursor === "string" && params.cursor.length <= 2048
      ? params.cursor
      : undefined;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 240) : "";
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-10 sm:py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Good work deserves a link.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
          A shared shelf for your team’s interactive ideas. Upload an HTML file,
          explore the work, and send it on.
        </p>
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <section aria-labelledby="gallery-heading" className="min-w-0">
          <div className="mb-5 flex items-baseline justify-between border-b border-slate-200 pb-4">
            <h2 id="gallery-heading" className="text-xl font-semibold">
              The collection
            </h2>
            <RefreshButton>Refresh collection</RefreshButton>
          </div>
          <form
            action="/"
            method="get"
            className="mb-3 flex gap-2"
            role="search"
          >
            <label htmlFor="filename-search" className="sr-only">
              Search filenames
            </label>
            <input
              id="filename-search"
              name="q"
              defaultValue={query}
              maxLength={240}
              placeholder="Search filenames"
              type="search"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Search
            </button>
          </form>
          <Suspense
            key={`${cursor ?? "first"}:${query}`}
            fallback={
              <p role="status" className="py-12 text-slate-500">
                Loading the collection…
              </p>
            }
          >
            <ContentGallery cursor={query ? undefined : cursor} query={query} />
          </Suspense>
        </section>
        <aside className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 sm:p-7 lg:sticky lg:top-8">
          <div
            aria-hidden="true"
            className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl text-blue-700 shadow-sm"
          >
            ↥
          </div>
          <h2 className="text-xl font-semibold">Add to the shelf</h2>
          <p id="upload-help" className="mt-3 text-sm leading-6 text-slate-600">
            Choose a self-contained HTML file, up to 1 MiB. Embed scripts,
            styles, and images in the file; external resources won’t load.
          </p>
          <UploadForm />
          <p className="mt-6 border-t border-blue-100 pt-5 text-xs leading-5 text-slate-600">
            Everyone with the link can view and upload. Use demo material
            suitable for sharing.
          </p>
        </aside>
      </div>
    </main>
  );
}
