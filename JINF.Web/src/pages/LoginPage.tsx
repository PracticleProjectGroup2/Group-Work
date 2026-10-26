import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { ErrorNote, Field } from "../components/ui";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch {
      setError("Incorrect email or password.");
    }
  }

  return (
    <AuthCard title="Log in" footer={<>New here? <Link to="/register" className="text-ink link">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Campus email">
          <input type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input type="password" className="input" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <ErrorNote message={error} />}
        <button className="btn btn-primary">Log in</button>
        {import.meta.env.VITE_USE_MOCKS !== "false" && (
          <p className="text-xs text-muted">Mock mode: any password works. Emails starting with “admin” log in as an administrator.</p>
        )}
      </form>
    </AuthCard>
  );
}

export function AuthCard({ title, footer, children }: { title: string; footer: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {children}
      <p className="text-sm text-muted mt-6 pt-4 border-t border-line">{footer}</p>
    </div>
  );
}
