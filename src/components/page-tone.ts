// The page's colour (`--studio`) and ink (`data-tone`) follow the studio floor at the bottom of the frame. The studio
// measures the floor once its light settles; these are the fallbacks until it has, and each measurement is remembered
// per mode, so the next visit (and the next switch) starts on the right colour instead of flashing the wrong one.

import type { Mode } from "./daylight";

/** The floor as measured at the bottom of a desktop frame, in each mode. */
export const PAGE_TONE: Record<Mode, string> = {
  light: "rgb(233 221 209)",
  dark: "rgb(55 56 71)",
};

export const toneKey = (mode: Mode) => `studio-tone-${mode}`;

/** The colour to show for `mode`: the last one measured, else the fallback. */
export function pageToneFor(mode: Mode) {
  try {
    const saved = localStorage.getItem(toneKey(mode));
    if (saved && /^rgb\(\d{1,3} \d{1,3} \d{1,3}\)$/.test(saved)) return saved;
  } catch {}
  return PAGE_TONE[mode];
}

export function setPageTone(color: string, tone: Mode) {
  const root = document.documentElement;
  root.style.setProperty("--studio", color);
  root.dataset.tone = tone;
}

// Runs in <head> before the first paint (see the layout), so a visitor who left in dark mode doesn't get a light page
// first. Mirrors `initialMode` and `pageToneFor`; kept tiny and dependency-free.
export const PAGE_TONE_SCRIPT = `(function(){try{
var q=new URLSearchParams(location.search).get("mode");
var m=q==="light"||q==="dark"?q:localStorage.getItem("studio-mode");
if(m!=="light"&&m!=="dark")m="light";
var t=localStorage.getItem("studio-tone-"+m);
if(!t||!/^rgb\\(\\d{1,3} \\d{1,3} \\d{1,3}\\)$/.test(t))t=${JSON.stringify(PAGE_TONE)}[m];
var r=document.documentElement;r.style.setProperty("--studio",t);r.dataset.tone=m;
}catch(e){}})()`;
