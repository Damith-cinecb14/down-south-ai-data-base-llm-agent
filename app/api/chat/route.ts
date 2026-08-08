import { getAppUser } from "../../auth";
import { hostedSnapshot } from "../../data/hosted-snapshot";

function configuredBackendBase() {
  const base = process.env.BACKEND_API_URL;
  if (!base) return null;
  const hostname = new URL(base).hostname;
  if (process.env.NODE_ENV === "production" && ["127.0.0.1", "localhost", "::1"].includes(hostname)) return null;
  return base;
}

function backendUrl(path: string) {
  const base = configuredBackendBase();
  if (!base) throw new Error("No reachable hosted backend URL is configured");
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

function answerFromSnapshot(query: string) {
  const normalized = query.toUpperCase();
  const hospital = hostedSnapshot.hospitals.find((item) => {
    const location = item.name.split("-").at(-1)?.trim() ?? item.name;
    return normalized.includes(item.name) || normalized.includes(location);
  });

  const hospitalName = (hospitalId: number) =>
    hostedSnapshot.hospitals.find((item) => item.id === hospitalId)?.name ?? "Unknown hospital";
  const recorded = (value: string | null | undefined) =>
    value && value.toUpperCase() !== "NA" ? value : "not recorded";
  const equipment = hospital
    ? hostedSnapshot.equipment.filter((item) => item.hospital_id === hospital.id)
    : hostedSnapshot.equipment;

  if (hospital && /EQUIPMENT|DEVICE|ASSET|MACHINE/.test(normalized)) {
    return `${hospital.name} has ${equipment.length} registered equipment items:\n${equipment.map((item) =>
      `• ${item.name} — model: ${recorded(item.model)}; serial: ${recorded(item.serial_number)}; status: ${recorded(item.status)}`,
    ).join("\n")}`;
  }
  if (/HOSPITAL|FACILIT/.test(normalized)) {
    return `There are ${hostedSnapshot.hospitals.length} hospitals in the verified snapshot:\n${hostedSnapshot.hospitals.map((item) =>
      `• ${item.name} — address: ${recorded(item.address)}; email: ${recorded(item.email)}; telephone: ${recorded(item.telephone)}`,
    ).join("\n")}`;
  }
  if (/EQUIPMENT|DEVICE|ASSET|MACHINE/.test(normalized)) {
    if (/SERIAL/.test(normalized)) {
      return `Serial numbers for ${equipment.length} equipment records:\n${equipment.map((item) =>
        `• ${item.name} (${hospitalName(item.hospital_id)}): ${recorded(item.serial_number)}`,
      ).join("\n")}`;
    }
    if (/MODEL/.test(normalized)) {
      return `Models for ${equipment.length} equipment records:\n${equipment.map((item) =>
        `• ${item.name} (${hospitalName(item.hospital_id)}): ${recorded(item.model)}`,
      ).join("\n")}`;
    }
    if (/ALL|DETAIL|INFORMATION|LIST|WHAT|WHICH|NAME/.test(normalized)) {
      return `There are ${equipment.length} equipment records across ${hostedSnapshot.hospitals.length} hospitals:\n${equipment.map((item) =>
        `• ${item.name} — hospital: ${hospitalName(item.hospital_id)}; model: ${recorded(item.model)}; serial: ${recorded(item.serial_number)}; status: ${recorded(item.status)}`,
      ).join("\n")}`;
    }
    return `There are ${equipment.length} equipment records across ${hostedSnapshot.hospitals.length} hospitals.`;
  }
  if (/AGREEMENT|CONTRACT|COVERAGE/.test(normalized)) {
    const scheduled = hostedSnapshot.agreements.filter((item) => item.agreement_start_date && item.agreement_end_date).length;
    return `The verified snapshot contains ${hostedSnapshot.agreements.length} service-agreement records; ${scheduled} include recorded coverage dates.`;
  }
  if (/SERVICE|ENGINEER|MAINTENANCE/.test(normalized)) {
    return `There are ${hostedSnapshot.services.length} recorded service visits in the verified snapshot.`;
  }
  return `I am using the latest verified database snapshot. Ask me for hospital names, equipment totals, equipment at Galle, Matara or Hambantota, service records, or agreement totals.`;
}

function snapshotResponse(query: string, threadId?: string | null) {
  return Response.json({
    query,
    result: answerFromSnapshot(query),
    thread_id: threadId || crypto.randomUUID(),
    source: "snapshot",
  });
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

  if (!configuredBackendBase()) return snapshotResponse(query, payload?.thread_id);

  try {
    const response = await fetch(backendUrl("/agent/query"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, thread_id: payload?.thread_id ?? null }),
    });
    const result = await response.json().catch(() => null) as {
      detail?: string;
      error?: string;
      result?: string;
      thread_id?: string;
    } | null;
    if (!response.ok) {
      return Response.json(
        { error: result?.detail ?? result?.error ?? `The live AI backend returned ${response.status}.` },
        { status: 502 },
      );
    }
    return Response.json({ ...result, source: "live" });
  } catch (error) {
    console.warn("Live AI backend unavailable:", error instanceof Error ? error.message : error);
    return Response.json(
      { error: "The live AI backend is unavailable. Start FastAPI on port 8001 and try again." },
      { status: 503 },
    );
  }
}
