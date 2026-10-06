import Link from "next/link";
import { adminDb } from "@/lib/supabase";

export default async function Overview() {
  const db = adminDb();
  const count = async (table: string, filter?: [string, boolean]) => {
    let q = db.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return (await q).count ?? 0;
  };
  const [experience, projects, hiddenProjects, posts, drafts, trips, photos] = await Promise.all([
    count("experience"),
    count("projects", ["published", true]),
    count("projects", ["published", false]),
    count("posts", ["draft", false]),
    count("posts", ["draft", true]),
    count("trips"),
    count("photos"),
  ]);

  const cards = [
    { href: "/admin/experience", label: "experience", value: experience, note: "roles and education" },
    { href: "/admin/projects", label: "projects", value: projects, note: `shown · ${hiddenProjects} hidden` },
    { href: "/admin/writing", label: "writing", value: posts, note: `published · ${drafts} draft${drafts === 1 ? "" : "s"}` },
    { href: "/admin/photos", label: "photos", value: photos, note: `across ${trips} trip${trips === 1 ? "" : "s"}` },
  ];

  return (
    <>
      <header className="admin-head">
        <h1>overview</h1>
        <div className="admin-actions">
          <Link href="/admin/writing/new" className="admin-button primary">
            new essay
          </Link>
          <Link href="/admin/photos/new" className="admin-button">
            new trip
          </Link>
        </div>
      </header>
      <ul className="admin-cards">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href}>
              <span className="admin-card-label">{c.label}</span>
              <span className="admin-card-value">{c.value}</span>
              <span className="admin-card-note">{c.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
