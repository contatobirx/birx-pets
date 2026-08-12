export async function onRequestGet(context) {
  const serial = String(context.params.serial || "")
    .trim()
    .toUpperCase();

  if (!serial) {
    return Response.redirect(new URL("/", context.request.url), 302);
  }

  let tag = null;
  try {
    tag = await context.env.DB.prepare(`
      SELECT codigo, ativada, bloqueada
      FROM tags
      WHERE UPPER(codigo) = UPPER(?)
      LIMIT 1
    `).bind(serial).first();
  } catch (erro) {
    console.error("Erro ao direcionar tag NFC:", erro);
  }

  // Tags válidas e ainda não ativadas seguem direto para o cadastro.
  // Tags ativadas, bloqueadas ou desconhecidas passam pela tela pública,
  // que exibe somente o estado seguro correspondente.
  const caminho = tag && !Number(tag.ativada) && !Number(tag.bloqueada)
    ? "/ativar.html"
    : "/t.html";
  const destino = new URL(caminho, context.request.url);
  destino.searchParams.set("tag", serial);

  return Response.redirect(destino, 302);
}
