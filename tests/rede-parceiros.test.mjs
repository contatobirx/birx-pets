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
  assert.match(partnerApi, /salvar-perfil-publico/);
  assert.match(partnerApi, /verificado=1/);
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
