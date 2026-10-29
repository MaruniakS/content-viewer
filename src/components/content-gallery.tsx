import Link from "next/link";
import {
  listContent,
  searchContent,
  type ContentPage,
} from "@/utils/content-storage";
import { RefreshButton } from "./refresh-button";

export async function ContentGallery({
  cursor,
  query,
}: {
  cursor?: string;
  query?: string;
}) {
  let page: ContentPage;
  try {
    page = query
      ? { items: await searchContent(query) }
      : await listContent(cursor);
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-100 bg-red-50 p-6"
      >
        <h3 className="font-semibold">The collection couldn’t load</h3>
        <p className="mb-4 mt-2 text-sm text-slate-600">
          Please refresh to try again. Your uploaded work stays saved.
        </p>
        <RefreshButton>Try again</RefreshButton>
      </div>
    );
  }
  return (
    <>
      {query && (
        <p className="mb-4 mt-4 text-sm text-slate-600">
          {page.items.length} {page.items.length === 1 ? "match" : "matches"}{" "}
          for “{query}” across the collection.{" "}
          <Link
            href="/"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            Clear search
          </Link>
        </p>
      )}
      {page.items.length ? (
        <ul className="divide-y divide-slate-200">
          {page.items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/view/${item.id}`}
                prefetch={false}
                className="group flex items-center gap-4 rounded-lg px-2 py-6 hover:bg-blue-50/60 sm:gap-5"
              >
                <span
                  aria-hidden="true"
                  className="flex h-12 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-700"
                >
                  &lt;/&gt;
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-semibold group-hover:text-blue-700">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(item.uploadedAt))}
                    <span className="mx-2" aria-hidden="true">
                      /
                    </span>
                    {Math.max(1, Math.ceil(item.size / 1024))} KB
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-blue-700">
                  Open<span className="sr-only"> {item.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : query ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center">
          <h3 className="text-lg font-semibold">No matching filenames</h3>
          <p className="mt-3 text-sm text-slate-600">
            Try a different word or clear your search to see everything.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center">
          <h3 className="text-lg font-semibold">
            Make room for the first idea.
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Upload a visualization, a mini-tool, or an experiment. It’ll be here
            for everyone to explore.
          </p>
          <a
            href="/examples/counter.html"
            download
            className="mt-5 inline-block text-sm font-semibold text-blue-700 underline underline-offset-4"
          >
            Download an example to try
          </a>
        </div>
      )}
      {(page.cursor || cursor) && (
        <nav
          aria-label="Collection pages"
          className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-6"
        >
          <Link href="/" className="text-sm font-medium text-slate-600">
            Back to first page
          </Link>
          {page.cursor && (
            <Link
              href={`/?cursor=${encodeURIComponent(page.cursor)}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Next page
            </Link>
          )}
        </nav>
      )}
      <p className="mt-6 text-xs text-slate-500">
        A little HTML. A lot of possibility.
      </p>
    </>
  );
}
