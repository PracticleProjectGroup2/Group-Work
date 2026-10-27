import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import * as api from "../api/client";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../auth/AuthContext";
import { StatusBadge, TypeLabel } from "../components/Badges";
import { ErrorNote, Field } from "../components/ui";
import { formatDate, tagNumber } from "../lib/format";

export function ItemPage() {
  const id = Number(useParams().id);
  const { user } = useAuth();
  const { data: item, error } = useAsync(() => api.getItem(id), [id]);

  if (error) return <ErrorNote message={error} />;
  if (!item) return null;

  const sensitive = item.category.isSensitive;
  const canClaim =
  !!user &&
  item.reportType === "Found" &&
  item.status === "Open";

  console.log("Claim form diagnostic:", {
  user,
  reportType: item.reportType,
  status: item.status,
  canClaim,
});

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <article>
        <Link to="/" className="text-sm link">All items</Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-sm bg-tag-soft px-1.5">{tagNumber(item.id)}</span>
          <TypeLabel type={item.reportType} />
          <StatusBadge status={item.status} />
        </div>
        <h1 className="text-3xl font-bold mt-3">{item.title}</h1>

        {item.photoUrl && !sensitive && (
          <img src={item.photoUrl} alt={item.title} className="mt-6 border border-line max-h-96 object-cover" />
        )}

        <p className="mt-6 leading-relaxed max-w-prose">
          {sensitive
            ? "This item may contain personal information, so its details and photo are hidden. If you think it's yours, submit a claim and bring proof of identity to reception."
            : item.description}
        </p>

        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-ink pt-4 text-sm">
          <div><dt className="text-muted">Category</dt><dd className="font-medium mt-0.5">{item.category.name}</dd></div>
          <div><dt className="text-muted">{item.reportType === "Lost" ? "Last seen" : "Found at"}</dt><dd className="font-medium mt-0.5">{item.location.name}</dd></div>
          <div><dt className="text-muted">Date</dt><dd className="font-medium mt-0.5 font-mono">{formatDate(item.eventDate)}</dd></div>
        </dl>
      </article>

      <aside>
        {canClaim ? (
          <ClaimForm itemId={item.id} />
        ) : (
          <div className="border-t-2 border-ink pt-4 text-sm text-muted">
            {!user ? (
              <><Link to="/login" className="text-ink link">Log in</Link> to claim this item.</>
            ) : item.status !== "Open" ? (
              "This item is no longer open for claims."
            ) : item.reportType === "Lost" ? (
              <div>
                <p>Looking for your missing item?</p>
                <Link
                  to="/?type=Found"
                  className="text-ink link font-medium mt-2 inline-block"
                >
                  Browse Found Items    
                </Link>
              </div>
            ) : (

              "You reported this item."
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function ClaimForm({ itemId }: { itemId: number }) {
  const [proof, setProof] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.createClaim(itemId, proof.trim());
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (sent)
    return (
      <div className="border-t-2 border-found pt-4">
        <p className="font-semibold">Claim submitted</p>
        <p className="text-sm text-muted mt-1">Reception will review it. You can follow its status under <Link to="/mine" className="link">My items</Link>.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="border-t-2 border-ink pt-4 space-y-4">
      <div>
        <p className="font-semibold">Is this yours?</p>
        <p className="text-sm text-muted mt-1">Describe something only the owner would know. Reception uses this to check claims.</p>
      </div>
      <Field label="Proof of ownership">
        <textarea className="input min-h-28" required minLength={10} value={proof} onChange={(e) => setProof(e.target.value)} placeholder="e.g. There's a sticker on the bottom and a crack in the corner" />
      </Field>
      {error && <ErrorNote message={error} />}
      <button className="btn btn-primary">Submit claim</button>
    </form>
  );
}
