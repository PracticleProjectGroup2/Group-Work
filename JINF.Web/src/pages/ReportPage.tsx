import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import * as api from "../api/client";
import type { ReportType } from "../api/types";
import { useAsync } from "../lib/useAsync";
import { ErrorNote, Field, PageHeader } from "../components/ui";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ReportPage() {
  const navigate = useNavigate();
  const categories = useAsync(api.getCategories);
  const locations = useAsync(api.getLocations);

  const [reportType, setReportType] = useState<ReportType>("Lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [photo, setPhoto] = useState<File | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensitive = categories.data?.find((c) => c.id === Number(categoryId))?.isSensitive;

  function pickPhoto(file?: File) {
    setError(null);
    if (file && !PHOTO_TYPES.includes(file.type)) return setError("Photos must be JPG, PNG or WEBP.");
    if (file && file.size > MAX_PHOTO_BYTES) return setError("Photos must be 5 MB or smaller.");
    setPhoto(file);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const item = await api.createReport({
        reportType, title: title.trim(), description: description.trim(),
        categoryId: Number(categoryId), locationId: Number(locationId), eventDate,
        photo: sensitive ? undefined : photo,
      });
      navigate(`/items/${item.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="Report an item" />

      <form onSubmit={submit} className="space-y-5">
        <fieldset>
          <legend className="text-sm font-medium mb-2">I have…</legend>
          <div className="flex gap-6">
            {(["Lost", "Found"] as const).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="reportType" className="accent-ink" checked={reportType === t} onChange={() => setReportType(t)} />
                {t === "Lost" ? "lost something" : "found something"}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="What is it?">
          <input className="input" required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Black Lenovo charger" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Category">
            <select className="input" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>Choose…</option>
              {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label={reportType === "Lost" ? "Where did you last have it?" : "Where did you find it?"}>
            <select className="input" required value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="" disabled>Choose…</option>
              {locations.data?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Date">
          <input type="date" className="input sm:w-52" required value={eventDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setEventDate(e.target.value)} />
        </Field>

        <Field label="Description" hint="Colour, brand, marks. Leave out anything only the owner should know.">
          <textarea className="input min-h-28" required maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        {sensitive ? (
          <p className="text-sm border-l-2 border-tag pl-3 py-1">
            Cards and ID documents are listed without photos to protect the owner's personal information.
          </p>
        ) : (
          <Field label="Photo (optional)" hint="JPG, PNG or WEBP, up to 5 MB.">
            <input type="file" accept={PHOTO_TYPES.join(",")} onChange={(e) => pickPhoto(e.target.files?.[0])} className="block text-sm file:mr-3 file:border file:border-ink file:bg-transparent file:px-3 file:py-1.5 file:font-medium hover:file:border-ink" />
          </Field>
        )}

        {error && <ErrorNote message={error} />}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Submit report"}</button>
        </div>
      </form>
    </div>
  );
}
