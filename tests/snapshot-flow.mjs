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
const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie);

const dataResponse = await worker.fetch(
  new Request("http://localhost/api/data", { headers: { cookie } }),
  environment,
  context,
);
assert.equal(dataResponse.status, 200);
const data = await dataResponse.json();
assert.equal(data.source, "snapshot");
assert.equal(data.hospitals.length, 3);
assert.equal(data.equipment.length, 26);
assert.equal(data.services.length, 2);
assert.equal(data.agreements.length, 35);

const chatResponse = await worker.fetch(
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ query: "How many hospitals are there?" }),
  }),
  environment,
  context,
);
assert.equal(chatResponse.status, 200);
const chat = await chatResponse.json();
assert.match(chat.result, /3 hospitals/i);

console.log(JSON.stringify({
  data: dataResponse.status,
  source: data.source,
  hospitals: data.hospitals.length,
  equipment: data.equipment.length,
  services: data.services.length,
  agreements: data.agreements.length,
  assistant: chatResponse.status,
}));
