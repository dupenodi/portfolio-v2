import { getGitHubRepos } from "@/lib/github";
import { adminDb } from "@/lib/supabase";
import { saveProject } from "../../actions";

// Repos come from GitHub (the ones tagged for the portfolio). Here they can be hidden, ordered, or described differently.
export default async function Projects() {
  const [repos, { data }] = await Promise.all([getGitHubRepos(), adminDb().from("project_settings").select("*")]);
  const settings = new Map((data ?? []).map((s) => [s.repo_name as string, s]));

  return (
    <>
      <header className="admin-head">
        <h1>projects</h1>
      </header>
      <p className="admin-note">
        pulled from github. order: lower numbers first, blanks after in github&apos;s order. a description here replaces
        the repo&apos;s.
      </p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>repo</th>
            <th>order</th>
            <th>description on the site</th>
            <th>hide</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {repos.map((r) => {
            const s = settings.get(r.name);
            const form = `project-${r.id}`;
            return (
              <tr key={r.id} data-muted={s?.hidden || undefined}>
                <td>
                  <a href={r.html_url} target="_blank" rel="noreferrer">
                    {r.name}
                  </a>
                  <form id={form} action={saveProject}>
                    <input type="hidden" name="repo_name" value={r.name} />
                  </form>
                </td>
                <td>
                  <input form={form} name="sort" type="number" defaultValue={s?.sort ?? ""} className="admin-narrow" aria-label="order" />
                </td>
                <td>
                  <input form={form} name="blurb" defaultValue={s?.blurb ?? ""} placeholder={r.description ?? ""} aria-label="description" />
                </td>
                <td>
                  <input form={form} name="hidden" type="checkbox" defaultChecked={s?.hidden ?? false} aria-label="hide" />
                </td>
                <td>
                  <button form={form} type="submit" className="admin-button">
                    save
                  </button>
                </td>
              </tr>
            );
          })}
          {repos.length === 0 ? (
            <tr>
              <td colSpan={5} className="admin-empty">
                no repos came back from github.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </>
  );
}
