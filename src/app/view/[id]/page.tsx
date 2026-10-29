import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentViewer } from "@/components/content-viewer";
import { contentInfo } from "@/utils/content-storage";

export const dynamic = "force-dynamic";

export default async function ViewPage({ params }: PageProps<"/view/[id]">) {
  const { id } = await params;
  const item = await contentInfo(id);
  if (!item) notFound();
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-10">
      <Link
        href="/"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        Back to the collection
      </Link>
      <h1 className="mb-7 mt-5 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
        {item.name}
      </h1>
      <ContentViewer id={item.id} name={item.name} />
    </main>
  );
}
