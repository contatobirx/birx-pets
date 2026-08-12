import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

function context(url) {
  return {
    request: new Request(url),
    next: async () => new Response("BIRX", { status: 200 }),
  };
}

test("domínios antigos redirecionam para a BIRX preservando caminho e parâmetros", async () => {
  for (const host of ["orbitekoficial.com.br", "www.orbitekoficial.com.br"]) {
    const response = await onRequest(context(`https://${host}/q/ORB-26-123456?origem=nfc`));
    assert.equal(response.status, 308);
    assert.equal(
      response.headers.get("Location"),
      "https://pets.birx.com.br/q/ORB-26-123456?origem=nfc",
    );
  }
});

test("o domínio oficial continua normalmente sem redirecionamento", async () => {
  const response = await onRequest(context("https://pets.birx.com.br/login"));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "BIRX");
});
