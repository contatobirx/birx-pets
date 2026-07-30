export async function onRequestGet(context) {
  const serial = String(context.params.serial || "")
    .trim()
    .toUpperCase();

  if (!serial) {
    return Response.redirect(new URL("/", context.request.url), 302);
  }

  const destino = new URL("/", context.request.url);
  destino.searchParams.set("tag", serial);

  return Response.redirect(destino, 302);
}
