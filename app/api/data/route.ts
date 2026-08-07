import { getAppUser } from "../../auth";
import { hostedSnapshot } from "../../data/hosted-snapshot";
import type { DashboardData } from "../../types";

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

function snapshotData(reason: string): DashboardData {
  return {
    ...hostedSnapshot,
    source: "snapshot",
    warning: reason,
  };
}

async function backendJson<T>(path: string): Promise<T> {
  const response = await fetch(backendUrl(path), { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function GET() {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!configuredBackendBase()) {
    return Response.json(snapshotData("Showing the latest verified database snapshot. Live updates require a hosted FastAPI URL."));
  }

  try {
    const [hospitals, equipment, services, agreements] = await Promise.all([
      backendJson<DashboardData["hospitals"]>("/hospitals/?limit=100"),
      backendJson<DashboardData["equipment"]>("/equipments/?limit=500"),
      backendJson<DashboardData["services"]>("/services/?limit=500"),
      backendJson<DashboardData["agreements"]>("/agreements/?limit=500"),
    ]);
    return Response.json({ connected: true, source: "live", hospitals, equipment, services, agreements } satisfies DashboardData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend unavailable";
    console.warn("Using hosted database snapshot:", message);
    return Response.json(snapshotData("Live database connection is temporarily unavailable. Showing the latest verified snapshot."));
  }
}
