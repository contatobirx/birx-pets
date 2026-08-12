import test from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "../functions/api/google-maps-embed.js";

test("o mapa incorporado exige a chave configurada", async () => {
  const response = await onRequestGet({
    request: new Request("https://pets.birx.com.br/api/google-maps-embed"),
    env: {}
  });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /ainda não foi configurado/);
});

test("o mapa redireciona somente para a Maps Embed API", async () => {
  const response = await onRequestGet({
    request: new Request("https://pets.birx.com.br/api/google-maps-embed?q=clínica veterinária 80020-310"),
    env: { GOOGLE_MAPS_EMBED_KEY: "chave-restrita" }
  });
  assert.equal(response.status, 302);
  const destination = new URL(response.headers.get("Location"));
  assert.equal(destination.origin, "https://www.google.com");
  assert.equal(destination.pathname, "/maps/embed/v1/search");
  assert.equal(destination.searchParams.get("key"), "chave-restrita");
  assert.equal(destination.searchParams.get("q"), "clínica veterinária 80020-310");
  assert.equal(destination.searchParams.get("region"), "BR");
});
