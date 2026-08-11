import { adminAutorizado } from "./_lib/admin-auth.js";

const LEGACY_HOSTS = new Set([
  "orbitekoficial.com.br",
  "www.orbitekoficial.com.br",
]);

const ROTAS_INTERNAS_EXATAS = new Set([
  "/loja",
  "/loja.html",
  "/pedido",
  "/pedido.html",
  "/admin-tags.html",
  "/admin-loja.html",
  "/admin-parceiros.html",
  "/admin-auditoria.html",
  "/producao.html",
]);

const ROTAS_LOGIN_ADMIN = new Set([
  "/admin/login",
  "/admin/login/",
  "/admin/login.html",
]);

function rotaInterna(pathname) {
  if (ROTAS_LOGIN_ADMIN.has(pathname)) return false;
  if (ROTAS_INTERNAS_EXATAS.has(pathname)) return true;
  if (pathname === "/admin" || pathname === "/admin/") return true;
  if (pathname.startsWith("/admin/")) return true;
  return false;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (LEGACY_HOSTS.has(url.hostname.toLowerCase())) {
    url.protocol = "https:";
    url.hostname = "pets.birx.com.br";
    url.port = "";
    return Response.redirect(url.toString(), 308);
  }

  if (rotaInterna(url.pathname)) {
    const autorizado = await adminAutorizado(context.request, context.env);
    if (!autorizado) {
      const login = new URL("/admin/login/", url.origin);
      login.searchParams.set("voltar", `${url.pathname}${url.search}`);
      return Response.redirect(login.toString(), 302);
    }
  }

  return context.next();
}
