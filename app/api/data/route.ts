import { getAppUser } from "../../auth";
import type { DashboardData } from "../../types";

function backendUrl(path: string) {
  const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
  return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
}

async function backendJson<T>(path: string): Promise<T> {
  const response = await fetch(backendUrl(path), { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function GET() {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [hospitals, equipment, services, agreements] = await Promise.all([
      backendJson<DashboardData["hospitals"]>("/hospitals/?limit=100"),
      backendJson<DashboardData["equipment"]>("/equipments/?limit=500"),
      backendJson<DashboardData["services"]>("/services/?limit=500"),
      backendJson<DashboardData["agreements"]>("/agreements/?limit=500"),
    ]);
    return Response.json({ connected: true, hospitals, equipment, services, agreements } satisfies DashboardData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend unavailable";
    return Response.json({ error: message }, { status: 502 });
  }
}
