import { useState } from "react";
import { Link } from "react-router";
import * as api from "../api/client";
import type { ReportType } from "../api/types";
import { useAsync } from "../lib/useAsync";
import { ItemList } from "../components/ItemList";
import { Empty, ErrorNote, PageHeader } from "../components/ui";
import { useAuth } from "../auth/AuthContext";

const tabs: { value: ReportType | ""; label: string }[] = [
  { value: "Found", label: "Handed in" },
  { value: "Lost", label: "Reported lost" },
  { value: "", label: "Everything" },
];

export function BrowsePage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [type, setType] = useState<ReportType | "">("Found");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");

  const categories = useAsync(api.getCategories);
  const locations = useAsync(api.getLocations);
  const items = useAsync(
    () => api.getItems({ q, type: type || undefined, categoryId: Number(categoryId) || undefined, locationId: Number(locationId) || undefined }),
    [q, type, categoryId, locationId],
  );

  return (
    <>
      <PageHeader
        title="Lost and found"
        meta={items.data && `${items.data.length} item${items.data.length === 1 ? "" : "s"}`}
        action={user ? <Link to="/report" className="btn btn-primary">Report an item</Link> : <Link to="/login" className="link text-sm">Log in to report or claim</Link>}
      />

      <div className="flex gap-6 mb-4 text-sm">
        {tabs.map((t) => (
          <button
            key={t.label}
            onClick={() => setType(t.value)}
            className={`pb-1 border-b-2 ${type === t.value ? "border-ink font-semibold" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 mb-6 sm:grid-cols-[1fr_11rem_11rem]">
        <input className="input" type="search" placeholder="Search: charger, hoodie, keys…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Any category</option>
          {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">Anywhere</option>
          {locations.data?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {items.error && <ErrorNote message={items.error} />}
      {items.data && items.data.length === 0 && <Empty>Nothing matches. Try fewer filters.</Empty>}
      {items.data && items.data.length > 0 && <ItemList items={items.data} />}
    </>
  );
}
