import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlobNotFoundError, get, head, list, put } from "@vercel/blob";
import { GET as catalog, POST } from "../app/api/content/route";
import { GET as raw } from "../app/api/content/[id]/route";
import { contentInfo, listContent, saveContent } from "./content-storage";

vi.mock("server-only", () => ({}));
vi.mock("@vercel/blob", async (original) => ({
  ...(await original<typeof import("@vercel/blob")>()),
  put: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  head: vi.fn(),
}));

const html = '<!doctype html><button onclick="this.textContent++">0</button>';
const id = "b6f93d27-4716-40cd-95b4-3ba65898dd21--Y291bnRlci5odG1s";
const pathname = `content/${id}.html`;
const blob = {
  url: `https://test.private.blob.vercel-storage.com/${pathname}`,
  downloadUrl: `https://test.private.blob.vercel-storage.com/${pathname}?download=1`,
  pathname,
  size: html.length,
  uploadedAt: new Date("2026-10-29T12:00:00Z"),
  etag: '"abc"',
};

function upload(
  name = "counter.html",
  content: string | Uint8Array = html,
  type = "text/html",
) {
  const form = new FormData();
  form.append(
    "file",
    new File(
      [typeof content === "string" ? content : new Uint8Array(content).buffer],
      name,
      { type },
    ),
  );
  return new Request("https://gallery.test/api/content", {
    method: "POST",
    body: form,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(put).mockImplementation(async (key) => ({
    ...blob,
    pathname: key,
    contentType: "text/html",
    contentDisposition: "inline",
  }));
  vi.mocked(list).mockResolvedValue({ blobs: [blob], hasMore: false });
  vi.mocked(get).mockResolvedValue({
    statusCode: 200,
    stream: new Blob([html]).stream(),
    headers: new Headers(),
    blob: {
      ...blob,
      contentType: "text/html",
      contentDisposition: "inline",
      cacheControl: "no-store",
    },
  });
  vi.mocked(head).mockResolvedValue({
    ...blob,
    contentType: "text/html",
    contentDisposition: "inline",
    cacheControl: "no-store",
  });
});

describe("upload HTTP boundary (only Blob SDK mocked)", () => {
  it("confirms a private durable write and returns only application metadata", async () => {
    const response = await POST(upload());
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      item: { name: "counter.html", size: html.length },
    });
    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^content\/[a-f0-9-]+--Y291bnRlci5odG1s\.html$/),
      html,
      expect.objectContaining({
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
      }),
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it.each([
    ["empty.html", "", "text/html", 400],
    ["wrong.txt", html, "text/plain", 415],
    ["wrong.html", html, "image/png", 415],
    ["large.html", "x".repeat(1_048_577), "text/html", 413],
    ["binary.html", new Uint8Array([0xff, 0xfe]), "text/html", 400],
    ["control\u0001.html", html, "text/html", 415],
    ["x".repeat(241) + ".html", html, "text/html", 415],
  ])(
    "rejects invalid file %s before storage",
    async (name, content, type, status) => {
      const response = await POST(upload(name, content, type));
      expect(response.status).toBe(status);
      expect(put).not.toHaveBeenCalled();
    },
  );

  it("rejects absent or multiple files and unexpected fields", async () => {
    for (const kind of ["missing", "multiple", "unexpected"]) {
      const form = new FormData();
      if (kind !== "missing")
        form.append("file", new File([html], "ok.html", { type: "text/html" }));
      if (kind === "multiple")
        form.append(
          "file",
          new File([html], "other.html", { type: "text/html" }),
        );
      if (kind === "unexpected") form.append("target", "https://evil.test/");
      expect(
        (
          await POST(
            new Request("https://gallery.test/api/content", {
              method: "POST",
              body: form,
            }),
          )
        ).status,
      ).toBe(400);
    }
    expect(put).not.toHaveBeenCalled();
  });

  it("rejects malformed multipart and unsupported request content types", async () => {
    const malformed = new Request("https://gallery.test/api/content", {
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=abc" },
      body: "broken",
    });
    expect((await POST(malformed)).status).toBe(400);
    expect(
      (
        await POST(
          new Request("https://gallery.test/api/content", {
            method: "POST",
            body: "html",
          }),
        )
      ).status,
    ).toBe(415);
    expect(put).not.toHaveBeenCalled();
  });

  it("bounds the actual streamed request even without Content-Length", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(1_100_000));
        controller.close();
      },
    });
    const request = new Request("https://gallery.test/api/content", {
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=a" },
      body: stream,
      duplex: "half",
    } as RequestInit);
    expect((await POST(request)).status).toBe(413);
    expect(put).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin browser upload", async () => {
    const request = upload();
    request.headers.set("origin", "null");
    expect((await POST(request)).status).toBe(403);
    expect(put).not.toHaveBeenCalled();
  });

  it("does not report success or disclose credentials on a failed write", async () => {
    vi.mocked(put).mockRejectedValue(new Error("secret-token-from-provider"));
    const response = await POST(upload());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret-token");
  });

  it("assigns duplicate filenames independent keys while preserving Unicode names", async () => {
    const first = await saveContent("привіт.html", "<p>one</p>");
    const second = await saveContent("привіт.html", "<p>two</p>");
    expect(first.id).not.toBe(second.id);
    expect(first.name).toBe("привіт.html");
    expect(vi.mocked(put).mock.calls[0][1]).toBe("<p>one</p>");
    expect(vi.mocked(put).mock.calls[1][1]).toBe("<p>two</p>");
  });
});

describe("catalog pagination and failure boundaries", () => {
  it("searches filenames beyond the first page with case-insensitive matching", async () => {
    vi.mocked(list)
      .mockResolvedValueOnce({
        blobs: [
          {
            ...blob,
            pathname:
              "content/b6f93d27-4716-40cd-95b4-3ba65898dd21--b3RoZXIuaHRtbA.html",
          },
        ],
        hasMore: true,
        cursor: "page-two",
      })
      .mockResolvedValueOnce({ blobs: [blob], hasMore: false });
    const response = await catalog(
      new Request("https://gallery.test/api/content?q=COUNTER"),
    );
    expect(await response.json()).toEqual({
      items: [
        {
          id,
          name: "counter.html",
          size: html.length,
          uploadedAt: "2026-10-29T12:00:00.000Z",
        },
      ],
    });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: "page-two" }),
    );
  });

  it("returns no search matches instead of unrelated content", async () => {
    const response = await catalog(
      new Request("https://gallery.test/api/content?q=absent"),
    );
    expect(await response.json()).toEqual({ items: [] });
  });

  it("exposes the next cursor without leaking storage URLs", async () => {
    vi.mocked(list).mockResolvedValue({
      blobs: [blob],
      hasMore: true,
      cursor: "page-two",
    });
    const response = await catalog(
      new Request("https://gallery.test/api/content"),
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.cursor).toBe("page-two");
    expect(data.items[0]).toEqual({
      id,
      name: "counter.html",
      size: html.length,
      uploadedAt: "2026-10-29T12:00:00.000Z",
    });
    expect(JSON.stringify(data)).not.toContain("blob.vercel-storage");
  });

  it("passes the supplied cursor to the next storage page", async () => {
    await listContent("page-two");
    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        prefix: "content/",
        cursor: "page-two",
        limit: 24,
      }),
    );
  });

  it("returns an empty page correctly", async () => {
    vi.mocked(list).mockResolvedValue({ blobs: [], hasMore: false });
    expect(await listContent()).toEqual({ items: [] });
  });

  it("keeps existing UUID/filename objects discoverable without migrating their bytes", async () => {
    vi.mocked(list).mockResolvedValue({
      blobs: [
        {
          ...blob,
          pathname: "content/b6f93d27-4716-40cd-95b4-3ba65898dd21/counter.html",
        },
      ],
      hasMore: false,
    });
    expect((await listContent()).items[0]).toMatchObject({
      id,
      name: "counter.html",
    });
  });

  it("returns safe storage errors and rejects unreasonable cursors", async () => {
    vi.mocked(list).mockRejectedValue(new Error("secret-token"));
    const response = await catalog(
      new Request("https://gallery.test/api/content"),
    );
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret-token");
    expect(
      (
        await catalog(
          new Request(
            `https://gallery.test/api/content?cursor=${"a".repeat(2049)}`,
          ),
        )
      ).status,
    ).toBe(400);
  });
});

describe("raw HTML response isolation", () => {
  it("streams HTML with an enforced opaque-origin sandbox, blocked network and no cache", async () => {
    const response = await raw(
      new Request("https://gallery.test/api/content/" + id),
      { params: Promise.resolve({ id }) },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(html);
    const csp = response.headers.get("content-security-policy")!;
    expect(csp).toContain("sandbox allow-scripts;");
    expect(csp).not.toMatch(/allow-same-origin|unsafe-eval|https?:/);
    for (const directive of [
      "default-src 'none'",
      "connect-src 'none'",
      "frame-src 'none'",
      "form-action 'none'",
      "base-uri 'none'",
      "frame-ancestors 'self'",
    ])
      expect(csp).toContain(directive);
    expect(response.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(get).toHaveBeenCalledWith(pathname, {
      access: "private",
      useCache: false,
    });
  });

  it.each([
    "missing",
    "../secret.html",
    "https://evil.test/x",
    "b6f93d27-4716-40cd-95b4-3ba65898dd21--Li4vYS5odG1s",
  ])(
    "rejects invalid content identifier %s without storage access",
    async (invalid) => {
      const response = await raw(new Request("https://gallery.test"), {
        params: Promise.resolve({ id: invalid }),
      });
      expect(response.status).toBe(404);
      expect(get).not.toHaveBeenCalled();
    },
  );

  it("returns 404 for missing objects and 503 for safe storage failures", async () => {
    vi.mocked(get).mockResolvedValue(null);
    expect(
      (
        await raw(new Request("https://gallery.test"), {
          params: Promise.resolve({ id }),
        })
      ).status,
    ).toBe(404);
    vi.mocked(get).mockRejectedValue(new Error("secret-token"));
    const response = await raw(new Request("https://gallery.test"), {
      params: Promise.resolve({ id }),
    });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret-token");
  });

  it("distinguishes a missing viewer item from a provider outage", async () => {
    vi.mocked(head).mockRejectedValue(new BlobNotFoundError());
    expect(await contentInfo(id)).toBeNull();
    vi.mocked(head).mockRejectedValue(new Error("offline"));
    await expect(contentInfo(id)).rejects.toThrow();
  });

  it("reads existing UUID/filename objects when the canonical key is absent", async () => {
    vi.mocked(get)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        statusCode: 200,
        stream: new Blob([html]).stream(),
        headers: new Headers(),
        blob: {
          ...blob,
          contentType: "text/html",
          contentDisposition: "inline",
          cacheControl: "no-store",
        },
      });
    const response = await raw(new Request("https://gallery.test"), {
      params: Promise.resolve({ id }),
    });
    expect(await response.text()).toBe(html);
    expect(get).toHaveBeenLastCalledWith(
      "content/b6f93d27-4716-40cd-95b4-3ba65898dd21/counter.html",
      { access: "private", useCache: false },
    );
  });
});
