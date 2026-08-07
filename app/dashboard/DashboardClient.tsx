"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AppUser } from "../auth";
import type { DashboardData, ServiceAgreement } from "../types";

type Section = "overview" | "hospitals" | "equipment" | "agreements" | "assistant";
type ChatMessage = { role: "user" | "assistant"; content: string };
type DataResult = { data: DashboardData; error?: never } | { data?: never; error: string };

const navigation: { id: Section; label: string; mark: string }[] = [
  { id: "overview", label: "Overview", mark: "01" },
  { id: "hospitals", label: "Hospitals", mark: "02" },
  { id: "equipment", label: "Equipment", mark: "03" },
  { id: "agreements", label: "Agreements", mark: "04" },
  { id: "assistant", label: "AI Assistant", mark: "AI" },
];

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function agreementState(agreement: ServiceAgreement) {
  if (!agreement.agreement_start_date || !agreement.agreement_end_date) return "Unscheduled";
  const today = new Date();
  const start = new Date(`${agreement.agreement_start_date}T00:00:00`);
  const end = new Date(`${agreement.agreement_end_date}T23:59:59`);
  if (today < start) return "Upcoming";
  if (today > end) return "Expired";
  const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  return days <= 60 ? "Expiring" : "Active";
}

async function fetchDashboardData(): Promise<DataResult> {
  const response = await fetch("/api/data", { cache: "no-store" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return { error: payload?.error ?? "Unable to connect to the backend." };
  }
  return { data: await response.json() as DashboardData };
}

export function DashboardClient({ user }: { user: AppUser }) {
  const [section, setSection] = useState<Section>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Good day. Ask me about hospitals, equipment, agreements, or service history." },
  ]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await fetchDashboardData();
    if (result.error) setError(result.error);
    if (result.data) setData(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void fetchDashboardData().then((result) => {
      if (!active) return;
      if (result.error) setError(result.error);
      if (result.data) setData(result.data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const equipmentByHospital = useMemo(() => {
    const counts = new Map<number, number>();
    for (const item of data?.equipment ?? []) counts.set(item.hospital_id, (counts.get(item.hospital_id) ?? 0) + 1);
    return counts;
  }, [data]);

  const activeAgreements = data?.agreements.filter((agreement) => ["Active", "Expiring"].includes(agreementState(agreement))).length ?? 0;
  const expiringAgreements = data?.agreements.filter((agreement) => agreementState(agreement) === "Expiring").length ?? 0;
  const query = search.trim().toLowerCase();
  const filteredEquipment = (data?.equipment ?? []).filter((item) => {
    const hospital = data?.hospitals.find((entry) => entry.id === item.hospital_id)?.name ?? "";
    return `${item.name} ${item.model ?? ""} ${hospital}`.toLowerCase().includes(query);
  });
  const filteredAgreements = (data?.agreements ?? []).filter((item) =>
    `${item.hospital_name} ${item.equipment_name} ${item.contract_number ?? ""}`.toLowerCase().includes(query),
  );

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const queryText = String(form.get("message") ?? "").trim();
    if (!queryText || chatLoading) return;
    event.currentTarget.reset();
    setMessages((current) => [...current, { role: "user", content: queryText }]);
    setChatLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: queryText, thread_id: threadId }),
    });
    const payload = (await response.json().catch(() => null)) as { result?: string; thread_id?: string; error?: string } | null;
    setMessages((current) => [...current, {
      role: "assistant",
      content: response.ok ? payload?.result ?? "No answer was returned." : payload?.error ?? "The assistant is unavailable.",
    }]);
    if (payload?.thread_id) setThreadId(payload.thread_id);
    setChatLoading(false);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.assign("/");
  }

  const initials = user.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup sidebar-brand">
          <span className="brand-mark">DS</span>
          <span>Service Command</span>
        </div>
        <nav aria-label="Primary navigation">
          {navigation.map((item) => (
            <button key={item.id} className={section === item.id ? "nav-item active" : "nav-item"} onClick={() => setSection(item.id)}>
              <span>{item.mark}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p>Southern Province</p>
          <span>Operations network</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Down South Region</p>
            <h1>{navigation.find((item) => item.id === section)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <button className="refresh-button" onClick={() => void loadData()} disabled={loading}>↻ Refresh</button>
            <div className="user-menu">
              <span className="avatar">{initials}</span>
              <div><strong>{user.displayName}</strong><small>{user.email}</small></div>
              <button onClick={() => void logout()} aria-label="Sign out">↗</button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="connection-alert" role="alert">
            <div><strong>Backend connection unavailable</strong><span>{error}</span></div>
            <button onClick={() => void loadData()}>Try again</button>
          </div>
        ) : null}

        {!error && data?.source === "snapshot" ? (
          <div className="snapshot-notice" role="status">
            <span>Verified snapshot</span>
            <p>{data.warning}</p>
          </div>
        ) : null}

        {section === "overview" ? (
          <div className="content-stack">
            <section className="welcome-band">
              <div><p>Good day, {user.displayName.split(" ")[0]}.</p><h2>Regional service operations at a glance.</h2></div>
              <span className={data?.connected ? "live-pill" : "live-pill offline"}><i />{data?.connected ? "Live database" : data ? "Verified snapshot" : "Connecting"}</span>
            </section>
            <section className="metric-grid" aria-label="Key metrics">
              <article><span>Hospitals</span><strong>{data?.hospitals.length ?? "—"}</strong><small>Southern network</small></article>
              <article><span>Equipment</span><strong>{data?.equipment.length ?? "—"}</strong><small>Registered assets</small></article>
              <article><span>Active agreements</span><strong>{activeAgreements || "—"}</strong><small>Currently covered</small></article>
              <article className={expiringAgreements ? "attention" : ""}><span>Expiring soon</span><strong>{expiringAgreements}</strong><small>Within 60 days</small></article>
            </section>
            <div className="overview-grid">
              <section className="panel hospital-panel">
                <div className="panel-heading"><div><p className="eyebrow">Coverage</p><h3>Hospital network</h3></div><button onClick={() => setSection("hospitals")}>View all →</button></div>
                <div className="hospital-list">
                  {(data?.hospitals ?? []).map((hospital, index) => (
                    <article key={hospital.id}>
                      <span className="hospital-index">0{index + 1}</span>
                      <div><strong>{hospital.name}</strong><small>{hospital.address || "Address pending"}</small></div>
                      <b>{equipmentByHospital.get(hospital.id) ?? 0}<small>assets</small></b>
                    </article>
                  ))}
                </div>
              </section>
              <section className="panel agreement-panel">
                <div className="panel-heading"><div><p className="eyebrow">Attention</p><h3>Agreement watch</h3></div><button onClick={() => setSection("agreements")}>Review →</button></div>
                <div className="agreement-watch">
                  {(data?.agreements ?? []).filter((item) => agreementState(item) === "Expiring").slice(0, 5).map((item) => (
                    <article key={item.id}><span className="status-dot warning" /><div><strong>{item.equipment_name}</strong><small>{item.hospital_name}</small></div><time>{formatDate(item.agreement_end_date)}</time></article>
                  ))}
                  {!expiringAgreements && !loading ? <p className="empty-state">No agreements expire within the next 60 days.</p> : null}
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {section === "hospitals" ? (
          <section className="section-view">
            <div className="section-intro"><div><p className="eyebrow">Network directory</p><h2>Hospitals</h2></div><span>{data?.hospitals.length ?? 0} facilities</span></div>
            <div className="hospital-card-grid">
              {(data?.hospitals ?? []).map((hospital, index) => (
                <article className="hospital-card" key={hospital.id}>
                  <div className="hospital-card-top"><span>0{index + 1}</span><i className="live-dot" /></div>
                  <h3>{hospital.name}</h3><p>{hospital.address || "Contact details are awaiting confirmation."}</p>
                  <dl><div><dt>Equipment</dt><dd>{equipmentByHospital.get(hospital.id) ?? 0}</dd></div><div><dt>Telephone</dt><dd>{hospital.telephone || "—"}</dd></div></dl>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {section === "equipment" ? (
          <section className="section-view">
            <div className="section-intro table-intro"><div><p className="eyebrow">Asset register</p><h2>Equipment</h2></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search equipment or hospital" aria-label="Search equipment" /></div>
            <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Equipment</th><th>Hospital</th><th>Model</th><th>Serial number</th><th>Status</th></tr></thead><tbody>
              {filteredEquipment.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{data?.hospitals.find((entry) => entry.id === item.hospital_id)?.name ?? "Unknown"}</td><td>{item.model || "Not recorded"}</td><td>{item.serial_number || "—"}</td><td><span className="table-status">{item.status || "Awaiting data"}</span></td></tr>)}
            </tbody></table></div>
          </section>
        ) : null}

        {section === "agreements" ? (
          <section className="section-view">
            <div className="section-intro table-intro"><div><p className="eyebrow">Contract coverage</p><h2>Service agreements</h2></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contract, equipment, hospital" aria-label="Search agreements" /></div>
            <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Equipment</th><th>Hospital</th><th>Contract</th><th>Coverage period</th><th>State</th></tr></thead><tbody>
              {filteredAgreements.map((item) => { const state = agreementState(item); return <tr key={item.id}><td><strong>{item.equipment_name}</strong><small>Installed {formatDate(item.installation_date)}</small></td><td>{item.hospital_name}</td><td>{item.contract_number || "—"}</td><td>{formatDate(item.agreement_start_date)}<small>to {formatDate(item.agreement_end_date)}</small></td><td><span className={`agreement-state ${state.toLowerCase()}`}>{state}</span></td></tr>; })}
            </tbody></table></div>
          </section>
        ) : null}

        {section === "assistant" ? (
          <section className="assistant-view">
            <div className="assistant-intro"><p className="eyebrow">Natural-language database access</p><h2>Ask Service Intelligence</h2><p>Get grounded answers from the regional service database. The assistant has read-only access.</p></div>
            <div className="chat-shell"><div className="chat-messages">
              {messages.map((message, index) => <article key={`${message.role}-${index}`} className={`chat-message ${message.role}`}><span>{message.role === "assistant" ? "AI" : initials}</span><p>{message.content}</p></article>)}
              {chatLoading ? <article className="chat-message assistant"><span>AI</span><p className="thinking">Reviewing database records…</p></article> : null}
            </div><form className="chat-form" onSubmit={sendMessage}><input name="message" placeholder="Ask about equipment, contracts, or service history…" autoComplete="off" /><button type="submit" disabled={chatLoading}>Send →</button></form></div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
