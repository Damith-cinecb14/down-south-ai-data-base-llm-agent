import { getAppUser } from "../../auth";
import type { ServiceAgreement } from "../../types";

type AgreementPayload = {
  id?: number;
  agreement_start_date?: string | null;
  agreement_end_date?: string | null;
};

function configuredBackendBase() {
  const base = process.env.BACKEND_API_URL;
  if (!base) return null;
  const hostname = new URL(base).hostname;
  if (process.env.NODE_ENV === "production" && ["127.0.0.1", "localhost", "::1"].includes(hostname)) return null;
  return base.endsWith("/") ? base : `${base}/`;
}

function normalizedDate(value: string | null | undefined) {
  const date = value?.trim();
  return date || null;
}

export async function PATCH(request: Request) {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const backend = configuredBackendBase();
  if (!backend) {
    return Response.json(
      { error: "Coverage editing requires a live FastAPI backend connection." },
      { status: 503 },
    );
  }

  const payload = (await request.json().catch(() => null)) as AgreementPayload | null;
  if (!payload?.id || !Number.isInteger(payload.id)) {
    return Response.json({ error: "A valid service agreement ID is required." }, { status: 400 });
  }

  const startDate = normalizedDate(payload.agreement_start_date);
  const endDate = normalizedDate(payload.agreement_end_date);
  if (Boolean(startDate) !== Boolean(endDate)) {
    return Response.json({ error: "Enter both coverage dates or clear both dates." }, { status: 400 });
  }
  if (startDate && endDate && endDate < startDate) {
    return Response.json({ error: "Coverage end date cannot be before the start date." }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(new URL(`agreements/${payload.id}`, backend), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agreement_start_date: startDate,
        agreement_end_date: endDate,
      }),
    });
    const result = (await backendResponse.json().catch(() => null)) as ServiceAgreement | { detail?: string } | null;
    if (!backendResponse.ok) {
      const detail = result && "detail" in result ? result.detail : null;
      return Response.json(
        { error: detail ?? "Unable to update the coverage period." },
        { status: backendResponse.status },
      );
    }
    return Response.json(result);
  } catch {
    return Response.json({ error: "The live service-agreement database is unavailable." }, { status: 503 });
  }
}
