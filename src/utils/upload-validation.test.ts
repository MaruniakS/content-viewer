import { describe, expect, it } from "vitest";
import { validateHtmlUpload } from "./upload-validation";

const html = '<!doctype html><button onclick="this.textContent++">0</button>';
const bytes = new TextEncoder().encode(html);

describe("validateHtmlUpload", () => {
  it.each([
    ["counter.html", "text/html"],
    ["counter.htm", "text/html"],
    ["COUNTER.HTML", "text/html"],
    ["counter.html", ""],
    ["counter.html", "text/html; charset=utf-8"],
  ])("accepts %s with MIME %s and preserves interactive HTML", (name, type) => {
    expect(validateHtmlUpload({ name, type, bytes })).toEqual({ ok: true, html });
  });

  it("preserves Unicode text and surrounding whitespace", () => {
    const content = "\n<p>Привіт 🌍</p>\n";
    expect(
      validateHtmlUpload({
        name: "привіт.html",
        type: "text/html",
        bytes: new TextEncoder().encode(content),
      }),
    ).toEqual({ ok: true, html: content });
  });

  it.each(["", "\n\t  ", "\ufeff"])("rejects empty text %j", (content) => {
    expect(
      validateHtmlUpload({
        name: "empty.html",
        type: "text/html",
        bytes: new TextEncoder().encode(content),
      }),
    ).toMatchObject({ ok: false, status: 400 });
  });

  it.each(["", ".html", "counter.txt", "counter.html.exe", "counter.html ", "../counter.html", "folder\\counter.html"])(
    "rejects an invalid HTML filename %j even with an HTML MIME type",
    (name) => {
      expect(validateHtmlUpload({ name, type: "text/html", bytes })).toMatchObject({
        ok: false,
        status: 415,
      });
    },
  );

  it.each(["text/plain", "image/png", "application/octet-stream"])(
    "rejects a contradictory MIME type %s even with an HTML extension",
    (type) => {
      expect(validateHtmlUpload({ name: "counter.html", type, bytes })).toMatchObject({
        ok: false,
        status: 415,
      });
    },
  );

  it.each([
    ["invalid UTF-8 continuation", [0xc3, 0x28]],
    ["truncated UTF-8", [0xe2, 0x82]],
    ["UTF-16 bytes", [0xff, 0xfe, 0x3c, 0]],
    ["NUL in otherwise valid UTF-8", [0x3c, 0x70, 0x3e, 0]],
    ["binary control byte", [0x3c, 0x70, 0x3e, 0x01]],
  ])("rejects %s", (_label, data) => {
    expect(
      validateHtmlUpload({ name: "invalid.html", type: "text/html", bytes: new Uint8Array(data) }),
    ).toMatchObject({ ok: false, status: 400 });
  });

  it("accepts exactly 1 MiB of UTF-8 bytes", () => {
    const content = "é".repeat(524_288);
    expect(
      validateHtmlUpload({
        name: "limit.html",
        type: "text/html",
        bytes: new TextEncoder().encode(content),
      }),
    ).toEqual({ ok: true, html: content });
  });

  it("rejects one byte over 1 MiB even when the character count is smaller", () => {
    expect(
      validateHtmlUpload({
        name: "too-large.html",
        type: "text/html",
        bytes: new TextEncoder().encode("é".repeat(524_288) + "!"),
      }),
    ).toMatchObject({ ok: false, status: 413 });
  });
});
