import assert from "node:assert/strict";

const { default: worker } = await import("../dist/server/index.js");
const environment = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const context = { waitUntil() {}, passThroughOnException() {} };

const loginResponse = await worker.fetch(
  new Request("http://localhost/api/local-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: process.env.LOCAL_LOGIN_EMAIL,
      password: process.env.LOCAL_LOGIN_PASSWORD,
    }),
  }),
  environment,
  context,
);
assert.equal(loginResponse.status, 200);

const sessionCookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
assert.ok(sessionCookie, "Login must return a session cookie");

const dataResponse = await worker.fetch(
  new Request("http://localhost/api/data", { headers: { cookie: sessionCookie } }),
  environment,
  context,
);
assert.equal(dataResponse.status, 200);

const data = await dataResponse.json();
assert.ok(data.hospitals.length > 0);
assert.ok(data.equipment.length > 0);
assert.ok(data.agreements.length > 0);

const deniedResponse = await worker.fetch(
  new Request("http://localhost/api/data"),
  environment,
  context,
);
assert.equal(deniedResponse.status, 401);

console.log(JSON.stringify({
  login: loginResponse.status,
  protectedData: dataResponse.status,
  unauthorizedData: deniedResponse.status,
  hospitals: data.hospitals.length,
  equipment: data.equipment.length,
  services: data.services.length,
  agreements: data.agreements.length,
}));
