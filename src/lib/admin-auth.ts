import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// /admin is one person with a username and password from env. A successful login sets a signed, httpOnly cookie
// holding only its expiry; every admin page and action checks it with requireAdmin().

const COOKIE = "admin_session";
const WEEK = 60 * 60 * 24 * 7;

function secrets() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const key = process.env.ADMIN_SESSION_SECRET;
  if (!username || !password || !key || key.length < 32) return null;
  return { username, password, key };
}

export function adminConfigured() {
  return secrets() !== null;
}

// Compares digests so the check takes the same time however much of the guess is right.
function same(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64url");
}

export function checkCredentials(username: string, password: string) {
  const s = secrets();
  if (!s) return false;
  // Both are always compared, so a wrong username isn't faster to reject than a wrong password.
  const user = same(username, s.username);
  const pass = same(password, s.password);
  return user && pass;
}

export async function startSession() {
  const s = secrets();
  if (!s) throw new Error("Admin isn't configured.");
  const expires = Math.floor(Date.now() / 1000) + WEEK;
  const store = await cookies();
  store.set(COOKIE, `${expires}.${sign(String(expires), s.key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: WEEK,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const s = secrets();
  if (!s) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !same(signature, sign(expires, s.key))) return false;
  return Number(expires) > Date.now() / 1000;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
