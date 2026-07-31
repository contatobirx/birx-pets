import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequestPost } from "../functions/api/localizacoes.js";

test("a localização exige coordenadas válidas", async () => {
  const resposta = await onRequestPost({
    request: new Request("https://orbitekoficial.com.br/api/localizacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: "ABC", latitude: 120, longitude: -49 })
    }),
    env: { DB: {} }
  });
  assert.equal(resposta.status, 400);
});

test("uma localização válida só é salva para tag ativa", async () => {
  let insercao;
  const banco = {
    prepare(sql) {
      return {
        bind(...valores) {
          return {
            first: async () => sql.includes("FROM tags") ? { codigo: "ORB-1" } : null,
            run: async () => { insercao = valores; return { success: true }; }
          };
        }
      };
    }
  };
  const resposta = await onRequestPost({
    request: new Request("https://orbitekoficial.com.br/api/localizacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: "orb-1", latitude: -25.43, longitude: -49.27, precisao: 18 })
    }),
    env: { DB: banco }
  });
  assert.equal(resposta.status, 201);
  assert.deepEqual(insercao, ["ORB-1", -25.43, -49.27, 18]);
});

test("perfil público e painel incluem compartilhamento e mapa", async () => {
  const [perfil, painel] = await Promise.all([
    readFile(new URL("../public/t.html", import.meta.url), "utf8"),
    readFile(new URL("../public/tutor.html", import.meta.url), "utf8")
  ]);
  assert.match(perfil, /botaoCompartilharLocalizacao/);
  assert.match(perfil, /pet-location\.js/);
  assert.match(painel, /mapaUltimaLocalizacao/);
  assert.match(painel, /leaflet@1\.9\.4/);
});
