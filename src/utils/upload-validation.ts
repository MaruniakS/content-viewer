type HtmlUpload = {
  name: string;
  type: string;
  bytes: Uint8Array;
};

type UploadValidationResult =
  | { ok: true; html: string }
  | { ok: false; status: 400 | 413 | 415; message: string };

export function validateHtmlUpload(upload: HtmlUpload): UploadValidationResult {
  const { name, type, bytes } = upload;

  if (bytes.byteLength > 1_048_576) {
    return { ok: false, status: 413, message: "HTML files must be 1 MiB or smaller." };
  }

  const mime = type.split(";", 1)[0].trim().toLowerCase();
  if (!/^[^/\\]+\.html?$/i.test(name) || (mime !== "" && mime !== "text/html")) {
    return { ok: false, status: 415, message: "Choose an .html or .htm file with an HTML content type." };
  }

  let html: string;
  try {
    html = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, status: 400, message: "The HTML file must contain valid UTF-8 text." };
  }

  if (html.trim().length === 0) {
    return { ok: false, status: 400, message: "The HTML file must not be empty." };
  }

  // Permit HTML whitespace, but reject NUL and other binary control bytes.
  if (bytes.some((byte) => byte < 32 && byte !== 9 && byte !== 10 && byte !== 12 && byte !== 13)) {
    return { ok: false, status: 400, message: "The HTML file must contain text, not binary data." };
  }

  return { ok: true, html };
}
