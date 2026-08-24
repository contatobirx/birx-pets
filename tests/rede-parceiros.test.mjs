import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, client, api, panel, partnerApi, migration] = await Promise.all([
  readFile(new URL("../public/parceiros.html", import.meta.url), "utf8"),
  readFile(new URL("../public/js/rede-parceiros.js", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/rede-parceiros.js", import.meta.url), "utf8"),
  readFile(new URL("../public/parceiro-painel.html", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/parceiro.js", import.meta.url), "utf8"),
  readFile(new URL("../database/034_rede_parceiros.sql", import.meta.url), "utf8")
]);

test("a Sprint 4.7 oferece uma rede pública de serviços para pets", () => {
  for (const value of ["CEP ou endereço", "Clínica veterinária", "Banho e tosa", "Atendimento de emergência", "Informação incorreta"])
    assert.match(html, new RegExp(value, "i"));
  assert.match(client, /WhatsApp/);
  assert.match(client, /viacep\.com\.br/);
  assert.match(client, /nominatim\.openstreetmap\.org/);
  assert.match(client, /distanciaKm/);
  assert.match(api, /atende_emergencia/);
});

test("parceiros autenticados administram o perfil e relatos são protegidos", () => {
  assert.match(panel, /Perfil na Rede BIRX/);
  assert.match(panel, /Serviços/);
  assert.match(panel, /Especialidades/);
  assert.match(panel, /Código do cupom/);
  assert.match(client, /promocaoCodigo/);
  assert.match(partnerApi, /salvar-perfil-publico/);
  assert.match(partnerApi, /verificado=1/);
  assert.match(partnerApi, /promocao_codigo/);
  assert.match(partnerApi, /promocao_validade/);
  assert.match(api, /parceiro_denuncias/);
  assert.match(api, /CF-Connecting-IP/);
  assert.match(migration, /parceiro_denuncias/);
});

test("a rede distingue parceiros BIRX de resultados externos do Google Maps", () => {
  assert.match(html, /id="googleMapsParceiros"/);
  assert.match(html, /id="mapaParceiros"/);
  assert.match(html, /api\/google-maps-embed/);
  assert.doesNotMatch(html, /leaflet/i);
  assert.match(html, /não são parceiros verificados da BIRX/i);
  assert.match(client, /google\.com\/maps\/search\/\?api=1/);
  assert.match(client, /api\/google-maps-embed/);
  assert.match(client, /encodeURIComponent\(query\)/);
});

test("cada parceiro ganha uma vitrine própria com agendamento e cupom vigente", async () => {
  const [profile, profileClient, profileApi, migration] = await Promise.all([
    readFile(new URL("../public/perfil-parceiro.html", import.meta.url), "utf8"),
    readFile(new URL("../public/js/perfil-parceiro.js", import.meta.url), "utf8"),
    readFile(new URL("../functions/api/parceiro-publico.js", import.meta.url), "utf8"),
    readFile(new URL("../database/039_promocoes_parceiros.sql", import.meta.url), "utf8")
  ]);
  assert.match(client, /perfil-parceiro\?id=/);
  assert.match(client, /promocaoCodigo/);
  assert.match(profile, /perfil-parceiro\.css/);
  assert.match(profileClient, /Compartilhar perfil/);
  assert.match(profileClient, /api\/parceiro-publico/);
  assert.match(profileClient, /Agendar pelo WhatsApp/);
  assert.match(profileClient, /copiarCupom/);
  assert.match(profileApi, /status='ativo' AND publico=1 AND verificado=1/);
  assert.match(profileApi, /promocao_validade/);
  assert.match(migration, /promocao_codigo/);
  assert.match(migration, /promocao_validade/);
});
