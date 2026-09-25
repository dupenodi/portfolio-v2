"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addPhotos, deletePhoto, movePhoto, prepareUploads, savePhotoAlt } from "./actions";

const NAV = [
  { href: "/admin", label: "overview" },
  { href: "/admin/experience", label: "experience" },
  { href: "/admin/projects", label: "projects" },
  { href: "/admin/writing", label: "writing" },
  { href: "/admin/photos", label: "photos" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav">
      {NAV.map((n) => {
        const on = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined}>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

// A submit button that asks first. Put it inside a form whose action does the deleting.
export function ConfirmButton({ children, message }: { children: React.ReactNode; message: string }) {
  return (
    <button
      type="submit"
      className="admin-button danger"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

type Highlight = { title: string; body: string };

// Rows of title + detail, saved with the rest of the form as JSON in a hidden field.
export function HighlightsEditor({ initial }: { initial: Highlight[] }) {
  const [rows, setRows] = useState<Highlight[]>(initial);
  const set = (i: number, patch: Partial<Highlight>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const swap = (i: number, j: number) =>
    setRows((r) => {
      if (j < 0 || j >= r.length) return r;
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <fieldset className="admin-highlights">
      <legend>highlights</legend>
      <input type="hidden" name="highlights" value={JSON.stringify(rows.filter((r) => r.title.trim()))} />
      {rows.map((row, i) => (
        <div key={i} className="admin-highlight">
          <input value={row.title} placeholder="title, e.g. loop — no-code growth platform" onChange={(e) => set(i, { title: e.target.value })} />
          <textarea value={row.body} rows={3} placeholder="what you did" onChange={(e) => set(i, { body: e.target.value })} />
          <div className="admin-row-tools">
            <button type="button" className="admin-link" onClick={() => swap(i, i - 1)} disabled={i === 0}>
              ↑
            </button>
            <button type="button" className="admin-link" onClick={() => swap(i, i + 1)} disabled={i === rows.length - 1}>
              ↓
            </button>
            <button type="button" className="admin-link" onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>
              remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-button" onClick={() => setRows((r) => [...r, { title: "", body: "" }])}>
        + add highlight
      </button>
    </fieldset>
  );
}

type Photo = { id: string; src: string; alt: string };

// A trip's photos: upload several at once, write alt text, reorder, delete.
export function PhotoManager({ tripId, photos }: { tripId: string; photos: Photo[] }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files];
    startTransition(async () => {
      try {
        setStatus(`uploading ${list.length}…`);
        const targets = await prepareUploads(
          tripId,
          list.map((f) => ({ name: f.name, type: f.type })),
        );
        await Promise.all(
          targets.map(async (t, i) => {
            const res = await fetch(t.url, { method: "PUT", body: list[i], headers: { "content-type": list[i].type, "x-upsert": "false" } });
            if (!res.ok) throw new Error(`${list[i].name}: upload failed (${res.status})`);
          }),
        );
        await addPhotos(
          tripId,
          targets.map((t) => t.path),
        );
        setStatus(`added ${list.length}.`);
        router.refresh();
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "upload failed");
      }
    });
  };

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  return (
    <section className="admin-photos" aria-busy={busy}>
      <label className="admin-drop">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => upload(e.target.files)} disabled={busy} />
        <span>{busy ? "working…" : "choose photos to upload"}</span>
      </label>
      {status ? <p className="admin-note">{status}</p> : null}
      <ul className="admin-photo-grid">
        {photos.map((p, i) => (
          <li key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, straight from storage */}
            <img src={p.src} alt={p.alt} loading="lazy" />
            <input
              defaultValue={p.alt}
              placeholder="alt text"
              aria-label="alt text"
              onBlur={(e) => e.target.value !== p.alt && run(() => savePhotoAlt(p.id, e.target.value))}
            />
            <div className="admin-row-tools">
              <button type="button" className="admin-link" disabled={busy || i === 0} onClick={() => run(() => movePhoto(p.id, tripId, -1))}>
                ←
              </button>
              <button type="button" className="admin-link" disabled={busy || i === photos.length - 1} onClick={() => run(() => movePhoto(p.id, tripId, 1))}>
                →
              </button>
              <button type="button" className="admin-link" disabled={busy} onClick={() => confirm("delete this photo?") && run(() => deletePhoto(p.id))}>
                delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
