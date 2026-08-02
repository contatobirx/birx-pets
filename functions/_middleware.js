const LEGACY_HOSTS = new Set([
  "orbitekoficial.com.br",
  "www.orbitekoficial.com.br",
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!LEGACY_HOSTS.has(url.hostname.toLowerCase())) {
    return context.next();
  }

  url.protocol = "https:";
  url.hostname = "pets.birx.com.br";
  url.port = "";

  return Response.redirect(url.toString(), 308);
}
