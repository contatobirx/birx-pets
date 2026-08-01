export async function onRequestGet(context) {
  const serial = String(context.params.serial || "").trim().toUpperCase();
  if (!serial) return Response.redirect(new URL("/", context.request.url), 302);

  let tag = null;
  try {
    tag = await context.env.DB.prepare(`SELECT codigo, ativada, bloqueada FROM tags WHERE UPPER(codigo) = UPPER(?) LIMIT 1`).bind(serial).first();
  } catch (erro) {
    console.error("Erro ao direcionar QR Code:", erro);
  }

  const caminho = tag && !Number(tag.ativada) && !Number(tag.bloqueada) ? "/ativar.html" : "/t.html";
  const destino = new URL(caminho, context.request.url);
  destino.searchParams.set("tag", serial);
  return Response.redirect(destino, 302);
}
