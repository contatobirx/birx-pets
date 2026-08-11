function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

async function sha256(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || ""))));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function setup(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      acao TEXT NOT NULL,
      alvo TEXT,
      detalhes TEXT,
      ip_hash TEXT
    )
  `).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_admin_auditoria_criado_em ON admin_auditoria(criado_em)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_admin_auditoria_acao ON admin_auditoria(acao)`).run();
}

export async function registrarAuditoriaAdmin(env, request, { acao, alvo = "", detalhes = null }) {
  try {
    await setup(env);
    const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "";
    const ipHash = ip ? await sha256(ip.split(",")[0].trim()) : null;
    const detalhesJson = detalhes == null ? null : JSON.stringify(detalhes).slice(0, 4000);
    await env.DB.prepare(`
      INSERT INTO admin_auditoria (acao, alvo, detalhes, ip_hash)
      VALUES (?, NULLIF(?, ''), ?, ?)
    `).bind(clean(acao, 100), clean(alvo, 200), detalhesJson, ipHash).run();
  } catch (error) {
    console.error("Falha ao registrar auditoria administrativa:", error);
  }
}
