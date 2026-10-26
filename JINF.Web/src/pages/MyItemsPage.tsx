import { Link } from "react-router";
import * as api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useAsync } from "../lib/useAsync";
import { ItemList } from "../components/ItemList";
import { StatusBadge } from "../components/Badges";
import { Empty, PageHeader } from "../components/ui";
import { formatDate } from "../lib/format";

export function MyItemsPage() {
  const { user } = useAuth();
  const reports = useAsync(() => api.getMyItems(user!.id), [user?.id]);
  const claims = useAsync(api.getMyClaims);

  return (
    <>
      <PageHeader title="My items" />

      <h2 className="font-semibold mb-2">Reports</h2>
      {reports.data?.length === 0 && <Empty>You haven't reported anything. <Link to="/report" className="link">Report an item</Link></Empty>}
      {reports.data && reports.data.length > 0 && <ItemList items={reports.data} />}

      <h2 className="font-semibold mt-10 mb-2">Claims</h2>
      {claims.data?.length === 0 && <Empty>No claims yet.</Empty>}
      {claims.data && claims.data.length > 0 && (
        <ul className="border-t border-ink">
          {claims.data.map((c) => (
            <li key={c.id} className="border-b border-line py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <Link to={`/items/${c.itemReportId}`} className="font-medium hover:underline underline-offset-2">{c.itemTitle}</Link>
              <span className="text-xs text-muted font-mono">{formatDate(c.createdAt)}</span>
              <span className="ml-auto"><StatusBadge status={c.status} /></span>
              {c.decisionReason && <p className="w-full text-sm text-muted">Reason: {c.decisionReason}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
