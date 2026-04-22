import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";

const LOGIN_URL = "https://onboard-form-7.onrender.com/signin/";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", email.trim());
      fd.append("password", password);

      const res = await fetch(LOGIN_URL, {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        // Optionally persist email for "remember me"
        if (remember) localStorage.setItem("remembered_email", email.trim());
        else localStorage.removeItem("remembered_email");

        navigate("/portal_dashboard");
      } else {
        // Try to parse a JSON error message from the server
        let msg = `Login failed (${res.status})`;
        try {
          const data = await res.json();
          msg = data.message || data.error || data.detail || msg;
        } catch {
          const text = await res.text();
          if (text) msg = text;
        }
        setError(msg);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Allow submitting with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Visual side */}
      <div className="hidden md:flex relative overflow-hidden bg-sidebar text-sidebar-foreground p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            N
          </div>
          <span className="font-semibold tracking-tight text-lg">
            Nexus<span className="text-primary">CRM</span>
          </span>
        </Link>
        <div className="relative z-10">
          <div className="text-xs uppercase tracking-widest text-sidebar-foreground/60 mb-3">
            Enterprise CRM
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Operate with clarity.<br />Automate with confidence.
          </h2>
          <p className="mt-4 text-sidebar-foreground/70 max-w-md">
            Governed workflows, live monitoring and full audit trail across every client, campaign
            and transaction.
          </p>
        </div>
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full gradient-primary opacity-30 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-[320px] h-[320px] rounded-full bg-primary opacity-20 blur-3xl" />
        <div className="text-xs text-sidebar-foreground/50 relative z-10">
          SOC 2 · ISO 27001 · GDPR ready
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Sign in to your Nexus workspace</p>

          {/* Error banner */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mt-7 space-y-4" onKeyDown={handleKeyDown}>
            {/* Email — maps to SignIn.email */}
            <Field
              icon={<Mail className="w-4 h-4" />}
              type="email"
              label="Work email"
              placeholder="you@company.com"
              value={email}
              onChange={setEmail}
            />

            {/* Password — maps to SignIn.password */}
            <Field
              icon={<Lock className="w-4 h-4" />}
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-soft">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-border"
                />
                Remember me
              </label>
              <a href="#" className="text-primary font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md font-medium shadow-glow hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px bg-border flex-1" /> OR <div className="h-px bg-border flex-1" />
            </div>

            <button className="w-full h-11 inline-flex items-center justify-center gap-2.5 border border-border rounded-md bg-surface hover:bg-muted text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-muted-foreground">
              New user?{" "}
              <Link to="/onboarding" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({
  icon,
  label,
  value,
  onChange,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-ink-soft mb-1.5">{label}</div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pl-9 pr-3 rounded-md border border-input bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
        />
      </div>
    </label>
  );
}