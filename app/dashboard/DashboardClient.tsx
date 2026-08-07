"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AppUser } from "../auth";
import type { DashboardData, Equipment, Hospital, ServiceAgreement } from "../types";

type Section = "overview" | "hospitals" | "equipment" | "agreements" | "assistant";
type ChatMessage = { role: "user" | "assistant"; content: string };
type DataResult = { data: DashboardData; error?: never } | { data?: never; error: string };
type HospitalDraft = { id?: number; name: string; address: string; email: string; telephone: string };
type EquipmentDraft = { id?: number; hospital_id: string; name: string; model: string; serial_number: string; status: string };

const navigation: { id: Section; label: string; mark: string }[] = [
  { id: "overview", label: "Overview", mark: "01" },
  { id: "hospitals", label: "Hospitals", mark: "02" },
  { id: "equipment", label: "Equipment", mark: "03" },
  { id: "agreements", label: "Agreements", mark: "04" },
  { id: "assistant", label: "AI Assistant", mark: "AI" },
];

const equipmentStatuses = ["Operational", "Active", "Under service", "Out of service", "Retired"];

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
  const [hospitalEditor, setHospitalEditor] = useState<HospitalDraft | null>(null);
  const [hospitalSaving, setHospitalSaving] = useState(false);
  const [hospitalFeedback, setHospitalFeedback] = useState("");
  const [equipmentEditor, setEquipmentEditor] = useState<EquipmentDraft | null>(null);
  const [equipmentSaving, setEquipmentSaving] = useState(false);
  const [equipmentFeedback, setEquipmentFeedback] = useState("");

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

  function editHospital(hospital: Hospital) {
    setHospitalFeedback("");
    setHospitalEditor({
      id: hospital.id,
      name: hospital.name,
      address: hospital.address ?? "",
      email: hospital.email === "NA" ? "" : hospital.email ?? "",
      telephone: hospital.telephone ?? "",
    });
  }

  async function saveHospital(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hospitalEditor || hospitalSaving) return;
    const form = new FormData(event.currentTarget);
    setHospitalSaving(true);
    setHospitalFeedback("");
    const response = await fetch("/api/hospitals", {
      method: hospitalEditor.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: hospitalEditor.id,
        name: String(form.get("name") ?? ""),
        address: String(form.get("address") ?? ""),
        email: String(form.get("email") ?? ""),
        telephone: String(form.get("telephone") ?? ""),
      }),
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setHospitalFeedback(result?.error ?? "Unable to save hospital details.");
      setHospitalSaving(false);
      return;
    }
    setHospitalEditor(null);
    setHospitalFeedback(hospitalEditor.id ? "Hospital contact details updated." : "Hospital added to the database.");
    setHospitalSaving(false);
    await loadData();
  }

  function editEquipment(equipment: Equipment) {
    setEquipmentFeedback("");
    setEquipmentEditor({
      id: equipment.id,
      hospital_id: String(equipment.hospital_id),
      name: equipment.name,
      model: equipment.model ?? "",
      serial_number: equipment.serial_number ?? "",
      status: equipment.status ?? "",
    });
  }

  async function saveEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!equipmentEditor || equipmentSaving) return;
    const form = new FormData(event.currentTarget);
    setEquipmentSaving(true);
    setEquipmentFeedback("");
    const response = await fetch("/api/equipment", {
      method: equipmentEditor.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: equipmentEditor.id,
        hospital_id: Number(form.get("hospital_id")),
        name: String(form.get("name") ?? ""),
        model: String(form.get("model") ?? ""),
        serial_number: String(form.get("serial_number") ?? ""),
        status: String(form.get("status") ?? ""),
      }),
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setEquipmentFeedback(result?.error ?? "Unable to save equipment details.");
      setEquipmentSaving(false);
      return;
    }
    setEquipmentEditor(null);
    setEquipmentFeedback(equipmentEditor.id ? "Equipment details updated." : "Equipment added to the database.");
    setEquipmentSaving(false);
    await loadData();
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
            <div className="section-intro">
              <div><p className="eyebrow">Network directory</p><h2>Hospitals</h2></div>
              <div className="section-actions">
                <span>{data?.hospitals.length ?? 0} facilities</span>
                <button
                  className="add-record-button"
                  disabled={!data?.connected}
                  title={data?.connected ? "Add hospital" : "A live backend connection is required"}
                  onClick={() => { setHospitalFeedback(""); setHospitalEditor({ name: "", address: "", email: "", telephone: "" }); }}
                >+ Add hospital</button>
              </div>
            </div>
            {!data?.connected ? <p className="write-mode-note">Adding and editing hospitals is available when the app is connected to the live FastAPI/PostgreSQL service.</p> : null}
            {hospitalEditor ? (
              <form className="hospital-form" onSubmit={saveHospital} key={hospitalEditor.id ?? "new"}>
                <div className="hospital-form-heading">
                  <div><p className="eyebrow">Database entry</p><h3>{hospitalEditor.id ? "Edit hospital contact details" : "Add a hospital"}</h3></div>
                  <button type="button" onClick={() => setHospitalEditor(null)}>Cancel</button>
                </div>
                <div className="hospital-form-grid">
                  <label>Hospital name<input name="name" defaultValue={hospitalEditor.name} minLength={3} required readOnly={Boolean(hospitalEditor.id)} /></label>
                  <label>Address<input name="address" defaultValue={hospitalEditor.address} placeholder="Street, city or district" /></label>
                  <label>Email<input name="email" type="email" defaultValue={hospitalEditor.email} placeholder="hospital@example.lk" /></label>
                  <label>Telephone<input name="telephone" type="tel" defaultValue={hospitalEditor.telephone} placeholder="+94 XX XXX XXXX" /></label>
                </div>
                <div className="hospital-form-footer"><span>Saved directly to the downsouthregion hospitals table.</span><button className="save-record-button" type="submit" disabled={hospitalSaving}>{hospitalSaving ? "Saving…" : "Save hospital"}</button></div>
              </form>
            ) : null}
            {hospitalFeedback ? <p className="form-feedback" role="status">{hospitalFeedback}</p> : null}
            <div className="data-table-wrap hospital-directory">
              <table className="data-table">
                <thead><tr><th>Hospital name</th><th>Address</th><th>Email</th><th>Telephone</th><th>Equipment</th><th>Action</th></tr></thead>
                <tbody>
                  {(data?.hospitals ?? []).map((hospital) => (
                    <tr key={hospital.id}>
                      <td><strong>{hospital.name}</strong><small>Hospital ID {hospital.id}</small></td>
                      <td>{hospital.address || "Not recorded"}</td>
                      <td>{hospital.email && hospital.email !== "NA" ? <a href={`mailto:${hospital.email}`}>{hospital.email}</a> : "Not recorded"}</td>
                      <td>{hospital.telephone ? <a href={`tel:${hospital.telephone.replace(/\s/g, "")}`}>{hospital.telephone}</a> : "Not recorded"}</td>
                      <td><span className="asset-count">{equipmentByHospital.get(hospital.id) ?? 0} assets</span></td>
                      <td><button className="edit-record-button" disabled={!data?.connected} onClick={() => editHospital(hospital)}>Edit contact</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {section === "equipment" ? (
          <section className="section-view">
            <div className="section-intro table-intro">
              <div><p className="eyebrow">Asset register</p><h2>Equipment</h2></div>
              <div className="equipment-toolbar">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search equipment or hospital" aria-label="Search equipment" />
                <button
                  className="add-record-button"
                  disabled={!data?.connected || !data.hospitals.length}
                  title={data?.connected ? "Add equipment" : "A live backend connection is required"}
                  onClick={() => { setEquipmentFeedback(""); setEquipmentEditor({ hospital_id: String(data?.hospitals[0]?.id ?? ""), name: "", model: "", serial_number: "", status: "Operational" }); }}
                >+ Add equipment</button>
              </div>
            </div>
            {!data?.connected ? <p className="write-mode-note">Adding and editing equipment is available when the app is connected to the live FastAPI/PostgreSQL service.</p> : null}
            {equipmentEditor ? (
              <form className="hospital-form" onSubmit={saveEquipment} key={equipmentEditor.id ?? "new-equipment"}>
                <div className="hospital-form-heading">
                  <div><p className="eyebrow">Database entry</p><h3>{equipmentEditor.id ? "Edit equipment details" : "Add equipment"}</h3></div>
                  <button type="button" onClick={() => setEquipmentEditor(null)}>Cancel</button>
                </div>
                <div className="hospital-form-grid equipment-form-grid">
                  <label>Equipment name<input name="name" defaultValue={equipmentEditor.name} minLength={2} required /></label>
                  <label>Hospital<select name="hospital_id" defaultValue={equipmentEditor.hospital_id} required>{(data?.hospitals ?? []).map((hospital) => <option value={hospital.id} key={hospital.id}>{hospital.name}</option>)}</select></label>
                  <label>Model<input name="model" defaultValue={equipmentEditor.model} placeholder="Model name or number" /></label>
                  <label>Serial number<input name="serial_number" defaultValue={equipmentEditor.serial_number} placeholder="Unique serial number" /></label>
                  <label>Status<select name="status" defaultValue={equipmentEditor.status}>{equipmentEditor.status && !equipmentStatuses.includes(equipmentEditor.status) ? <option value={equipmentEditor.status}>{equipmentEditor.status}</option> : null}<option value="">Not recorded</option>{equipmentStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label>
                </div>
                <div className="hospital-form-footer"><span>Saved directly to the downsouthregion equipment table.</span><button className="save-record-button" type="submit" disabled={equipmentSaving}>{equipmentSaving ? "Saving…" : "Save equipment"}</button></div>
              </form>
            ) : null}
            {equipmentFeedback ? <p className="form-feedback" role="status">{equipmentFeedback}</p> : null}
            <div className="data-table-wrap equipment-directory"><table className="data-table"><thead><tr><th>Equipment</th><th>Hospital</th><th>Model</th><th>Serial number</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {filteredEquipment.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>Equipment ID {item.id}</small></td><td>{data?.hospitals.find((entry) => entry.id === item.hospital_id)?.name ?? "Unknown"}</td><td>{item.model || "Not recorded"}</td><td>{item.serial_number || "—"}</td><td><span className="table-status">{item.status || "Awaiting data"}</span></td><td><button className="edit-record-button" disabled={!data?.connected} onClick={() => editEquipment(item)}>Edit</button></td></tr>)}
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
