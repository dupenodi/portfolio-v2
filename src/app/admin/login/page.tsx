import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="admin-login">
      <h1>admin</h1>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="admin-note">
          set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET (32+ characters) in the environment to sign in.
        </p>
      )}
    </main>
  );
}
