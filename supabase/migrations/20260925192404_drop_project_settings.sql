-- Projects are their own table now (their hidden flags were carried over when they were imported), so the old
-- per-repo overrides for GitHub-sourced projects go.
drop table public.project_settings;
