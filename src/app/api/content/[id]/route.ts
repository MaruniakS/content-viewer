import { readContent } from "@/utils/content-storage";
import { VIEWER_HEADERS } from "@/utils/viewer-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/content/[id]">,
) {
  const { id } = await context.params;
  try {
    const stream = await readContent(id);
    return new Response(stream ?? "Content not found.", {
      status: stream ? 200 : 404,
      headers: VIEWER_HEADERS,
    });
  } catch {
    return new Response(
      "This content is unavailable. Please reload to try again.",
      { status: 503, headers: VIEWER_HEADERS },
    );
  }
}
