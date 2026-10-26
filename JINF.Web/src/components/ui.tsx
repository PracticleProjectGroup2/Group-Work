import type { ReactNode } from "react";

export function PageHeader({ title, meta, action }: { title: string; meta?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
      <h1 className="text-2xl font-bold">
        {title}
        {meta !== undefined && <span className="ml-3 text-base font-normal text-muted">{meta}</span>}
      </h1>
      {action}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-muted text-sm border-t border-line">{children}</p>;
}

export function ErrorNote({ message }: { message: string }) {
  return <p className="text-sm text-lost border-l-2 border-lost pl-3 py-1">{message}</p>;
}
