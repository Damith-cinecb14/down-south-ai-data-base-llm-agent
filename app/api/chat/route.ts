import { getAppUser } from "../../auth";

function backendUrl(path: string) {
  const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

export async function POST(request: Request) {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as {
    query?: string;
    thread_id?: string | null;
  } | null;
  const query = payload?.query?.trim() ?? "";
  if (!query) return Response.json({ error: "A question is required." }, { status: 400 });

  try {
    const response = await fetch(backendUrl("/agent/query"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, thread_id: payload?.thread_id ?? null }),
    });
    const result = await response.json();
    if (!response.ok) {
      return Response.json({ error: result.detail ?? "The assistant request failed." }, { status: response.status });
    }
    return Response.json(result);
  } catch {
    return Response.json({ error: "The database assistant is currently unavailable." }, { status: 502 });
  }
}
