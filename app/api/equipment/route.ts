import { getAppUser } from "../../auth";
import type { Equipment } from "../../types";

type EquipmentPayload = {
  id?: number;
  hospital_id?: number;
  name?: string;
  model?: string | null;
  serial_number?: string | null;
  status?: string | null;
};

function configuredBackendBase() {
  const base = process.env.BACKEND_API_URL;
  if (!base) return null;
  const hostname = new URL(base).hostname;
  if (process.env.NODE_ENV === "production" && ["127.0.0.1", "localhost", "::1"].includes(hostname)) return null;
  return base.endsWith("/") ? base : `${base}/`;
}

async function proxyEquipment(request: Request, method: "POST" | "PATCH") {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const backend = configuredBackendBase();
  if (!backend) {
    return Response.json(
      { error: "Equipment editing requires a live FastAPI backend connection." },
      { status: 503 },
    );
  }

  const payload = (await request.json().catch(() => null)) as EquipmentPayload | null;
  const name = payload?.name?.trim();
  if (!payload?.hospital_id || !Number.isInteger(payload.hospital_id)) {
    return Response.json({ error: "Select a valid hospital." }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return Response.json({ error: "Equipment name must contain at least 2 characters." }, { status: 400 });
  }
  if (method === "PATCH" && (!payload?.id || !Number.isInteger(payload.id))) {
    return Response.json({ error: "A valid equipment ID is required." }, { status: 400 });
  }

  const body = {
    hospital_id: payload.hospital_id,
    name,
    model: payload.model?.trim() || null,
    serial_number: payload.serial_number?.trim() || null,
    status: payload.status?.trim() || null,
  };
  const path = method === "POST" ? "equipments/" : `equipments/${payload.id}`;

  try {
    const backendResponse = await fetch(new URL(path, backend), {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await backendResponse.json().catch(() => null)) as Equipment | { detail?: string } | null;
    if (!backendResponse.ok) {
      const detail = result && "detail" in result ? result.detail : null;
      return Response.json({ error: detail ?? "Unable to save equipment details." }, { status: backendResponse.status });
    }
    return Response.json(result, { status: method === "POST" ? 201 : 200 });
  } catch {
    return Response.json({ error: "The live equipment database is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  return proxyEquipment(request, "POST");
}

export async function PATCH(request: Request) {
  return proxyEquipment(request, "PATCH");
}
