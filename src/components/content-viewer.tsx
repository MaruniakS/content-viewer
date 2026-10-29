"use client";

import { useState } from "react";
import { VIEWER_SANDBOX } from "@/utils/viewer-policy";

export function ContentViewer({ id, name }: { id: string; name: string }) {
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [shareStatus, setShareStatus] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Copy this page’s address to share it.");
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500" role="status">
          {loaded ? "Ready to explore" : "Loading content…"}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <button
            onClick={() => {
              setLoaded(false);
              setAttempt(attempt + 1);
            }}
            className="font-medium text-slate-600 hover:text-blue-700"
          >
            Reload content
          </button>
          <button
            onClick={copyLink}
            className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          >
            Copy share link
          </button>
          <span role="status" className="text-slate-600">
            {shareStatus}
          </span>
        </div>
      </div>
      <iframe
        key={attempt}
        src={`/api/content/${id}`}
        sandbox={VIEWER_SANDBOX}
        referrerPolicy="no-referrer"
        title={`Interactive content: ${name}`}
        onLoad={() => setLoaded(true)}
        className="h-[72vh] min-h-[420px] w-full rounded-xl border border-slate-200 bg-white"
      />
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Interactive HTML runs in an isolated viewer. External resources and
        browser storage are unavailable.
      </p>
    </>
  );
}
