const HEADERS = { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: HEADERS });
const clean = (value, max = 160) => String(value ?? "").trim().slice(0, max);
const email = value => clean(value, 180).toLowerCase();
const CATEGORIES = ["Pet shop", "Clínica veterinária", "Banho e tosa", "Creche", "Hotel", "Adestramento", "Outro"];

async function sha(value) {
  const data = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(data)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function setup(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS parceiro_cadastro_envios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_hash TEXT NOT NULL,
    origem_hash TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_parceiro_cadastro_origem ON parceiro_cadastro_envios(origem_hash, criado_em)").run();
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const honeypot = clean(body.site, 100);
    if (honeypot) return json({ sucesso: true, mensagem: "Recebemos sua solicitação." }, 201);

    const nome = clean(body.nome, 120);
    const categoria = clean(body.categoria, 60);
    const responsavel = clean(body.responsavel, 120);
    const whatsapp = clean(body.whatsapp, 30);
    const mail = email(body.email);
    const cidade = clean(body.cidade, 100);
    const estado = clean(body.estado, 2).toUpperCase();
    if (nome.length < 2 || !CATEGORIES.includes(categoria) || responsavel.length < 2 || !whatsapp || !/^\S+@\S+\.\S+$/.test(mail) || cidade.length < 2 || !/^[A-Z]{2}$/.test(estado) || !body.consentimento) {
      return json({ sucesso: false, mensagem: "Revise os campos obrigatórios antes de enviar." }, 400);
    }

    await setup(env);
    const ip = request.headers.get("CF-Connecting-IP") || "desconhecido";
    const origem = await sha(`${ip}:${new Date().toISOString().slice(0, 10)}`);
    const recent = await env.DB.prepare("SELECT COUNT(*) AS total FROM parceiro_cadastro_envios WHERE origem_hash=? AND criado_em>datetime('now','-1 day')").bind(origem).first();
    if (Number(recent?.total || 0) >= 3) return json({ sucesso: false, mensagem: "Recebemos muitas solicitações deste acesso. Tente novamente amanhã." }, 429);

    const existing = await env.DB.prepare("SELECT id,status FROM parceiros WHERE LOWER(email)=LOWER(?) LIMIT 1").bind(mail).first();
    if (existing) {
      const mensagem = existing.status === "pendente" ? "Esta solicitação já está em análise pela BIRX." : "Este e-mail já está vinculado a um parceiro BIRX. Use o Painel do Parceiro ou fale conosco.";
      return json({ sucesso: true, mensagem });
    }

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO parceiros(nome,email,whatsapp,cidade,estado,status,categoria,endereco,cep,servicos,atende_emergencia,promocao,produtos,descricao,publico,verificado)
        VALUES(?,?,?,?,?,'pendente',?,?,?,?,?,?,?,?,0,0)`).bind(
        nome, mail, whatsapp, cidade, estado, categoria, clean(body.endereco, 240), clean(body.cep, 9),
        clean(body.servicos, 700), body.atendeEmergencia ? 1 : 0, clean(body.promocao, 500), clean(body.produtos, 700), clean(body.descricao, 1000)
      ),
      env.DB.prepare("INSERT INTO parceiro_cadastro_envios(email_hash,origem_hash) VALUES(?,?)").bind(await sha(mail), origem)
    ]);
    return json({ sucesso: true, mensagem: "Solicitação recebida! A BIRX vai revisar os dados e entrar em contato pelo WhatsApp ou e-mail informado." }, 201);
  } catch (error) {
    console.error("cadastro-parceiro", error);
    if (String(error.message).toLowerCase().includes("unique")) return json({ sucesso: true, mensagem: "Esta solicitação já está em análise pela BIRX." });
    return json({ sucesso: false, mensagem: "Não foi possível enviar a solicitação agora. Tente novamente em instantes." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
