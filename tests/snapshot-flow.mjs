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
assert.match(chat.result, /address:/i);

const equipmentChatResponse = await worker.fetch(
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ query: "List all equipment with serial numbers" }),
  }),
  environment,
  context,
);
assert.equal(equipmentChatResponse.status, 200);
const equipmentChat = await equipmentChatResponse.json();
assert.match(equipmentChat.result, /Serial numbers for 26 equipment records/i);
assert.match(equipmentChat.result, /SONIAL VISION G4/i);

const writeResponse = await worker.fetch(
  new Request("http://localhost/api/hospitals", {
    method: "PATCH",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ id: 1, address: "Test address" }),
  }),
  environment,
  context,
);
assert.equal(writeResponse.status, 503);

const equipmentWriteResponse = await worker.fetch(
  new Request("http://localhost/api/equipment", {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ hospital_id: 1, name: "Test equipment" }),
  }),
  environment,
  context,
);
assert.equal(equipmentWriteResponse.status, 503);

const equipmentDeleteResponse = await worker.fetch(
  new Request("http://localhost/api/equipment", {
    method: "DELETE",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ id: 1 }),
  }),
  environment,
  context,
);
assert.equal(equipmentDeleteResponse.status, 503);

const agreementWriteResponse = await worker.fetch(
  new Request("http://localhost/api/agreements", {
    method: "PATCH",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({
      id: 1,
      agreement_start_date: "2026-01-01",
      agreement_end_date: "2026-12-31",
    }),
  }),
  environment,
  context,
);
assert.equal(agreementWriteResponse.status, 503);

console.log(JSON.stringify({
  data: dataResponse.status,
  source: data.source,
  hospitals: data.hospitals.length,
  equipment: data.equipment.length,
  services: data.services.length,
  agreements: data.agreements.length,
  assistant: chatResponse.status,
  protectedWriteWithoutLiveBackend: writeResponse.status,
  protectedEquipmentWriteWithoutLiveBackend: equipmentWriteResponse.status,
  protectedEquipmentDeleteWithoutLiveBackend: equipmentDeleteResponse.status,
  protectedAgreementWriteWithoutLiveBackend: agreementWriteResponse.status,
}));
