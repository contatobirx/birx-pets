function normalizarCodigo(valor) {
  return String(valor || "").trim().toUpperCase().slice(0, 40);
}

function codigoValido(codigo) {
  return /^BIRX-\d{2}-\d{6}$/.test(codigo) || /^TAG-ORB-\d{2}-\d{6}$/.test(codigo);
}

export async function onRequestGet({ request, params, env }) {
  const codigo = normalizarCodigo(params.codigo);

  if (!codigoValido(codigo)) {
    return Response.redirect(new URL("/", request.url), 302);
  }

  try {
    const tag = await env.DB.prepare(`
      SELECT codigo, ativada, bloqueada
      FROM tags
      WHERE UPPER(codigo) = UPPER(?)
      LIMIT 1
    `).bind(codigo).first();

    if (!tag) {
      const destino = new URL("/t.html", request.url);
      destino.searchParams.set("tag", codigo);
      return Response.redirect(destino, 302);
    }

    if (Number(tag.bloqueada) === 1) {
      const destino = new URL("/t.html", request.url);
      destino.searchParams.set("tag", codigo);
      return Response.redirect(destino, 302);
    }

    if (Number(tag.ativada) !== 1) {
      const destino = new URL("/ativar.html", request.url);
      destino.searchParams.set("tag", codigo);
      return Response.redirect(destino, 302);
    }

    const destino = new URL("/t.html", request.url);
    destino.searchParams.set("tag", codigo);
    return Response.redirect(destino, 302);
  } catch (erro) {
    console.error("Erro na rota pública /q:", erro);
    const destino = new URL("/t.html", request.url);
    destino.searchParams.set("tag", codigo);
    return Response.redirect(destino, 302);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Método não permitido.", {
    status: 405,
    headers: { Allow: "GET", "Cache-Control": "no-store" },
  });
}
