import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Upload, Building2, Users, MapPin, ArrowLeft, Save } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContactRow {
  id: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  contact_designation: string;
  contact_country: string;
  contact_zipcode: string;
  contact_address: string;
  contact_signature: File | null;
  contact_is_active: boolean;
}

interface AddressRow {
  id: number;
  company_address_line1: string;
  company_address_line2: string;
  company_country: string;
  company_zipcode: string;
}

interface CompanyForm {
  client_id: string;
  reporting_id: string;
  name: string;
  phone_no: string;
  email: string;
  address_line1: string;
  address_line2: string;
  zipcode: string;
  country: string;
  payment_type: string;
  payment_term: string;
  billing_currency: string;
  gst_no: string;
  cin_no: string;
  is_domestic: boolean;
  is_active: boolean;
}

const SUBMIT_URL = "https://onboard-form-7.onrender.com/add_client/";

const COUNTRIES = ["India", "USA", "UK", "Chinese"];
const PAYMENT_TYPES = ["Prepaid", "Postpaid"];
const PAYMENT_TERMS = ["15 Days", "30 Days", "45 Days"];
const BILLING_CURRENCIES = ["INR", "USD"];

function makeContact(): ContactRow {
  return {
    id: Date.now(),
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    contact_designation: "",
    contact_country: "",
    contact_zipcode: "",
    contact_address: "",
    contact_signature: null,
    contact_is_active: true,
  };
}

function makeAddress(): AddressRow {
  return {
    id: Date.now(),
    company_address_line1: "",
    company_address_line2: "",
    company_country: "",
    company_zipcode: "",
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [company, setCompany] = useState<CompanyForm>({
    client_id: "",
    reporting_id: "",
    name: "",
    phone_no: "",
    email: "",
    address_line1: "",
    address_line2: "",
    zipcode: "",
    country: "",
    payment_type: "Prepaid",
    payment_term: "15 Days",
    billing_currency: "INR",
    gst_no: "",
    cin_no: "",
    is_domestic: false,
    is_active: false,
  });

  const [contacts, setContacts] = useState<ContactRow[]>([makeContact()]);
  const [addresses, setAddresses] = useState<AddressRow[]>([makeAddress()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // ── Company handlers ──────────────────────────────────────────────────────

  const setField = (key: keyof CompanyForm, value: string | boolean) =>
    setCompany((prev) => ({ ...prev, [key]: value }));

  // ── Contact handlers ──────────────────────────────────────────────────────

  const addContact = () => setContacts((prev) => [...prev, makeContact()]);
  const removeContact = (id: number) => setContacts((prev) => prev.filter((c) => c.id !== id));
  const updateContact = (id: number, key: keyof ContactRow, value: string | boolean | File | null) =>
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));

  // ── Address handlers ──────────────────────────────────────────────────────

  const addAddress = () => setAddresses((prev) => [...prev, makeAddress()]);
  const removeAddress = (id: number) => setAddresses((prev) => prev.filter((a) => a.id !== id));
  const updateAddress = (id: number, key: keyof AddressRow, value: string) =>
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, [key]: value } : a)));

  // ── Submit ────────────────────────────────────────────────────────────────

  const buildFormData = () => {
    const fd = new FormData();

    // Company fields — match Django model column names exactly
    fd.append("client_id", company.client_id);
    fd.append("reporting_id", company.reporting_id);
    fd.append("name", company.name);
    fd.append("phone_no", company.phone_no);
    fd.append("email", company.email);
    fd.append("address_line1", company.address_line1);
    fd.append("address_line2", company.address_line2);
    fd.append("zipcode", company.zipcode);
    fd.append("country", company.country);
    fd.append("payment_type", company.payment_type);
    fd.append("payment_term", company.payment_term);
    fd.append("billing_currency", company.billing_currency);
    fd.append("gst_no", company.gst_no);
    fd.append("cin_no", company.cin_no);
    fd.append("is_domestic", company.is_domestic ? "true" : "false");
    fd.append("is_active", company.is_active ? "true" : "false");

    // Contact fields — only first contact (model has flat contact fields)
    if (contacts.length > 0) {
      const c = contacts[0];
      fd.append("contact_name", c.contact_name);
      fd.append("contact_phone", c.contact_phone);
      fd.append("contact_email", c.contact_email);
      fd.append("contact_designation", c.contact_designation);
      fd.append("contact_country", c.contact_country);
      fd.append("contact_zipcode", c.contact_zipcode);
      fd.append("contact_address", c.contact_address);
      fd.append("contact_is_active", c.contact_is_active ? "true" : "false");
      if (c.contact_signature) {
        fd.append("contact_signature", c.contact_signature);
      }
    }

    // Address fields — only first address (model has flat address fields)
    if (addresses.length > 0) {
      const a = addresses[0];
      fd.append("company_address_line1", a.company_address_line1);
      fd.append("company_address_line2", a.company_address_line2);
      fd.append("company_country", a.company_country);
      fd.append("company_zipcode", a.company_zipcode);
    }

    return fd;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");
    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        body: buildFormData(),
      });
      if (res.ok) {
        setSubmitStatus("success");
      } else {
        const text = await res.text();
        setSubmitStatus("error");
        setErrorMessage(text || `Server responded with status ${res.status}`);
      }
    } catch (err: unknown) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save draft to localStorage for convenience
    localStorage.setItem(
      "onboarding_draft",
      JSON.stringify({ company, contacts: contacts.map((c) => ({ ...c, contact_signature: null })), addresses })
    );
    alert("Draft saved locally.");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 bg-surface border-b border-border flex items-center px-6 gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            N
          </div>
          <span className="font-semibold tracking-tight">
            Nexus<span className="text-primary">CRM</span>
          </span>
        </Link>
        <div className="text-xs text-muted-foreground ml-3">/ New Client Onboarding</div>
        <div className="ml-auto flex gap-2">
          <Link
            to="/login"
            className="h-9 px-3 inline-flex items-center gap-1.5 text-sm rounded-md hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-9 px-4 inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground rounded-md font-medium shadow-glow disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {submitting ? "Saving…" : "Save & Continue"}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Onboard a new client</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Complete all four sections. All critical fields route through admin approval.
        </p>

        {/* Status banners */}
        {submitStatus === "success" && (
          <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
            ✅ Client submitted successfully!
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
            ❌ Submission failed: {errorMessage}
          </div>
        )}

        {/* Stepper */}
        <div className="mt-7 mb-8 flex items-center gap-2 text-xs">
          {["Company", "Contacts", "Addresses"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full grid place-items-center font-semibold ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className={i === 0 ? "font-medium text-ink" : "text-muted-foreground"}>{s}</span>
              {i < 2 && <div className="w-10 h-px bg-border ml-1" />}
            </div>
          ))}
        </div>

        {/* ── Section A: Company Details ─────────────────────────────────── */}
        <Section
          icon={<Building2 className="w-4 h-4" />}
          title="Company Details"
          subtitle="Master record fields and billing setup"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <ControlledInput
              label="Client ID"
              placeholder="CL-00428"
              value={company.client_id}
              onChange={(v) => setField("client_id", v)}
            />
            <ControlledInput
              label="Reporting ID"
              placeholder="RPT-00428"
              value={company.reporting_id}
              onChange={(v) => setField("reporting_id", v)}
            />
            <ControlledInput
              label="Company Name"
              placeholder="Northwind Trading Co."
              value={company.name}
              onChange={(v) => setField("name", v)}
            />
            <ControlledInput
              label="Phone"
              placeholder="+91 9876543210"
              value={company.phone_no}
              onChange={(v) => setField("phone_no", v)}
            />
            <ControlledInput
              label="Email"
              placeholder="ops@northwind.com"
              value={company.email}
              onChange={(v) => setField("email", v)}
            />
            <ControlledInput
              label="Address Line 1"
              placeholder="350 Mission Street"
              value={company.address_line1}
              onChange={(v) => setField("address_line1", v)}
            />
            <ControlledInput
              label="Address Line 2"
              placeholder="Suite 1200"
              value={company.address_line2}
              onChange={(v) => setField("address_line2", v)}
            />
            <ControlledInput
              label="Zipcode"
              placeholder="94105"
              value={company.zipcode}
              onChange={(v) => setField("zipcode", v)}
            />
            <ControlledSelect
              label="Country"
              options={["", ...COUNTRIES]}
              value={company.country}
              onChange={(v) => setField("country", v)}
            />
            <ControlledSelect
              label="Payment Type"
              options={PAYMENT_TYPES}
              value={company.payment_type}
              onChange={(v) => setField("payment_type", v)}
            />
            <ControlledSelect
              label="Payment Term"
              options={PAYMENT_TERMS}
              value={company.payment_term}
              onChange={(v) => setField("payment_term", v)}
            />
            <ControlledSelect
              label="Billing Currency"
              options={BILLING_CURRENCIES}
              value={company.billing_currency}
              onChange={(v) => setField("billing_currency", v)}
            />
            <ControlledInput
              label="GST No"
              placeholder="29ABCDE1234F2Z5"
              value={company.gst_no}
              onChange={(v) => setField("gst_no", v)}
            />
            <ControlledInput
              label="CIN No"
              placeholder="U72200KA2010PTC053390"
              value={company.cin_no}
              onChange={(v) => setField("cin_no", v)}
            />
            <div className="flex items-center gap-6 col-span-2 pt-2">
              <Check
                label="Is Domestic"
                checked={company.is_domestic}
                onChange={(v) => setField("is_domestic", v)}
              />
              <Check
                label="Is Active"
                checked={company.is_active}
                onChange={(v) => setField("is_active", v)}
              />
              <div className="ml-auto text-xs text-muted-foreground">
                Created on <span className="font-medium text-ink">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section B: Contacts ────────────────────────────────────────── */}
        <Section
          icon={<Users className="w-4 h-4" />}
          title="Company Contacts"
          subtitle="Add one or more contacts (first contact is submitted to the server)"
          actions={
            <button
              type="button"
              onClick={addContact}
              className="text-xs h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary-soft text-primary font-medium hover:bg-primary/15"
            >
              <Plus className="w-3.5 h-3.5" /> Add Contact
            </button>
          }
        >
          {contacts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
              No contacts added yet. Click "Add Contact" to begin.
            </div>
          ) : (
            contacts.map((contact, idx) => (
              <div
                key={contact.id}
                className="rounded-lg border border-border p-4 mb-3 last:mb-0 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact #{idx + 1}
                    {idx > 0 && (
                      <span className="ml-2 text-amber-600 font-normal normal-case">
                        (extra contacts are stored client-side only)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    className="w-7 h-7 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <ControlledInput
                    label="Name"
                    placeholder="Sofia Reyes"
                    value={contact.contact_name}
                    onChange={(v) => updateContact(contact.id, "contact_name", v)}
                  />
                  <ControlledInput
                    label="Phone"
                    placeholder="+91 9876543210"
                    value={contact.contact_phone}
                    onChange={(v) => updateContact(contact.id, "contact_phone", v)}
                  />
                  <ControlledInput
                    label="Email"
                    placeholder="sofia@northwind.com"
                    value={contact.contact_email}
                    onChange={(v) => updateContact(contact.id, "contact_email", v)}
                  />
                  <ControlledInput
                    label="Designation"
                    placeholder="Finance Director"
                    value={contact.contact_designation}
                    onChange={(v) => updateContact(contact.id, "contact_designation", v)}
                  />
                  <ControlledSelect
                    label="Country"
                    options={["", ...COUNTRIES]}
                    value={contact.contact_country}
                    onChange={(v) => updateContact(contact.id, "contact_country", v)}
                  />
                  <ControlledInput
                    label="Zipcode"
                    placeholder="94105"
                    value={contact.contact_zipcode}
                    onChange={(v) => updateContact(contact.id, "contact_zipcode", v)}
                  />
                  <ControlledInput
                    label="Address"
                    placeholder="350 Mission St"
                    value={contact.contact_address}
                    onChange={(v) => updateContact(contact.id, "contact_address", v)}
                  />
                  {/* Signature upload */}
                  <div>
                    <div className="text-xs font-medium text-ink-soft mb-1.5">Digital Signature</div>
                    <label className="flex-1 h-10 px-3 flex items-center justify-center gap-2 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary hover:text-primary cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      {contact.contact_signature ? contact.contact_signature.name : "Upload file"}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) =>
                          updateContact(contact.id, "contact_signature", e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                  </div>
                  <div className="flex items-center pt-6">
                    <Check
                      label="Active"
                      checked={contact.contact_is_active}
                      onChange={(v) => updateContact(contact.id, "contact_is_active", v)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </Section>

        {/* ── Section C: Addresses ──────────────────────────────────────── */}
        <Section
          icon={<MapPin className="w-4 h-4" />}
          title="Company Addresses"
          subtitle="Billing, shipping or registered locations (first address is submitted to the server)"
          actions={
            <button
              type="button"
              onClick={addAddress}
              className="text-xs h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary-soft text-primary font-medium hover:bg-primary/15"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          }
        >
          {addresses.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
              No addresses added yet. Click "Add Address" to begin.
            </div>
          ) : (
            addresses.map((address, idx) => (
              <div
                key={address.id}
                className="rounded-lg border border-border p-4 mb-3 last:mb-0 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Address #{idx + 1} · Registered
                    {idx > 0 && (
                      <span className="ml-2 text-amber-600 font-normal normal-case">
                        (extra addresses are stored client-side only)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddress(address.id)}
                    className="w-7 h-7 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <ControlledInput
                    label="Address Line 1"
                    placeholder="350 Mission Street"
                    value={address.company_address_line1}
                    onChange={(v) => updateAddress(address.id, "company_address_line1", v)}
                  />
                  <ControlledInput
                    label="Address Line 2"
                    placeholder="Suite 1200"
                    value={address.company_address_line2}
                    onChange={(v) => updateAddress(address.id, "company_address_line2", v)}
                  />
                  <ControlledSelect
                    label="Country"
                    options={["", ...COUNTRIES]}
                    value={address.company_country}
                    onChange={(v) => updateAddress(address.id, "company_country", v)}
                  />
                  <ControlledInput
                    label="Zipcode"
                    placeholder="94105"
                    value={address.company_zipcode}
                    onChange={(v) => updateAddress(address.id, "company_zipcode", v)}
                  />
                </div>
              </div>
            ))
          )}
        </Section>

        {/* ── Footer actions ────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 pb-12">
          <button
            onClick={handleSaveDraft}
            className="h-10 px-4 text-sm rounded-md border border-border hover:bg-muted"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-10 px-5 text-sm rounded-md bg-primary text-primary-foreground font-medium shadow-glow disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  subtitle,
  actions,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card-elevated p-6 mb-5">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-primary-soft text-primary grid place-items-center">{icon}</div>
          <div>
            <h3 className="font-semibold text-ink">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function ControlledInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-ink-soft mb-1.5">{label}</div>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-md border border-input bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
      />
    </label>
  );
}

function ControlledSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-ink-soft mb-1.5">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-md border border-input bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "Select…" : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border w-4 h-4 accent-primary"
      />
      {label}
    </label>
  );
}