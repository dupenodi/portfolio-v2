-- A picture of each project: a screenshot or the product's own link preview, so the site shows the thing rather than
-- what it was written in. Object path in the public "photos" bucket (under projects/), or a full URL.

alter table public.projects add column image text;
