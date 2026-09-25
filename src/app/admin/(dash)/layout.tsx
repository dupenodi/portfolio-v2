import { requireAdmin } from "@/lib/admin-auth";
import { supabaseConfigured } from "@/lib/supabase";
import { logout } from "../actions";
import { AdminNav } from "../ui";

export default async function Dashboard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <p className="admin-brand">dupenodi / admin</p>
        <AdminNav />
        <div className="admin-side-foot">
          <a href="/" target="_blank" rel="noreferrer">
            view site ↗
          </a>
          <form action={logout}>
            <button type="submit" className="admin-link">
              sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">
        {!supabaseConfigured() || !process.env.SUPABASE_SECRET_KEY ? (
          <p className="admin-error">
            supabase isn&apos;t connected: set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY.
          </p>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
