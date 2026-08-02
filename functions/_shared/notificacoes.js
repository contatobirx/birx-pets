function escapar(valor) {
  return String(valor ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function janela(minutos) { return String(Math.floor(Date.now() / (minutos * 60 * 1000))); }

export async function enviarAlerta({ env, pet, tipo, cidade = "", estado = "", latitude = null, longitude = null }) {
  if (!pet?.email) return false;
  const email = String(pet.email).trim().toLowerCase();
  const periodo = janela(tipo === "leitura" ? 30 : 5);
  const local = [cidade, estado].filter(Boolean).join(" - ");
  const temMapa = tipo === "localizacao" && Number.isFinite(latitude) && Number.isFinite(longitude);
  const url = temMapa ? `https://www.google.com/maps?q=${latitude},${longitude}` : `/historico.html?tag=${encodeURIComponent(pet.tag_codigo)}`;
  const tituloNotificacao = tipo === "localizacao" ? `Nova localização de ${pet.nome}` : `Tag de ${pet.nome} acessada`;
  const descricaoNotificacao = tipo === "localizacao" ? "Alguém compartilhou uma localização pelo perfil público." : `Nova leitura registrada${local ? ` em ${local}` : ""}.`;
  await env.DB.prepare(`INSERT OR IGNORE INTO notificacoes_tutor (email, tag_codigo, tipo, janela, titulo, descricao, url) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(email, pet.tag_codigo, tipo, periodo, tituloNotificacao, descricaoNotificacao, url).run();

  if (!env.RESEND_API_KEY) return true;
  const preferencias = await env.DB.prepare(`SELECT alerta_leitura, alerta_localizacao, apenas_modo_perdido FROM preferencias_notificacao WHERE LOWER(email) = ? LIMIT 1`).bind(email).first();
  if (tipo === "leitura" && preferencias && Number(preferencias.alerta_leitura) !== 1) return true;
  if (tipo === "localizacao" && preferencias && Number(preferencias.alerta_localizacao) !== 1) return true;
  if (preferencias && Number(preferencias.apenas_modo_perdido) === 1 && Number(pet.perdido) !== 1) return true;

  try {
    await env.DB.prepare(`INSERT INTO alertas_enviados (tag_codigo, tipo, janela, destinatario) VALUES (?, ?, ?, ?)`).bind(pet.tag_codigo, tipo, periodo, email).run();
  } catch { return false; }

  const nome = escapar(pet.nome || "Seu pet");
  const urlEmail = temMapa ? url : "https://pets.birx.com.br/tutor.html";
  const titulo = tipo === "localizacao" ? `Nova localização compartilhada para ${nome}` : `A tag de ${nome} foi acessada`;
  const descricao = tipo === "localizacao" ? `Alguém compartilhou uma localização pelo perfil de ${nome}.` : `A tag de ${nome} foi lida${local ? ` em ${escapar(local)}` : ""}.`;

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.EMAIL_REMETENTE || "BIRX Pets <onboarding@resend.dev>", to: [email],
        subject: tipo === "localizacao" ? `📍 Localização de ${pet.nome} | BIRX Pets` : `Tag de ${pet.nome} acessada | BIRX Pets`,
        html: `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:24px;background:#f3f6fc;font-family:Arial,sans-serif;color:#17264a"><div style="max-width:560px;margin:auto;background:#fff;padding:32px;border-radius:20px"><p style="color:#2761e8;font-weight:700">BIRX PETS</p><h1 style="font-size:25px">${titulo}</h1><p style="line-height:1.6;color:#5d6980">${descricao}</p><p style="color:#5d6980">Data: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p><a href="${urlEmail}" style="display:inline-block;margin-top:12px;padding:13px 18px;border-radius:10px;background:#225bea;color:#fff;text-decoration:none;font-weight:700">${temMapa ? "Abrir localização no mapa" : "Abrir painel do tutor"}</a><p style="margin-top:28px;color:#8791a5;font-size:12px">Você pode alterar estes avisos em Minha conta.</p></div></body></html>`,
        text: `${titulo}\n\n${descricao}\n\n${temMapa ? `Abrir mapa: ${urlEmail}` : "Acesse: https://pets.birx.com.br/tutor.html"}`
      })
    });
    if (!resposta.ok) throw new Error(`Resend respondeu ${resposta.status}`);
    await env.DB.prepare(`UPDATE alertas_enviados SET status = 'enviado' WHERE tag_codigo = ? AND tipo = ? AND janela = ? AND destinatario = ?`).bind(pet.tag_codigo, tipo, periodo, email).run();
    return true;
  } catch (erro) {
    console.error("Erro ao enviar alerta:", erro);
    await env.DB.prepare(`DELETE FROM alertas_enviados WHERE tag_codigo = ? AND tipo = ? AND janela = ? AND destinatario = ?`).bind(pet.tag_codigo, tipo, periodo, email).run();
    return false;
  }
}
