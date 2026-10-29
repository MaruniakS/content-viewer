import {
  listContent,
  saveContent,
  searchContent,
} from "@/utils/content-storage";
import { validateHtmlUpload } from "@/utils/upload-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 1_048_576 + 16_384;
function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return json({ error: "Upload from this website to continue." }, 403);
  const type = request.headers.get("content-type") ?? "";
  if (!/^multipart\/form-data\s*;/i.test(type))
    return json({ error: "Send one HTML file using the upload form." }, 415);
  if (Number(request.headers.get("content-length")) > MAX_REQUEST_BYTES)
    return json({ error: "The upload request is too large." }, 413);

  let file: File;
  try {
    if (!request.body) return json({ error: "Choose one HTML file." }, 400);
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return json({ error: "The upload request is too large." }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const form = await new Request(request.url, {
      method: "POST",
      headers: { "content-type": type },
      body: bytes.buffer,
    }).formData();
    const entries = [...form.entries()];
    if (
      entries.length !== 1 ||
      entries[0][0] !== "file" ||
      !(entries[0][1] instanceof File)
    )
      return json({ error: "Choose exactly one HTML file." }, 400);
    file = entries[0][1];
  } catch {
    return json(
      { error: "The upload could not be read. Choose the file and try again." },
      400,
    );
  }

  const result = validateHtmlUpload({
    name: file.name,
    type: file.type,
    bytes: new Uint8Array(await file.arrayBuffer()),
  });
  if (!result.ok) return json({ error: result.message }, result.status);
  try {
    return json({ item: await saveContent(file.name, result.html) }, 201);
  } catch {
    return json(
      { error: "The file could not be saved. Please try again." },
      503,
    );
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor") ?? undefined;
  const query = params.get("q")?.trim();
  if (query && query.length > 240)
    return json({ error: "Search using 240 characters or fewer." }, 400);
  if (cursor && (cursor.length > 2048 || /[\u0000-\u001f\u007f]/.test(cursor)))
    return json({ error: "Invalid gallery page." }, 400);
  try {
    return json(
      query ? { items: await searchContent(query) } : await listContent(cursor),
    );
  } catch {
    return json(
      { error: "The gallery is unavailable. Please try again." },
      503,
    );
  }
}
