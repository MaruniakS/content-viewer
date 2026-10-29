import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Viewer — Your team’s shared shelf",
  description: "Upload, explore, and share interactive HTML with your team.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-10">
            <Link
              href="/"
              className="flex items-center gap-3 text-lg font-semibold tracking-tight"
            >
              <svg
                aria-hidden="true"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M3 4h9v9H3zM16 4h9v9h-9zM3 17h22v7H3z"
                  fill="#1d4ed8"
                />
              </svg>
              Content Viewer
            </Link>
            <span className="text-sm text-slate-500">
              Your team’s shared shelf
            </span>
          </div>
        </header>
        {children}
        <footer className="mt-auto">
          <div className="mx-auto max-w-7xl px-5 py-8 text-xs text-slate-500 sm:px-10">
            Built for ideas you can interact with.
          </div>
        </footer>
      </body>
    </html>
  );
}
