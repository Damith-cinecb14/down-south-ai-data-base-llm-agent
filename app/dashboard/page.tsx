import type { Metadata } from "next";
import { requireAppUser } from "../auth";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Service Command | Down South Region",
  description: "Hospital equipment, service agreements, and database intelligence.",
};

export default async function DashboardPage() {
  const user = await requireAppUser();
  return <DashboardClient user={user} />;
}
