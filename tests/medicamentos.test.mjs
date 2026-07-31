import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../public/tutor.html", import.meta.url), "utf8");
const js = await readFile(new URL("../public/js/tutor-medicamentos.js", import.meta.url), "utf8");
const api = await readFile(new URL("../functions/api/medicamentos.js", import.meta.url), "utf8");
const dosesApi = await readFile(new URL("../functions/api/medicamento-doses.js", import.meta.url), "utf8");
const migration = await readFile(new URL("../database/015_create_medicamentos.sql", import.meta.url), "utf8");
const dosesMigration = await readFile(new URL("../database/016_medicamento_doses.sql", import.meta.url), "utf8");
const pushApi = await readFile(new URL("../functions/api/push-assinatura.js", import.meta.url), "utf8");
const pushClient = await readFile(new URL("../public/js/tutor-push.js", import.meta.url), "utf8");
const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const pushWorker = await readFile(new URL("../workers/medication-push.js", import.meta.url), "utf8");
const ondeComprarApi = await readFile(new URL("../functions/api/onde-comprar.js", import.meta.url), "utf8");
const ondeComprarJs = await readFile(new URL("../public/js/tutor-onde-comprar.js", import.meta.url), "utf8");

test("a aba Medicamentos oferece cadastro completo por pet", () => {
  assert.doesNotMatch(html, /Medicamentos<\/strong><small>Em desenvolvimento/);
  for (const id of ["modalMedicamentos", "medicamentoNome", "medicamentoDosagem", "medicamentoFrequencia", "medicamentoHorarios", "medicamentoInicio", "medicamentoFim", "medicamentoVeterinario", "medicamentoObservacoes"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(js, /orbitek:abrir-medicamentos/);
  assert.match(js, /method: "DELETE"/);
});

test("a Sprint 2.14 registra doses e cria lembretes na central", () => {
  assert.match(js, /Dose administrada/);
  assert.match(js, /data-dose="ignorada"/);
  assert.match(js, /api\/medicamento-doses/);
  assert.match(dosesApi, /notificacoes_tutor/);
  assert.match(dosesApi, /INSERT OR IGNORE INTO medicamento_doses/);
  assert.match(dosesApi, /administrada.*ignorada/);
  assert.match(dosesMigration, /UNIQUE\(medicamento_id, prevista_em\)/);
});

test("a Sprint 2.14.1 oferece notificações push com consentimento", () => {
  assert.match(html, /Ativar avisos no celular/);
  assert.match(pushClient, /Notification\.requestPermission/);
  assert.match(pushClient, /pushManager\.subscribe/);
  assert.match(pushApi, /push_assinaturas/);
  assert.doesNotMatch(pushApi, /__VAPID_PUBLIC_KEY__/);
  assert.match(serviceWorker, /showNotification/);
  assert.match(serviceWorker, /notificationclick/);
  assert.match(pushWorker, /scheduled\(controller,env,ctx\)/);
  assert.match(pushWorker, /sendNotification/);
});

test("a busca Onde Comprar usa localização e exibe resultados dentro do app", () => {
  assert.match(html, /id="modalOndeComprar"/);
  assert.match(html, /Mostrar locais próximos/);
  assert.match(js, /data-onde-comprar/);
  assert.match(ondeComprarJs, /navigator\.geolocation/);
  assert.match(ondeComprarJs, /api\/onde-comprar/);
  assert.match(ondeComprarJs, /L\.marker/);
  assert.match(ondeComprarApi, /shop=pet/);
  assert.match(ondeComprarApi, /amenity=veterinary_pharmacy/);
  assert.match(ondeComprarApi, /sessoes_tutor/);
  assert.match(ondeComprarApi, /Math\.round\(lat\*100\)\/100/);
});

test("medicamentos são protegidos por sessão, tutor e tag", () => {
  assert.match(api, /sessoes_tutor/);
  assert.match(api, /LOWER\(email\)=LOWER\(\?\)/);
  assert.match(api, /pet_timeline/);
  assert.match(api, /Medicamento \$\{nome\} iniciado/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS pet_medicamentos/);
  assert.match(migration, /tag_codigo TEXT NOT NULL/);
});
