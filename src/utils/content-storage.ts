import "server-only";
import { randomUUID } from "node:crypto";
import { BlobNotFoundError, get, head, list, put } from "@vercel/blob";

export type ContentItem = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
};
export type ContentPage = { items: ContentItem[]; cursor?: string };

function nameFromId(id: string): string | null {
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}--[A-Za-z0-9_-]{1,320}$/.test(
      id,
    )
  )
    return null;
  const encoded = id.slice(38);
  const bytes = Buffer.from(encoded, "base64url");
  if (bytes.toString("base64url") !== encoded) return null;
  let name: string;
  try {
    name = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
  return /^[^/\\]+\.html?$/i.test(name) && !/[\u0000-\u001f\u007f]/.test(name)
    ? name
    : null;
}

function itemFromBlob(blob: {
  pathname: string;
  size: number;
  uploadedAt: Date;
}): ContentItem | null {
  if (!blob.pathname.startsWith("content/")) return null;
  // Retain the store's preexisting UUID/filename layout without rewriting objects.
  const existing = /^content\/([a-f0-9-]{36})\/([^/]+)$/.exec(blob.pathname);
  const id = existing
    ? `${existing[1]}--${Buffer.from(existing[2]).toString("base64url")}`
    : blob.pathname.endsWith(".html")
      ? blob.pathname.slice(8, -5)
      : "";
  const name = nameFromId(id);
  return name
    ? { id, name, size: blob.size, uploadedAt: blob.uploadedAt.toISOString() }
    : null;
}

export async function saveContent(
  name: string,
  html: string,
): Promise<ContentItem> {
  const id = `${randomUUID()}--${Buffer.from(name).toString("base64url")}`;
  await put(`content/${id}.html`, html, {
    access: "private",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
  return {
    id,
    name,
    size: Buffer.byteLength(html),
    uploadedAt: new Date().toISOString(),
  };
}

export async function listContent(cursor?: string): Promise<ContentPage> {
  const page = await list({ prefix: "content/", limit: 24, cursor });
  const items = page.blobs.flatMap((blob) => {
    const item = itemFromBlob(blob);
    return item ? [item] : [];
  });
  return {
    items,
    ...(page.hasMore && page.cursor ? { cursor: page.cursor } : {}),
  };
}

export async function searchContent(query: string): Promise<ContentItem[]> {
  const term = query.toLowerCase();
  const items: ContentItem[] = [];
  let cursor: string | undefined;
  do {
    const page = await listContent(cursor);
    items.push(
      ...page.items.filter((item) => item.name.toLowerCase().includes(term)),
    );
    cursor = page.cursor;
  } while (cursor);
  return items;
}

export async function readContent(
  id: string,
): Promise<ReadableStream<Uint8Array> | null> {
  const name = nameFromId(id);
  if (!name) return null;
  const result =
    (await get(`content/${id}.html`, { access: "private", useCache: false })) ??
    (await get(`content/${id.slice(0, 36)}/${name}`, {
      access: "private",
      useCache: false,
    }));
  return result?.statusCode === 200 ? result.stream : null;
}

export async function contentInfo(id: string): Promise<ContentItem | null> {
  const name = nameFromId(id);
  if (!name) return null;
  try {
    return itemFromBlob(await head(`content/${id}.html`));
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
  }
  try {
    return itemFromBlob(await head(`content/${id.slice(0, 36)}/${name}`));
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}
