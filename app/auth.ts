import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "./chatgpt-auth";

export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  provider: "chatgpt" | "local";
};

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

export const SESSION_COOKIE = "downsouth_session";
const SESSION_SECONDS = 8 * 60 * 60;

function secret() {
  return process.env.SESSION_SECRET ?? "local-development-session-secret-change-me";
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function createSessionToken(email: string, displayName: string) {
  const payload: SessionPayload = {
    sub: `local:${email.toLowerCase()}`,
    email,
    name: displayName,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  };
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = base64UrlEncode(await hmac(body));
  return `${body}.${signature}`;
}

async function verifySessionToken(token: string): Promise<AppUser | null> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = base64UrlEncode(await hmac(body));
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload;
    if (!payload.sub || !payload.email || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.name || payload.email,
      provider: "local",
    };
  } catch {
    return null;
  }
}

function cookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export async function getAppUser(): Promise<AppUser | null> {
  const chatGPTUser = await getChatGPTUser();
  if (chatGPTUser) {
    return {
      id: chatGPTUser.userId,
      email: chatGPTUser.email,
      displayName: chatGPTUser.displayName,
      provider: "chatgpt",
    };
  }

  const requestHeaders = await headers();
  const token = cookieValue(requestHeaders.get("cookie"), SESSION_COOKIE);
  return token ? verifySessionToken(token) : null;
}

export async function requireAppUser(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user) redirect("/");
  return user;
}

export function localLoginEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.LOCAL_LOGIN_ENABLED === "true";
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure}`;
}
