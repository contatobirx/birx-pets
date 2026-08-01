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

test("a Sprint 3.17 pede consentimento e entrega a localização exata somente ao tutor", async () => {
  const [perfil, fluxo, api, historico, paginaHistorico] = await Promise.all([
    readFile(new URL("../public/t.html", import.meta.url), "utf8"),
    readFile(new URL("../public/js/pet-location.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/localizacoes.js", import.meta.url), "utf8"),
    readFile(new URL("../public/js/historico.js", import.meta.url), "utf8"),
    readFile(new URL("../public/historico.html", import.meta.url), "utf8")
  ]);
  assert.match(perfil, /conviteLocalizacao/);
  assert.match(perfil, /não será exibida publicamente/);
  assert.match(fluxo, /orbitek:pet-carregado/);
  assert.match(fluxo, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(fluxo, /enableHighAccuracy:true/);
  assert.match(fluxo, /posicao\.coords\.accuracy/);
  assert.match(api, /obterSessao/);
  assert.match(api, /LOWER\(email\) = LOWER\(\?\)/);
  assert.match(historico, /Abrir localização exata/);
  assert.match(historico, /precisão aproximada/);
  assert.match(paginaHistorico, /Estas coordenadas são privadas/);
});

test("uma localização válida só é salva para tag ativa", async () => {
  let insercao;
  const banco = {
    prepare(sql) {
      return {
        bind(...valores) {
          return {
            first: async () => sql.includes("FROM tags") ? { codigo: "ORB-1" } : sql.includes("FROM pets") ? { tag_codigo: "ORB-1", nome: "Thor", email: "tutor@example.com", perdido: 1 } : null,
            run: async () => { if (sql.includes("INSERT INTO localizacoes_pet")) insercao = valores; return { success: true }; }
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
  assert.deepEqual(insercao, ["ORB-1", -25.43, -49.27, 18, "perfil_publico"]);
});

test("a última localização do tutor exige sessão da conta responsável", async () => {
  const banco = { prepare(sql) { return { bind() { return { first: async () => sql.includes("FROM tags") ? { codigo: "ORB-1" } : sql.includes("FROM pets") ? { tag_codigo: "ORB-1", nome: "Thor", email: "tutor@example.com", perdido: 1 } : null }; } }; } };
  const resposta = await onRequestPost({
    request: new Request("https://orbitekoficial.com.br/api/localizacoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tag: "ORB-1", latitude: -25.43, longitude: -49.27, origem: "tutor_ultimo_avistamento" }) }),
    env: { DB: banco }
  });
  assert.equal(resposta.status, 401);
});

test("perfil público e modo perdido incluem mapas no momento correto", async () => {
  const [perfil, painel, perdidos, seletor, status, tutorJs] = await Promise.all([
    readFile(new URL("../public/t.html", import.meta.url), "utf8"),
    readFile(new URL("../public/tutor.html", import.meta.url), "utf8"),
    readFile(new URL("../public/perdidos.html", import.meta.url), "utf8"),
    readFile(new URL("../public/js/tutor-lost-location.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/tutor-status.js", import.meta.url), "utf8"),
    readFile(new URL("../public/js/tutor.js", import.meta.url), "utf8")
  ]);
  assert.match(perfil, /botaoCompartilharLocalizacao/);
  assert.match(perfil, /pet-location\.js/);
  assert.doesNotMatch(painel, /mapaUltimaLocalizacao/);
  assert.match(painel, /mapaSelecionarLocalPerdido/);
  assert.match(painel, /leaflet@1\.9\.4/);
  assert.match(perfil, /voltarPerdidos/);
  assert.match(perfil, /mapaPetPerdido/);
  assert.match(perfil, /Última localização/);
  assert.doesNotMatch(perdidos, /mapaPerdidos/);
  assert.match(seletor, /mapa\.on\("click"/);
  assert.match(status, /tutor_ultimo_avistamento/);
  assert.match(status, /Selecione no mapa/);
  const mapaPet = await readFile(new URL("../public/js/pet-lost-map.js", import.meta.url), "utf8");
  assert.match(mapaPet, /\/api\/ultima-localizacao/);
  assert.match(mapaPet, /aria-expanded/);
  const fluxoPerdido = tutorJs.slice(tutorJs.indexOf("async function alterarModoPerdido"), tutorJs.indexOf("async function sair"));
  assert.match(fluxoPerdido, /let localPerdido = null/);
  assert.match(fluxoPerdido, /OrbitekSelecionarLocalizacao/);
});
