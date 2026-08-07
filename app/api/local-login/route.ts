import { createSessionToken, localLoginEnabled, sessionCookie } from "../../auth";

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function POST(request: Request) {
  if (!localLoginEnabled()) {
    return Response.json({ error: "Local sign-in is disabled." }, { status: 404 });
  }

  const payload = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = payload?.email?.trim().toLowerCase() ?? "";
  const password = payload?.password ?? "";
  const expectedEmail = (process.env.LOCAL_LOGIN_EMAIL ?? "").trim().toLowerCase();
  const expectedPassword = process.env.LOCAL_LOGIN_PASSWORD ?? "";

  if (!expectedEmail || !expectedPassword) {
    return Response.json({ error: "Local login is not configured." }, { status: 503 });
  }

  if (!safeEqual(email, expectedEmail) || !safeEqual(password, expectedPassword)) {
    return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const displayName = process.env.LOCAL_LOGIN_NAME ?? "Service Administrator";
  const token = await createSessionToken(email, displayName);
  return Response.json(
    { ok: true },
    { headers: { "set-cookie": sessionCookie(token) } },
  );
}
