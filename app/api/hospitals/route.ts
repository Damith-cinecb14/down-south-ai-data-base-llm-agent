import { getAppUser } from "../../auth";
import type { Hospital } from "../../types";

type HospitalPayload = {
  id?: number;
  name?: string;
  address?: string | null;
  email?: string | null;
  telephone?: string | null;
};

function configuredBackendBase() {
  const base = process.env.BACKEND_API_URL;
  if (!base) return null;
  const hostname = new URL(base).hostname;
  if (process.env.NODE_ENV === "production" && ["127.0.0.1", "localhost", "::1"].includes(hostname)) return null;
  return base.endsWith("/") ? base : `${base}/`;
}

async function proxyHospital(request: Request, method: "POST" | "PATCH") {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const backend = configuredBackendBase();
  if (!backend) {
    return Response.json(
      { error: "Hospital editing requires a live FastAPI backend connection." },
      { status: 503 },
    );
  }

  const payload = (await request.json().catch(() => null)) as HospitalPayload | null;
  const name = payload?.name?.trim();
  if (method === "POST" && (!name || name.length < 3)) {
    return Response.json({ error: "Hospital name must contain at least 3 characters." }, { status: 400 });
  }
  if (method === "PATCH" && (!payload?.id || !Number.isInteger(payload.id))) {
    return Response.json({ error: "A valid hospital ID is required." }, { status: 400 });
  }

  const body = {
    ...(name ? { name } : {}),
    address: payload?.address?.trim() || null,
    email: payload?.email?.trim() || null,
    telephone: payload?.telephone?.trim() || null,
  };
  const path = method === "POST" ? "hospitals/" : `hospitals/${payload?.id}`;

  try {
    const backendResponse = await fetch(new URL(path, backend), {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await backendResponse.json().catch(() => null)) as Hospital | { detail?: string } | null;
    if (!backendResponse.ok) {
      const detail = result && "detail" in result ? result.detail : null;
      return Response.json({ error: detail ?? "Unable to save hospital details." }, { status: backendResponse.status });
    }
    return Response.json(result, { status: method === "POST" ? 201 : 200 });
  } catch {
    return Response.json({ error: "The live hospital database is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  return proxyHospital(request, "POST");
}

export async function PATCH(request: Request) {
  return proxyHospital(request, "PATCH");
}
