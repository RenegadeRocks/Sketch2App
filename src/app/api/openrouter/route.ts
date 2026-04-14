export const runtime = "edge";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await req.text();
  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: auth,
      "content-type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://sketch2app.local",
      "X-Title": "Sketch2App",
    },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
