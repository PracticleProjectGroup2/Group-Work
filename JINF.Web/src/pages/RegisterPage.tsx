import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import * as api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ErrorNote, Field } from "../components/ui";
import { AuthCard } from "./LoginPage";

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.register(fullName.trim(), email.trim(), password);
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <AuthCard title="Create an account" footer={<>Already registered? <Link to="/login" className="text-ink link">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name">
          <input className="input" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Campus email">
          <input type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input type="password" className="input" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        {/* POPIA: tell users what is collected and why before they register */}
        <label className="flex gap-2.5 items-start text-sm">
          <input type="checkbox" className="mt-1 accent-ink" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span className="text-muted">
            I agree that JINF stores my name and email to manage my lost and found reports. Nothing else is collected,
            and I can delete my account at any time.
          </span>
        </label>

        {error && <ErrorNote message={error} />}
        <button className="btn btn-primary">Create account</button>
      </form>
    </AuthCard>
  );
}
