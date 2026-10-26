import { Link } from "react-router";
import type { ItemReport } from "../api/types";
import { StatusBadge, TypeLabel } from "./Badges";
import { formatDate, tagNumber } from "../lib/format";

// One row of the lost property register. The tag number is styled like the
// manila tag reception would tie to the item.
export function ItemList({ items }: { items: ItemReport[] }) {
  return (
    <ul className="border-t border-ink">
      {items.map((item) => <ItemRow key={item.id} item={item} />)}
    </ul>
  );
}

function ItemRow({ item }: { item: ItemReport }) {
  return (
    <li className="border-b border-line">
      <Link to={`/items/${item.id}`} className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[5rem_1fr_9rem_7rem_6rem] gap-x-4 gap-y-1 py-3 items-baseline hover:bg-card">
        <span className="font-mono text-xs bg-tag-soft px-1.5 py-0.5 justify-self-start">{tagNumber(item.id)}</span>

        <div className="min-w-0">
          <p className="font-medium group-hover:underline underline-offset-2">{item.title}</p>
          <p className="text-sm text-muted truncate">
            {item.category.isSensitive ? "Details hidden. Ask at reception." : item.description}
          </p>
        </div>

        <span className="sm:hidden"><TypeLabel type={item.reportType} /></span>

        <span className="hidden sm:block text-sm">{item.location.name}</span>
        <span className="hidden sm:block text-sm font-mono text-muted">{formatDate(item.eventDate)}</span>
        <span className="hidden sm:block text-right"><StatusBadge status={item.status} /></span>

        <span className="sm:hidden col-start-2 col-span-2 text-xs text-muted">
          {item.location.name} · {formatDate(item.eventDate)} · {item.status}
        </span>
      </Link>
    </li>
  );
}
