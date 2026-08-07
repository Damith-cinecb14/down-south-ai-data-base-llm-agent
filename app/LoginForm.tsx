"use client";

import { FormEvent, useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/local-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (response.ok) {
      window.location.assign("/dashboard");
      return;
    }

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setError(payload?.error ?? "Sign-in failed. Please try again.");
    setLoading(false);
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label>
        Work email
        <input
          name="email"
          type="email"
          autoComplete="username"
          placeholder="name@organization.lk"
          required
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
      </label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="primary-button login-button" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in securely"}
        {!loading ? <span aria-hidden="true">→</span> : null}
      </button>
    </form>
  );
}
