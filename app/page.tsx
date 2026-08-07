import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { chatGPTSignInPath } from "./chatgpt-auth";
import { getAppUser } from "./auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in | Down South Service Command",
  description: "Secure access to regional hospital equipment and service operations.",
};

export default async function Home() {
  const user = await getAppUser();
  if (user) redirect("/dashboard");

  const localLoginEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.LOCAL_LOGIN_ENABLED === "true";

  return (
    <main className="login-shell">
      <section className="login-story" aria-labelledby="product-title">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark" aria-hidden="true">DS</span>
          <span>Down South Service Command</span>
        </div>
        <div className="login-story-copy">
          <p className="eyebrow eyebrow-light">Regional healthcare operations</p>
          <h1 id="product-title">Every device. Every agreement. One clear view.</h1>
          <p>
            Coordinate hospital equipment, contract coverage, service history,
            and database intelligence across Sri Lanka&apos;s Southern Province.
          </p>
        </div>
        <div className="region-strip" aria-label="Service regions">
          <span>Galle</span><i />
          <span>Hambantota</span><i />
          <span>Matara</span>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <div className="mobile-brand brand-lockup">
            <span className="brand-mark" aria-hidden="true">DS</span>
            <span>Service Command</span>
          </div>
          <p className="eyebrow">Authorized personnel</p>
          <h2 id="login-title">Welcome back</h2>
          <p className="login-intro">
            Sign in to access service operations and the database assistant.
          </p>

          {localLoginEnabled ? (
            <LoginForm />
          ) : (
            <a className="primary-button login-button" href={chatGPTSignInPath("/dashboard")}>
              Sign in with ChatGPT
              <span aria-hidden="true">→</span>
            </a>
          )}

          <div className="security-note">
            <span className="security-dot" aria-hidden="true" />
            Protected access · Sessions expire automatically
          </div>
        </div>
        <p className="login-footer">Down South Region Service · Operations Portal</p>
      </section>
    </main>
  );
}
