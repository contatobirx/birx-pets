function obterCookie(request, nome) {
  const cabecalho = request.headers.get("Cookie") || "";
  for (const parte of cabecalho.split(";")) {
    const indice = parte.indexOf("=");
    if (indice < 0) continue;
    const chave = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();
    if (chave !== nome) continue;
    try { return decodeURIComponent(valor); }
    catch { return valor; }
  }
  return null;
}

async function sha256(texto) {
  const dados = new TextEncoder().encode(String(texto || ""));
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function sessaoExpirada(expiraEm) {
  if (!expiraEm) return true;

  const numero = Number(expiraEm);
  if (Number.isFinite(numero) && numero > 0) {
    return Date.now() > numero;
  }

  const data = Date.parse(String(expiraEm));
  return Number.isNaN(data) || Date.now() > data;
}

export async function obterSessaoTutor(request, env, { atualizarUltimoAcesso = true } = {}) {
  const token = obterCookie(request, "orbitek_sessao");
  if (!token) return null;

  const tokenHash = await sha256(token);
  const sessao = await env.DB.prepare(`
    SELECT id, email, token_hash, expira_em
    FROM sessoes_tutor
    WHERE token_hash = ?
    LIMIT 1
  `)
    .bind(tokenHash)
    .first();

  if (!sessao) return null;

  if (sessaoExpirada(sessao.expira_em)) {
    await env.DB.prepare(`DELETE FROM sessoes_tutor WHERE token_hash = ?`)
      .bind(tokenHash)
      .run();
    return null;
  }

  if (atualizarUltimoAcesso) {
    await env.DB.prepare(`
      UPDATE sessoes_tutor
      SET ultimo_acesso = ?
      WHERE token_hash = ?
    `)
      .bind(new Date().toISOString(), tokenHash)
      .run();
  }

  return {
    id: sessao.id,
    email: String(sessao.email || "").trim().toLowerCase(),
    tokenHash,
    expiraEm: sessao.expira_em,
  };
}

export async function petPertenceAoTutor(env, tagCodigo, email) {
  const tag = String(tagCodigo || "").trim();
  const conta = String(email || "").trim().toLowerCase();
  if (!tag || !conta) return null;

  return env.DB.prepare(`
    SELECT id, tag_codigo, email
    FROM pets
    WHERE UPPER(tag_codigo) = UPPER(?)
      AND LOWER(email) = LOWER(?)
    LIMIT 1
  `)
    .bind(tag, conta)
    .first();
}
