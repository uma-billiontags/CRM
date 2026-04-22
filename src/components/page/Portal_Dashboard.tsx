import { Link, useLocation } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  TrendingUp, TrendingDown, Plus, ArrowRight,
  LayoutDashboard, Megaphone, Building2, Wallet,
  Users, FileText, Settings, LogOut, Bell,
} from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────

const kpis = [
  { label: "Active Campaigns", value: "47", delta: "+3" },
  { label: "Total Impressions", value: "2.4M", delta: "+12.5%" },
  { label: "Wallet Balance", value: "$18,420", delta: "-$340" },
  { label: "Pending Approvals", value: "6", delta: "+2" },
];

const performance = [
  { day: "Mon", impressions: 42000, clicks: 3200 },
  { day: "Tue", impressions: 58000, clicks: 4100 },
  { day: "Wed", impressions: 51000, clicks: 3800 },
  { day: "Thu", impressions: 67000, clicks: 5200 },
  { day: "Fri", impressions: 73000, clicks: 5900 },
  { day: "Sat", impressions: 48000, clicks: 3600 },
  { day: "Sun", impressions: 39000, clicks: 2900 },
];

const activity = [
  { user: "Aarav Shah", action: "approved campaign", target: "Summer Sale Q3", time: "2 min ago" },
  { user: "Priya Nair", action: "topped up wallet for", target: "Northwind Trading", time: "14 min ago" },
  { user: "Dev Mehta", action: "submitted onboarding for", target: "Apex Corp", time: "1 hr ago" },
  { user: "Riya Joshi", action: "created insertion order in", target: "Brand Awareness", time: "3 hr ago" },
];

export const campaigns = [
  { id: "CP-1021", name: "Summer Sale Q3", client: "Northwind Trading", status: "active", start: "1 Jul", end: "31 Jul", health: 91 },
  { id: "CP-1019", name: "Brand Awareness", client: "Apex Corp", status: "active", start: "15 Jun", end: "15 Aug", health: 74 },
  { id: "CP-1015", name: "Product Launch", client: "BlueSky Media", status: "paused", start: "1 Jun", end: "30 Jun", health: 43 },
  { id: "CP-1012", name: "Retargeting Wave", client: "FinEdge Ltd", status: "pending", start: "20 Apr", end: "20 May", health: 62 },
  { id: "CP-1008", name: "Year-End Push", client: "Northwind Trading", status: "active", start: "1 Apr", end: "30 Apr", health: 88 },
];

// ── Status Badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-success/10 text-success",
    live: "bg-success/10 text-success",
    paused: "bg-warning/10 text-warning",
    pending: "bg-muted text-muted-foreground",
    rejected: "bg-destructive/10 text-destructive",
    draft: "bg-muted text-muted-foreground",
    completed: "bg-primary/10 text-primary",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status.toLowerCase()] ?? map.pending}`}>
      {status}
    </span>
  );
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  to: "/portal_dashboard" },
  { icon: Megaphone,       label: "Campaigns",  to: "/portal_campaigns" },
  { icon: Building2,       label: "Clients",    to: "/portal_clients" },
  { icon: Wallet,          label: "Wallet",     to: "/portal_wallet" },
  { icon: Users,           label: "Contacts",   to: "/portal_contacts" },
  { icon: FileText,        label: "Reports",    to: "/portal_reports" },
];

// ── Portal Shell ──────────────────────────────────────────────────────────────

export function PortalShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border hidden md:flex">
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">N</div>
            <span className="font-semibold tracking-tight">Nexus<span className="text-primary">CRM</span></span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border space-y-0.5">
          <Link to="/portal_settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <Link to="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
            <LogOut className="w-4 h-4" /> Log out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1">
            <h1 className="text-base font-semibold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button className="relative w-9 h-9 grid place-items-center rounded-md hover:bg-muted text-muted-foreground">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>
          <div className="w-8 h-8 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">AS</div>
          {actions && <div className="flex items-center gap-2 ml-1">{actions}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function Portal_Dashboard() {
  return (
    <PortalShell
      title="Welcome back, Aarav"
      subtitle="Here's what's happening across your accounts today."
      actions={
        <>
          <button className="h-9 px-3 text-sm rounded-md border border-border hover:bg-muted">Export</button>
          <button className="h-9 px-3 text-sm rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center gap-1.5 shadow-glow">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => {
          const positive = !k.delta.startsWith("-");
          return (
            <div key={k.label} className="card-elevated p-5">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</div>
              <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {k.delta} <span className="text-muted-foreground font-normal">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Campaign Performance</h3>
              <p className="text-xs text-muted-foreground">Last 7 days · all active campaigns</p>
            </div>
            <div className="flex gap-1 bg-muted rounded-md p-0.5 text-xs">
              {["7D", "30D", "90D"].map((p, i) => (
                <button key={p} className={`px-2.5 py-1 rounded ${i === 0 ? "bg-surface shadow-sm font-medium" : "text-muted-foreground"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 89% 51%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217 89% 51%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(220 9% 60%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(220 9% 60%)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} />
                <Area type="monotone" dataKey="impressions" stroke="hsl(217 89% 51%)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="clicks" stroke="hsl(142 71% 45%)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activity</h3>
            <button className="text-xs text-primary font-medium">View all</button>
          </div>
          <ul className="space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
                  {a.user.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="text-sm leading-snug">
                  <span className="font-medium">{a.user}</span>{" "}
                  <span className="text-ink-soft">{a.action}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Campaigns table */}
      <div className="card-elevated overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <div>
            <h3 className="font-semibold">Active Campaigns</h3>
            <p className="text-xs text-muted-foreground">Latest 5 of 47</p>
          </div>
          <Link to="/portal_campaigns" className="text-xs text-primary font-medium inline-flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
              <th className="px-6 py-2.5 font-medium">Campaign</th>
              <th className="px-4 py-2.5 font-medium">Client</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Schedule</th>
              <th className="px-4 py-2.5 font-medium">Health</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-6 py-3">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.id}</div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.client}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-xs text-ink-soft">{c.start} → {c.end}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className={`h-full rounded-full ${c.health > 80 ? "bg-success" : c.health > 50 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${c.health}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-9">{c.health}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}