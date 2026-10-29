"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function UploadForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState<{ id: string; name: string } | null>(
    null,
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setUploaded(null);
    setPending(true);
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        body: new FormData(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(
          result.error ?? "The file could not be saved. Please try again.",
        );
        return;
      }
      setUploaded(result.item);
      form.reset();
      router.refresh();
    } catch {
      setError(
        "The upload couldn’t reach the server. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6"
      aria-describedby="upload-help"
      aria-busy={pending}
    >
      <label htmlFor="html-file" className="mb-2 block text-sm font-medium">
        HTML file
      </label>
      <input
        id="html-file"
        name="file"
        type="file"
        accept=".html,.htm,text/html"
        required
        disabled={pending}
        className="block w-full min-w-0 rounded-lg border border-blue-200 bg-white p-2 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-medium file:text-slate-800"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload HTML"}
      </button>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800"
        >
          {error}
        </p>
      )}
      {uploaded && (
        <div
          role="status"
          className="mt-4 rounded-lg bg-white p-3 text-sm leading-6 text-slate-700"
        >
          <p className="break-words">Uploaded {uploaded.name}.</p>
          <Link
            href={`/view/${uploaded.id}`}
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            Open your content
          </Link>
        </div>
      )}
    </form>
  );
}
