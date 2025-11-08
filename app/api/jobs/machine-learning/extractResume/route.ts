import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as any));
    // basic placeholder extraction: if `text` provided, return a short summary sample
    const text: string | undefined = typeof body?.text === "string" ? body.text : undefined;

    const extracted = text
      ? {
          summary: text.slice(0, 300), // lightweight placeholder summary
          length: text.length,
        }
      : {};

    return NextResponse.json({ ok: true, extracted });
  } catch (error) {
    // keep a console error to aid debugging on build/runtime
    // eslint-disable-next-line no-console
    console.error("extractResume route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
