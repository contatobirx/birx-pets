import test from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "../functions/tag/[serial].js";

function context(tag) {
  return {
    params: { serial: "orb-26-623939" },
    request: new Request("https://pets.birx.com.br/tag/ORB-26-623939"),
    env: { DB: { prepare() { return { bind() { return { first: async () => tag }; } }; } } }
  };
}

test("tag nova abre diretamente o cadastro", async () => {
  const response = await onRequestGet(context({ codigo: "ORB-26-623939", ativada: 0, bloqueada: 0 }));
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("Location"), "https://pets.birx.com.br/ativar.html?tag=ORB-26-623939");
});

test("tag ativada abre o perfil público", async () => {
  const response = await onRequestGet(context({ codigo: "ORB-26-623939", ativada: 1, bloqueada: 0 }));
  assert.equal(response.headers.get("Location"), "https://pets.birx.com.br/t.html?tag=ORB-26-623939");
});

test("tag bloqueada ou inexistente passa pela tela pública segura", async () => {
  for (const tag of [{ codigo: "ORB-26-623939", ativada: 0, bloqueada: 1 }, null]) {
    const response = await onRequestGet(context(tag));
    assert.match(response.headers.get("Location"), /\/t\.html\?tag=ORB-26-623939$/);
  }
});
