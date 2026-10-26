import type { ClaimStatus, ItemStatus, ReportType } from "../api/types";

export function TypeLabel({ type }: { type: ReportType }) {
  return <span className={`text-sm font-medium ${type === "Lost" ? "text-lost" : "text-found"}`}>{type}</span>;
}

const statusColour: Record<ItemStatus | ClaimStatus, string> = {
  Open: "text-ink",
  Pending: "text-ink",
  Claimed: "text-claimed",
  Approved: "text-found",
  Returned: "text-muted",
  Rejected: "text-lost",
  Archived: "text-muted",
};

export function StatusBadge({ status }: { status: ItemStatus | ClaimStatus }) {
  return (
    <span className={`text-sm ${statusColour[status]}`}>
      {status === "Pending" && <span className="bg-tag-soft px-1">Pending</span>}
      {status !== "Pending" && status}
    </span>
  );
}
