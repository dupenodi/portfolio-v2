// The studio's downloads, shared by the page (which preloads them with the HTML) and the stage (which loads them).
// Small screens get half-resolution textures: a phone-sized frame never samples past them, and it's ~1 MB less.

export const SMALL_SCREEN = "(max-width: 700px), (max-height: 500px)";
export const LARGE_SCREEN = "(min-width: 701px) and (min-height: 501px)";

export const BASE = "/character";

/** Files that exist in a full and a small ("-sm") version. */
export const sized = (small: boolean) => ({
  model: `${BASE}/model${small ? "-sm" : ""}.glb`,
  roughness: `${BASE}/roughness${small ? "-sm" : ""}.webp`,
  sofa: `${BASE}/decor/props/sofa${small ? "-sm" : ""}.glb`,
  plant: `${BASE}/decor/props/plant${small ? "-sm" : ""}.glb`,
});

/** The same for every screen. */
export const SHARED = [
  `${BASE}/decor/painting.glb`,
  `${BASE}/anims/Seated.glb`,
  `${BASE}/decor/tweet-flag.webp`,
];
