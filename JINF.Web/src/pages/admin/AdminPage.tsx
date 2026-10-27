import { useState } from "react";
import { Link } from "react-router";
import * as api from "../../api/client";
import type { Claim } from "../../api/types";
import { useAsync } from "../../lib/useAsync";
import { StatusBadge } from "../../components/Badges";
import { Empty, ErrorNote, PageHeader } from "../../components/ui";
import { formatDate } from "../../lib/format";

export function AdminPage() {
  const stats = useAsync(api.getStats);
  const claims = useAsync(api.getClaims);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const refresh = () => { stats.reload(); claims.reload(); };
  async function markCollected(claim: Claim) {
  const confirmed = window.confirm(
    `Confirm that "${claim.itemTitle}" has been handed to ${claim.claimantName}?`
  );

  if (!confirmed) return;

  setWorkingId(claim.id);
  setPickupError(null);

  try {
    await api.markItemReturned(claim.itemReportId);
    refresh();
  } catch (err) {
    setPickupError(
      err instanceof Error
        ? err.message
        : "Could not record the collection."
    );
  } finally {
    setWorkingId(null);
  }
}

  const pending =
  claims.data?.filter((c) => c.status === "Pending") ?? [];

const awaitingPickup =
  claims.data?.filter(
    (c) =>
      c.status === "Approved" &&
      c.itemStatus === "Claimed"
  ) ?? [];

const decided =
  claims.data?.filter((c) => c.status !== "Pending") ?? [];
  
  return (
    <>
      <PageHeader title="Reception" />

      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-ink mb-10">
        <Stat label="Open items" value={stats.data?.open} />
        <Stat label="Claimed, awaiting pickup" value={stats.data?.claimed} />
        <Stat label="Returned" value={stats.data?.returned} />
        <Stat label="Claims to review" value={stats.data?.pendingClaims} highlight />
      </div>

      <section>
        <h2 className="font-semibold mb-3">Claims to review</h2>
        {claims.data && pending.length === 0 && <Empty>All caught up.</Empty>}
        <div className="border-t border-ink">
          {pending.map((c) => <ClaimReview key={c.id} claim={c} onDone={refresh} />)}
        </div>
      </section>
      
<section className="mt-10">
  <h2 className="font-semibold mb-3">Awaiting pickup</h2>

  <p className="text-sm text-muted mb-3">
    Confirm the student's identity and hand over the item
    before recording the collection.
  </p>

  {pickupError && <ErrorNote message={pickupError} />}

  {claims.data && awaitingPickup.length === 0 && (
    <Empty>No items are awaiting pickup.</Empty>
  )}

  <div className="border-t border-ink">
    {awaitingPickup.map((claim) => (
      <div key={claim.id} className="border-b border-line py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/items/${claim.itemReportId}`}
            className="font-semibold hover:underline"
          >
            {claim.itemTitle}
          </Link>

          <span className="text-sm text-muted">
            Collecting student: {claim.claimantName}
          </span>

          <span className="ml-auto">
            <StatusBadge status={claim.status} />
          </span>
        </div>

        <button
          className="btn btn-primary mt-3"
          disabled={workingId !== null}
          onClick={() => markCollected(claim)}
        >
          {workingId === claim.id
            ? "Recording collection..."
            : "Mark as collected"}
        </button>
      </div>
    ))}
  </div>
</section>


      {decided.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold mb-3">Recently decided</h2>
          <ul className="border-t border-ink text-sm">
            {decided.map((c) => (
              <li key={c.id} className="border-b border-line py-2.5 flex items-center gap-3">
                <span className="font-medium">{c.itemTitle}</span>
                <span className="text-muted">{c.claimantName}</span>
                <span className="ml-auto"><StatusBadge status={c.status} /></span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value?: number; highlight?: boolean }) {
  return (
    <div className={`p-4 border-line md:[&:not(:last-child)]:border-r ${highlight ? "bg-tag-soft" : ""}`}>
      <div className="font-mono text-3xl font-medium">{value ?? "–"}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}

function ClaimReview({ claim, onDone }: { claim: Claim; onDone: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function decide(approve: boolean) {
    await api.decideClaim(claim.id, approve, approve ? undefined : reason.trim());
    onDone();
  }

  return (
    <div className="border-b border-line py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Link to={`/items/${claim.itemReportId}`} className="font-semibold hover:underline">{claim.itemTitle}</Link>
        <span className="text-sm text-muted">claimed by {claim.claimantName}</span>
        <span className="text-xs text-muted font-mono ml-auto">{formatDate(claim.createdAt)}</span>
      </div>
      <blockquote className="mt-3 border-l-2 border-tag pl-3 text-sm">{claim.proofOfOwnership}</blockquote>

      {rejecting ? (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input className="input" autoFocus placeholder="Reason for rejecting" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn btn-primary shrink-0" disabled={!reason.trim()} onClick={() => decide(false)}>Reject claim</button>
          <button className="btn btn-ghost shrink-0" onClick={() => setRejecting(false)}>Cancel</button>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary" onClick={() => decide(true)}>Approve</button>
          <button className="btn btn-ghost" onClick={() => setRejecting(true)}>Reject…</button>
        </div>
      )}
    </div>
  );
}
