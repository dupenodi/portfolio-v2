"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="admin-form">
      <label>
        username
        <input name="username" autoComplete="username" required autoFocus={!state?.username} defaultValue={state?.username} key={state?.username} />
      </label>
      <label>
        password
        <input name="password" type="password" autoComplete="current-password" required autoFocus={Boolean(state?.username)} />
      </label>
      {state?.error ? <p className="admin-error">{state.error}</p> : null}
      <button type="submit" className="admin-button primary" disabled={pending}>
        {pending ? "signing in…" : "sign in"}
      </button>
    </form>
  );
}
