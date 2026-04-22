import { useState, useEffect, useCallback } from "react";
import { PortalShell, StatusBadge } from "./Portal_Dashboard";
import { Plus, Save, ChevronDown, Pencil, Loader2, AlertCircle, RefreshCw, Eye } from "lucide-react";

// ── API URLs ──────────────────────────────────────────────────────────────────

const ADD_URL = "https://onboard-form-10.onrender.com/add_campaign/";
const EDIT_URL = "https://onboard-form-10.onrender.com/update_campaign/";
const GET_URL = "https://onboard-form-10.onrender.com/campaign_list/";

// ── Types ─────────────────────────────────────────────────────────────────────

type FormMode = "new" | "edit" | "view";

interface CampaignForm {
    client_campaign_id: string;
    reporting_id: string;
    purchase_order_id: string;
    campaign_name: string;
    client_name: string;
    start_date: string;
    end_date: string;
    subagency: string;
    brand: string;
    website_url: string;
    status: string;
    is_active: boolean;
}

interface CampaignRow extends CampaignForm {
    campaign_id: string;
}

const EMPTY_FORM: CampaignForm = {
    client_campaign_id: "",
    reporting_id: "",
    purchase_order_id: "",
    campaign_name: "",
    client_name: "",
    start_date: "",
    end_date: "",
    subagency: "",
    brand: "",
    website_url: "",
    status: "Draft",
    is_active: true,
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function Portal_Campaigns() {
    const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
    const [form, setForm] = useState<CampaignForm>(EMPTY_FORM);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mode, setMode] = useState<FormMode>("new");

    const [loadingList, setLoadingList] = useState(false);
    const [listError, setListError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [savedFlash, setSavedFlash] = useState(false);

    const isEditing = mode === "edit";
    const isViewing = mode === "view";
    const isNew = mode === "new";

    // ── Fetch list ──────────────────────────────────────────────────────────────
    const fetchCampaigns = useCallback(async () => {
        setLoadingList(true);
        setListError("");
        try {
            const res = await fetch(GET_URL);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            const rows: CampaignRow[] = Array.isArray(data)
                ? data
                : Array.isArray(data.campaigns)
                    ? data.campaigns
                    : Array.isArray(data.data)
                        ? data.data
                        : [];
            setCampaigns(rows);
        } catch (err: unknown) {
            setListError(err instanceof Error ? err.message : "Failed to load campaigns.");
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    // ── Field setter ────────────────────────────────────────────────────────────
    const setField = <K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    // ── Build FormData ──────────────────────────────────────────────────────────
    const buildFormData = (f: CampaignForm, campaignId?: string): FormData => {
        const fd = new FormData();
        if (campaignId) fd.append("campaign_id", campaignId);
        fd.append("client_campaign_id", f.client_campaign_id);
        fd.append("reporting_id", f.reporting_id);
        fd.append("purchase_order_id", f.purchase_order_id);
        fd.append("campaign_name", f.campaign_name);
        fd.append("client_name", f.client_name);
        fd.append("start_date", f.start_date);
        fd.append("end_date", f.end_date);
        fd.append("subagency", f.subagency);
        fd.append("brand", f.brand);
        fd.append("website_url", f.website_url);
        fd.append("status", f.status);
        fd.append("is_active", f.is_active ? "true" : "false");
        return fd;
    };

    // ── POST (add or edit) ──────────────────────────────────────────────────────
    const postCampaign = async (f: CampaignForm, campaignId?: string): Promise<boolean> => {
        setSubmitting(true);
        setSubmitError("");

        const url = campaignId
            ? `${EDIT_URL}${campaignId}/`
            : ADD_URL;

        try {
            const res = await fetch(url, {
                method: campaignId ? "PUT" : "POST",
                body: buildFormData(f, campaignId),
            });

            if (!res.ok) {
                let msg = `Server error: ${res.status}`;
                try {
                    const data = await res.json();
                    msg = data.message || data.error || data.detail || msg;
                } catch {
                    const text = await res.text();
                    if (text) msg = text;
                }
                setSubmitError(msg);
                return false;
            }

            return true;
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : "Network error");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleNew = () => {
        setForm(EMPTY_FORM);
        setActiveId(null);
        setMode("new");
        setSavedFlash(false);
        setSubmitError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleView = (c: CampaignRow) => {
        const { campaign_id, ...rest } = c;
        setForm(rest);
        setActiveId(campaign_id);
        setMode("view");
        setSavedFlash(false);
        setSubmitError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleEdit = (c: CampaignRow) => {
        const { campaign_id, ...rest } = c;
        setForm(rest);
        setActiveId(campaign_id);
        setMode("edit");
        setSavedFlash(false);
        setSubmitError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSave = async () => {
        const ok = await postCampaign(form, isEditing ? activeId ?? undefined : undefined);
        if (!ok) return;
        await fetchCampaigns();
        setForm(EMPTY_FORM);
        setActiveId(null);
        setMode("new");
        setSavedFlash(false);
    };

    const handleSaveContinue = async () => {
        const ok = await postCampaign(form, isEditing ? activeId ?? undefined : undefined);
        if (!ok) return;
        await fetchCampaigns();
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2500);
    };

    // Switch from view → edit
    const handleEditFromView = () => {
        setMode("edit");
        setSavedFlash(false);
        setSubmitError("");
    };

    // ── Derived labels ──────────────────────────────────────────────────────────
    const formTitle = isNew
        ? "New Campaign"
        : isViewing
            ? `View Campaign · ${activeId}`
            : `Edit Campaign · ${activeId}`;

    const formSubtitle = isNew
        ? "Fill in the details below and save."
        : `${form.campaign_name || "—"} · ${form.client_name || "—"}`;

    const allReadOnly = isViewing;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <PortalShell
            title="Campaign Management"
            subtitle="Create, edit and manage all client campaigns and sub-campaigns."
            actions={
                <button
                    onClick={handleNew}
                    className="h-9 px-4 text-sm rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-1.5 shadow-glow"
                >
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            }
        >
            <div className="grid lg:grid-cols-3 gap-5">

                {/* ── Form ──────────────────────────────────────────────────────── */}
                <div className="lg:col-span-2 card-elevated p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                {isViewing && <Eye className="w-4 h-4 text-muted-foreground" />}
                                {formTitle}
                            </h3>
                            <p className="text-xs text-muted-foreground">{formSubtitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {(isEditing || isViewing) && <StatusBadge status={form.status} />}
                            {/* View mode → switch to Edit */}
                            {isViewing && (
                                <button
                                    onClick={handleEditFromView}
                                    className="h-8 px-3 text-xs rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-1.5"
                                >
                                    <Pencil className="w-3 h-3" /> Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* View mode banner */}
                    {isViewing && (
                        <div className="mb-4 px-4 py-2.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            You are in view-only mode. Click <strong className="mx-1">Edit</strong> to make changes.
                        </div>
                    )}

                    {/* Success flash */}
                    {savedFlash && (
                        <div className="mb-4 px-4 py-2.5 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                            ✅ Saved successfully. You can continue editing.
                        </div>
                    )}

                    {/* Error */}
                    {submitError && (
                        <div className="mb-4 px-4 py-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {submitError}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">

                        {(isEditing || isViewing) && (
                            <FieldInput label="Campaign ID" value={activeId ?? ""} readOnly />
                        )}

                        <FieldInput
                            label="Client Campaign ID"
                            value={form.client_campaign_id}
                            onChange={(v) => setField("client_campaign_id", v)}
                            placeholder="e.g. NW-Q4-2025"
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Reporting ID"
                            value={form.reporting_id}
                            onChange={(v) => setField("reporting_id", v)}
                            placeholder="e.g. RPT-1042"
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Purchase Order ID"
                            value={form.purchase_order_id}
                            onChange={(v) => setField("purchase_order_id", v)}
                            placeholder="e.g. PO-99821"
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Campaign Name"
                            value={form.campaign_name}
                            onChange={(v) => setField("campaign_name", v)}
                            placeholder="e.g. Q4 Brand Push"
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Client Name"
                            value={form.client_name}
                            onChange={(v) => setField("client_name", v)}
                            placeholder="e.g. Northwind Trading"
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Start Date"
                            type="date"
                            value={form.start_date}
                            onChange={(v) => setField("start_date", v)}
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="End Date"
                            type="date"
                            value={form.end_date}
                            onChange={(v) => setField("end_date", v)}
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Subagency"
                            value={form.subagency}
                            onChange={(v) => setField("subagency", v)}
                            placeholder="e.g. Mediacom NA"
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Brand"
                            value={form.brand}
                            onChange={(v) => setField("brand", v)}
                            placeholder="e.g. Northwind Origin"
                            readOnly={allReadOnly}
                        />
                        <FieldInput
                            label="Website URL"
                            value={form.website_url}
                            onChange={(v) => setField("website_url", v)}
                            placeholder="https://example.com"
                            readOnly={allReadOnly}
                        />
                        <FieldSelect
                            label="Status"
                            options={["Draft", "Live", "Active", "Paused", "Completed"]}
                            value={form.status}
                            onChange={(v) => setField("status", v)}
                            disabled={allReadOnly}
                        />
                        <div className="flex items-center pt-6">
                            <label className={`flex items-center gap-2 text-sm text-ink-soft ${allReadOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => !allReadOnly && setField("is_active", e.target.checked)}
                                    disabled={allReadOnly}
                                    className="rounded border-border w-4 h-4 accent-primary disabled:cursor-not-allowed"
                                />
                                Active
                            </label>
                        </div>
                    </div>

                    {/* Footer buttons — hidden in view mode */}
                    {!isViewing && (
                        <div className="flex items-center justify-end gap-2 mt-6 pt-5 border-t border-border">
                            <button
                                onClick={handleSaveContinue}
                                disabled={submitting}
                                className="h-9 px-3 text-sm rounded-md border border-border hover:bg-muted disabled:opacity-60"
                            >
                                Save & Continue Editing
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={submitting}
                                className="h-9 px-4 text-sm rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-1.5 shadow-glow disabled:opacity-60"
                            >
                                {submitting
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                    : <><Save className="w-4 h-4" /> {isEditing ? "Update" : "Save"}</>
                                }
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Side panel ───────────────────────────────────────────────── */}
                <div className="space-y-5">
                    <div className="card-elevated p-5">
                        <h4 className="font-semibold text-sm mb-3">Permissions</h4>
                        <ul className="space-y-2 text-xs">
                            <Perm allowed label="Add/Edit own campaigns" />
                            <Perm allowed label="Update dates & schedule" />
                            <Perm allowed label="View live status" />
                            <Perm allowed label="Track delivery progress" />
                            <Perm label="Edit master data" />
                            <Perm label="Modify billing controls" />
                        </ul>
                    </div>
                    <div className="card-elevated p-5">
                        <h4 className="font-semibold text-sm mb-3">Approval Required</h4>
                        <p className="text-xs text-muted-foreground">
                            Changes to{" "}
                            <span className="font-medium text-ink">
                                Dates · Budget · Status · Billing · Line Items
                            </span>{" "}
                            route through the Admin Approval Engine.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── All Campaigns Table ───────────────────────────────────────────── */}
            <div className="card-elevated mt-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">All Campaigns</h3>
                        <p className="text-xs text-muted-foreground">
                            {loadingList
                                ? "Loading…"
                                : `${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""} total`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchCampaigns}
                            disabled={loadingList}
                            title="Refresh list"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
                        </button>
                        <button
                            onClick={handleNew}
                            className="h-8 px-3 text-xs rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Campaign
                        </button>
                    </div>
                </div>

                {listError && (
                    <div className="px-6 py-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border-b border-red-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {listError}
                        <button onClick={fetchCampaigns} className="ml-auto text-xs underline hover:no-underline">
                            Retry
                        </button>
                    </div>
                )}

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                            <th className="px-6 py-2.5 font-medium">Campaign</th>
                            <th className="px-4 py-2.5 font-medium">Client</th>
                            <th className="px-4 py-2.5 font-medium">Start</th>
                            <th className="px-4 py-2.5 font-medium">End</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingList ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading campaigns…
                                    </div>
                                </td>
                            </tr>
                        ) : campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                    No campaigns found. Click "+ Add Campaign" to create one.
                                </td>
                            </tr>
                        ) : (
                            campaigns.map((c) => (
                                <tr
                                    key={c.campaign_id}
                                    className={`border-t border-border hover:bg-muted/30 transition-colors ${activeId === c.campaign_id ? "bg-primary/5" : ""
                                        }`}
                                >
                                    <td className="px-6 py-3">
                                        <div className="font-medium">{c.campaign_name || "—"}</div>
                                        <div className="text-xs text-muted-foreground">{c.campaign_id}</div>
                                    </td>
                                    <td className="px-4 py-3 text-ink-soft text-sm">{c.client_name || "—"}</td>
                                    <td className="px-4 py-3 text-ink-soft text-xs">
                                        {c.start_date
                                            ? new Date(c.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-ink-soft text-xs">
                                        {c.end_date
                                            ? new Date(c.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={c.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* View button */}
                                            <button
                                                onClick={() => handleView(c)}
                                                className="text-xs text-muted-foreground font-medium inline-flex items-center gap-1 hover:text-ink hover:underline"
                                            >
                                                <Eye className="w-3 h-3" /> View
                                            </button>
                                            {/* Edit button */}
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline"
                                            >
                                                <Pencil className="w-3 h-3" /> Edit <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </PortalShell>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    readOnly,
}: {
    label: string;
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    type?: string;
    readOnly?: boolean;
}) {
    return (
        <label className="block">
            <div className="text-xs font-medium text-ink-soft mb-1.5">{label}</div>
            <input
                type={type}
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full h-10 px-3 rounded-md border border-input bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary read-only:opacity-60 read-only:cursor-not-allowed read-only:bg-muted/30"
            />
        </label>
    );
}

function FieldSelect({
    label,
    options,
    value,
    onChange,
    disabled,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    return (
        <label className="block">
            <div className="text-xs font-medium text-ink-soft mb-1.5">{label}</div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full h-10 px-3 rounded-md border border-input bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted/30"
            >
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </label>
    );
}

function Perm({ allowed, label }: { allowed?: boolean; label: string }) {
    return (
        <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${allowed ? "bg-success" : "bg-destructive"}`} />
            <span className={allowed ? "text-ink" : "text-muted-foreground line-through"}>{label}</span>
        </li>
    );
}