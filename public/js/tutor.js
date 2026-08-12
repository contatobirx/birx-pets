const elementos = {
  painel2: document.getElementById("painel2"),
  boasVindasTitulo: document.getElementById("boasVindasTitulo"),
  dashboardProtecao: document.getElementById("dashboardProtecao"),
  protecaoIcone: document.getElementById("protecaoIcone"),
  protecaoRotulo: document.getElementById("protecaoRotulo"),
  textoProtecao: document.getElementById("textoProtecao"),
  petDestaqueFoto: document.getElementById("petDestaqueFoto"),
  petDestaqueNome: document.getElementById("petDestaqueNome"),
  petDestaquePerfil: document.getElementById("petDestaquePerfil"),
  petDestaqueTag: document.getElementById("petDestaqueTag"),
  editarPetDestaque: document.getElementById("editarPetDestaque"),
  verPerfilPublico: document.getElementById("verPerfilPublico"),
  modoPerdidoDestaque: document.getElementById("modoPerdidoDestaque"),
  publicarPerdidoDestaque: document.getElementById("publicarPerdidoDestaque"),
  gerarCartazDestaque: document.getElementById("gerarCartazDestaque"),
  statusPetPrincipal: document.getElementById("statusPetPrincipal"),
  metricaStatusTag: document.getElementById("metricaStatusTag"),
  metricaLocalizacao: document.getElementById("metricaLocalizacao"),
  metricaAtualizacao: document.getElementById("metricaAtualizacao"),
  progressoTexto: document.getElementById("progressoTexto"),
  progressoNumero: document.getElementById("progressoNumero"),
  progressoTrilho: document.getElementById("progressoTrilho"),
  progressoBarra: document.getElementById("progressoBarra"),
  checklistPerfil: document.getElementById("checklistPerfil"),
  progressoMensagem: document.getElementById("progressoMensagem"),
  proximasAcoesCard: document.getElementById("proximasAcoesCard"),
  proximasAcoesLista: document.getElementById("proximasAcoesLista"),
  menuInferior: document.getElementById("menuInferior"),
  tituloSaudacao: document.getElementById("tituloSaudacao"),
  textoSaudacao: document.getElementById("textoSaudacao"),
  resumo: document.getElementById("resumo"),
  quantidadePets: document.getElementById("quantidadePets"),
  quantidadeTagsAtivas: document.getElementById("quantidadeTagsAtivas"),
  quantidadePerdidos: document.getElementById("quantidadePerdidos"),
  quantidadeCadastrosMes: document.getElementById("quantidadeCadastrosMes"),
  dashboardDetalhes: document.getElementById("dashboardDetalhes"),
  listaPetsRecentes: document.getElementById("listaPetsRecentes"),
  painelAtualizado: document.getElementById("painelAtualizado"),
  atualizarPainel: document.getElementById("atualizarPainel"),
  seletorPetAtivo: document.getElementById("seletorPetAtivo"),
  verTodosPets: document.getElementById("verTodosPets"),
  atalhoMeusPets: document.getElementById("atalhoMeusPets"),
  atalhoPerdidos: document.getElementById("atalhoPerdidos"),
  secaoMeusPets: document.getElementById("secaoMeusPets"),
  topoPets: document.getElementById("topoPets"),
  carregando: document.getElementById("carregando"),
  listaPets: document.getElementById("listaPets"),
  estadoVazio: document.getElementById("estadoVazio"),
  estadoErro: document.getElementById("estadoErro"),
  textoErro: document.getElementById("textoErro"),
  botaoTentarNovamente: document.getElementById("botaoTentarNovamente"),
  botaoSair: document.getElementById("botaoSair"),
  mensagem: document.getElementById("mensagem"),

  modalEditar: document.getElementById("modalEditar"),
  modalOverlay: document.querySelector("#modalEditar .modal-overlay"),
  fecharModal: document.getElementById("fecharModal"),
  cancelarEdicao: document.getElementById("cancelarEdicao"),
  formEditarPet: document.getElementById("formEditarPet"),

  editarTag: document.getElementById("editarTag"),
  editarNome: document.getElementById("editarNome"),
  editarEspecie: document.getElementById("editarEspecie"),
  editarRaca: document.getElementById("editarRaca"),
  editarSexo: document.getElementById("editarSexo"),
  editarIdade: document.getElementById("editarIdade"),
  editarComportamento: document.getElementById("editarComportamento"),
  editarTutor: document.getElementById("editarTutor"),
  editarWhatsapp: document.getElementById("editarWhatsapp"),
  editarEmail: document.getElementById("editarEmail"),
  editarCep: document.getElementById("editarCep"),
  editarCidade: document.getElementById("editarCidade"),
  editarEstado: document.getElementById("editarEstado"),
  editarEndereco: document.getElementById("editarEndereco"),
  avisoAlteracoes: document.getElementById("avisoAlteracoes"),
  statusSecaoPet: document.getElementById("statusSecaoPet"),
  statusSecaoTutor: document.getElementById("statusSecaoTutor"),
  statusSecaoEndereco: document.getElementById("statusSecaoEndereco"),

  modalFoto: document.getElementById("modalFoto"),
  modalFotoOverlay: document.querySelector("#modalFoto .modal-overlay"),
  fecharModalFoto: document.getElementById("fecharModalFoto"),
  cancelarFoto: document.getElementById("cancelarFoto"),
  formFotoPet: document.getElementById("formFotoPet"),
  fotoTag: document.getElementById("fotoTag"),
  fotoNomePet: document.getElementById("fotoNomePet"),
  arquivoFoto: document.getElementById("arquivoFoto"),
  fotoPreview: document.getElementById("fotoPreview"),
  fotoPreviewVazio: document.getElementById("fotoPreviewVazio"),
  nomeArquivoFoto: document.getElementById("nomeArquivoFoto"),
  enviarFoto: document.getElementById("enviarFoto"),

  modalSaude: document.getElementById("modalSaude"),
  modalSaudeOverlay: document.querySelector("#modalSaude .modal-overlay"),
  fecharModalSaude: document.getElementById("fecharModalSaude"),
  saudeNomePet: document.getElementById("saudeNomePet"),
  saudeTag: document.getElementById("saudeTag"),
  saudeResumo: document.getElementById("saudeResumo"),
  saudeDashboard: document.getElementById("saudeDashboard"),
  saudeEmDia: document.getElementById("saudeEmDia"),
  saudeProximas: document.getElementById("saudeProximas"),
  saudeAtrasadas: document.getElementById("saudeAtrasadas"),
  novoRegistroSaude: document.getElementById("novoRegistroSaude"),
  saudeCarregando: document.getElementById("saudeCarregando"),
  listaSaude: document.getElementById("listaSaude"),
  saudeVazio: document.getElementById("saudeVazio"),
  formSaude: document.getElementById("formSaude"),
  tituloFormSaude: document.getElementById("tituloFormSaude"),
  cancelarFormSaude: document.getElementById("cancelarFormSaude"),
  fecharFormSaude: document.getElementById("fecharFormSaude"),
  saudeId: document.getElementById("saudeId"),
  saudeTipo: document.getElementById("saudeTipo"),
  saudeNome: document.getElementById("saudeNome"),
  saudeFabricante: document.getElementById("saudeFabricante"),
  saudeLote: document.getElementById("saudeLote"),
  saudeVeterinario: document.getElementById("saudeVeterinario"),
  saudeDataAplicacao: document.getElementById("saudeDataAplicacao"),
  saudeProximaData: document.getElementById("saudeProximaData"),
  saudeObservacoes: document.getElementById("saudeObservacoes"),
  salvarSaude: document.getElementById("salvarSaude"),

  modalDocumentos: document.getElementById("modalDocumentos"),
  modalDocumentosOverlay: document.querySelector("#modalDocumentos .modal-overlay"),
  fecharModalDocumentos: document.getElementById("fecharModalDocumentos"),
  documentosNomePet: document.getElementById("documentosNomePet"),
  documentosTag: document.getElementById("documentosTag"),
  documentosResumo: document.getElementById("documentosResumo"),
  novoDocumento: document.getElementById("novoDocumento"),
  documentosCarregando: document.getElementById("documentosCarregando"),
  listaDocumentos: document.getElementById("listaDocumentos"),
  documentosVazio: document.getElementById("documentosVazio"),
  formDocumento: document.getElementById("formDocumento"),
  tituloFormDocumento: document.getElementById("tituloFormDocumento"),
  cancelarFormDocumento: document.getElementById("cancelarFormDocumento"),
  fecharFormDocumento: document.getElementById("fecharFormDocumento"),
  documentoId: document.getElementById("documentoId"),
  documentoCategoria: document.getElementById("documentoCategoria"),
  documentoTitulo: document.getElementById("documentoTitulo"),
  documentoData: document.getElementById("documentoData"),
  documentoProfissional: document.getElementById("documentoProfissional"),
  documentoObservacoes: document.getElementById("documentoObservacoes"),
  documentosBusca: document.getElementById("documentosBusca"),
  documentosFiltroCategoria: document.getElementById("documentosFiltroCategoria"),
  campoArquivoDocumento: document.getElementById("campoArquivoDocumento"),
  documentoArquivo: document.getElementById("documentoArquivo"),
  documentoArquivoTexto: document.getElementById("documentoArquivoTexto"),
  documentoEdicaoAviso: document.getElementById("documentoEdicaoAviso"),
  salvarDocumento: document.getElementById("salvarDocumento"),
};

const estado = {
  pets: [],
  petAtivoTag: localStorage.getItem("orbitek_pet_ativo") || "",
  petEmEdicao: null,
  salvando: false,
  buscandoCep: false,
  formularioInicial: "",
  formularioAlterado: false,
  enviandoFoto: false,
  previewFotoUrl: "",
  salvandoSaude: false,
  saudeRegistros: [],
  petSaude: null,
  salvandoDocumento: false,
  documentos: [],
  petDocumentos: null,
};

function dadosPet(pet) {
  const tutor = pet?.tutor || {};
  const localizacao = pet?.localizacao || {};

  return {
    tagCodigo: pet?.tagCodigo || pet?.tag_codigo || "",
    nome: pet?.nome || "",
    especie: pet?.especie || "",
    raca: pet?.raca || "",
    sexo: pet?.sexo || "",
    idade: pet?.idade || "",
    comportamento: pet?.comportamento || "",
    perdido: pet?.perdido === true || pet?.perdido === 1 || pet?.perdido === "1",
    publicoPerdidos: pet?.publicoPerdidos === true || pet?.publicoPerdidos === 1 || pet?.publico_perdidos === 1,
    fotoUrl: pet?.fotoUrl || pet?.foto_url || "",
    tutor: {
      nome: tutor?.nome || pet?.nome_tutor || "",
      whatsapp: tutor?.whatsapp || pet?.whatsapp || "",
      email: tutor?.email || pet?.email || "",
    },
    localizacao: {
      cep: localizacao?.cep || pet?.cep || "",
      logradouro: localizacao?.logradouro || pet?.logradouro || "",
      cidade: localizacao?.cidade || pet?.cidade || "",
      estado: localizacao?.estado || pet?.estado || "",
    },
  };
}

function formatarTexto(valor, fallback = "Não informado") {
  const texto = String(valor ?? "").trim();
  return texto || fallback;
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarWhatsapp(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

function normalizarCep(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function petFemea(pet) {
  const sexo = String(pet?.sexo || "").trim().toLowerCase();
  return sexo === "fêmea" || sexo === "femea" || sexo === "female";
}

function petAtivo() {
  if (!estado.pets.length) return null;
  const atual = estado.pets.find((pet) => String(dadosPet(pet).tagCodigo) === String(estado.petAtivoTag));
  return atual || estado.pets[0];
}

function prepararSeletorPetAtivo(pets) {
  if (!elementos.seletorPetAtivo) return;
  if (!pets.length) {
    elementos.seletorPetAtivo.innerHTML = "";
    return;
  }
  const existe = pets.some((pet) => String(dadosPet(pet).tagCodigo) === String(estado.petAtivoTag));
  if (!existe) estado.petAtivoTag = String(dadosPet(pets[0]).tagCodigo || "");
  localStorage.setItem("orbitek_pet_ativo", estado.petAtivoTag);
  elementos.seletorPetAtivo.innerHTML = pets.map((pet) => {
    const d = dadosPet(pet);
    return `<option value="${escaparHtml(d.tagCodigo)}"${String(d.tagCodigo) === String(estado.petAtivoTag) ? " selected" : ""}>${escaparHtml(d.nome || d.tagCodigo)}</option>`;
  }).join("");
}

function renderizarPainel2(pets, nomeTutor) {
  if (!elementos.painel2) return;
  if (!pets.length) {
    elementos.painel2.hidden = true;
    if (elementos.menuInferior) elementos.menuInferior.hidden = true;
    return;
  }
  elementos.painel2.hidden = false;
  if (elementos.menuInferior) elementos.menuInferior.hidden = false;
  const pet = dadosPet(petAtivo());
  if (!pet.tagCodigo) return;
  if (elementos.boasVindasTitulo) elementos.boasVindasTitulo.textContent = `${pet.nome || "Seu pet"} está protegido`;
  if (elementos.petDestaqueNome) elementos.petDestaqueNome.textContent = pet.nome || "Seu pet";
  if (elementos.petDestaqueTag) elementos.petDestaqueTag.textContent = pet.tagCodigo || "Tag BIRX";
  if (elementos.petDestaquePerfil) elementos.petDestaquePerfil.textContent = [pet.especie, pet.raca, pet.idade].filter(Boolean).join(" • ") || "Perfil BIRX";
  if (elementos.petDestaqueFoto) {
    elementos.petDestaqueFoto.innerHTML = pet.fotoUrl ? `<img src="${escaparHtml(pet.fotoUrl)}" alt="Foto de ${escaparHtml(pet.nome || "pet")}">` : (String(pet.especie).toLowerCase().includes("gat") ? "🐱" : "🐶");
  }
  if (elementos.statusPetPrincipal) elementos.statusPetPrincipal.textContent = pet.perdido ? "● Modo perdido ativo" : "● Tag ativa";
  if (elementos.statusPetPrincipal) elementos.statusPetPrincipal.classList.toggle("is-lost", pet.perdido);
  if (elementos.metricaStatusTag) elementos.metricaStatusTag.textContent = pet.perdido ? "Modo perdido" : "Ativa";
  if (elementos.metricaLocalizacao) elementos.metricaLocalizacao.textContent = [pet.localizacao.cidade, pet.localizacao.estado].filter(Boolean).join(" / ") || "Não informada";
  if (elementos.metricaAtualizacao) elementos.metricaAtualizacao.textContent = "Agora";
  if (elementos.editarPetDestaque) elementos.editarPetDestaque.dataset.tag = pet.tagCodigo;
  if (elementos.verPerfilPublico) elementos.verPerfilPublico.dataset.tag = pet.tagCodigo;
  if (elementos.modoPerdidoDestaque) {
    elementos.modoPerdidoDestaque.dataset.tag = pet.tagCodigo;
    elementos.modoPerdidoDestaque.dataset.perdido = pet.perdido ? "1" : "0";
    elementos.modoPerdidoDestaque.textContent = pet.perdido ? "✅ Marcar como encontrado" : "🚨 Ativar modo perdido";
  }
  if (elementos.gerarCartazDestaque) {
    elementos.gerarCartazDestaque.dataset.tag = pet.tagCodigo;
    elementos.gerarCartazDestaque.hidden = !pet.perdido;
  }
  if (elementos.publicarPerdidoDestaque) {
    elementos.publicarPerdidoDestaque.dataset.tag = pet.tagCodigo;
    elementos.publicarPerdidoDestaque.dataset.publico = pet.publicoPerdidos ? "1" : "0";
    elementos.publicarPerdidoDestaque.hidden = !pet.perdido;
    elementos.publicarPerdidoDestaque.textContent = pet.publicoPerdidos ? "🌐 Remover do diretório público" : "🌐 Publicar em pets perdidos";
  }
  if (elementos.progressoNumero || elementos.progressoBarra || elementos.progressoTexto || elementos.checklistPerfil) {
    const checklist = [
      { chave: "foto", ok: Boolean(pet.fotoUrl), texto: "Adicionar uma foto clara", acao: "foto" },
      { chave: "contato", ok: Boolean(normalizarWhatsapp(pet.tutor.whatsapp)), texto: "Confirmar WhatsApp do tutor", acao: "editar" },
      { chave: "localizacao", ok: Boolean(pet.localizacao.cidade && pet.localizacao.estado), texto: "Completar cidade e estado", acao: "editar" },
      { chave: "comportamento", ok: Boolean(String(pet.comportamento || "").trim()), texto: "Descrever comportamento e cuidados", acao: "editar" },
    ];
    const completos = checklist.filter((item) => item.ok).length;
    const percentual = Math.round((completos / checklist.length) * 100);
    if (elementos.progressoNumero) elementos.progressoNumero.textContent = `${percentual}%`;
    if (elementos.progressoBarra) elementos.progressoBarra.style.width = `${percentual}%`;
    if (elementos.progressoTrilho) elementos.progressoTrilho.setAttribute("aria-valuenow", String(percentual));
    if (elementos.progressoTexto) elementos.progressoTexto.textContent = `${completos} de ${checklist.length} itens essenciais concluídos`;
    if (elementos.progressoMensagem) elementos.progressoMensagem.textContent = percentual === 100 ? "Perfil completo. Seu pet está com as informações essenciais em dia." : "Quanto mais completo o perfil, mais fácil fica ajudar seu pet em uma emergência.";
    if (elementos.checklistPerfil) elementos.checklistPerfil.innerHTML = checklist.map((item) => `<li class="${item.ok ? "concluido" : "pendente"}"><span>${item.ok ? "✓" : "○"}</span><div><strong>${escaparHtml(item.texto)}</strong><small>${item.ok ? "Concluído" : "Pendente"}</small></div>${item.ok ? "" : `<button type="button" data-checklist-acao="${item.acao}">${item.acao === "foto" ? "Adicionar" : "Completar"}</button>`}</li>`).join("");
  }
  if (elementos.proximasAcoesCard && elementos.proximasAcoesLista) {
    const acoes = [];
    if (!pet.fotoUrl) acoes.push({ titulo: "Adicione uma foto", texto: "Uma imagem recente ajuda muito em caso de perda.", acao: "foto" });
    if (!normalizarWhatsapp(pet.tutor.whatsapp)) acoes.push({ titulo: "Confirme o WhatsApp", texto: "É o contato principal para quem encontrar seu pet.", acao: "editar" });
    if (!pet.comportamento) acoes.push({ titulo: "Conte como ele se comporta", texto: "Informe medos, cuidados e a melhor forma de aproximação.", acao: "editar" });
    if (!pet.perdido) acoes.push({ titulo: "Conheça o modo perdido", texto: "Ative somente se o pet desaparecer para publicar alertas e localização.", acao: "perdido" });
    elementos.proximasAcoesCard.hidden = !acoes.length;
    elementos.proximasAcoesLista.innerHTML = acoes.slice(0, 3).map((acao) => `<button type="button" class="proxima-acao" data-checklist-acao="${acao.acao}"><span>→</span><div><strong>${escaparHtml(acao.titulo)}</strong><small>${escaparHtml(acao.texto)}</small></div></button>`).join("");
  }
}

function acionarItemChecklist(evento) {
  const botao = evento.target.closest("[data-checklist-acao]");
  if (!botao) return;
  const acao = botao.dataset.checklistAcao;
  if (acao === "foto") abrirModalFoto(petAtivo());
  if (acao === "editar") abrirModalEdicaoComPet(petAtivo());
  if (acao === "perdido") {
    const pet = dadosPet(petAtivo());
    if (!pet.tagCodigo || !elementos.modoPerdidoDestaque) return;
    elementos.modoPerdidoDestaque.dataset.tag = pet.tagCodigo;
    elementos.modoPerdidoDestaque.dataset.perdido = pet.perdido ? "1" : "0";
    elementos.modoPerdidoDestaque.click();
  }
}

function renderizarPets(pets) {
  elementos.listaPets.innerHTML = pets
    .map((pet) => {
      const d = dadosPet(pet);
      const classePerdido = d.perdido ? "pet-perdido" : "";
      return `
        <article class="pet-card ${classePerdido}">
          <div class="pet-card-topo">
            <div class="pet-avatar">${d.fotoUrl ? `<img src="${escaparHtml(d.fotoUrl)}" alt="Foto de ${escaparHtml(d.nome)}">` : (String(d.especie).toLowerCase().includes("gat") ? "🐱" : "🐶")}</div>
            <div>
              <h3>${escaparHtml(d.nome || "Pet")}</h3>
              <p>${escaparHtml([d.especie, d.raca].filter(Boolean).join(" • ") || "Perfil BIRX")}</p>
            </div>
          </div>
          <div class="pet-card-meta">
            <span>${escaparHtml(d.tagCodigo)}</span>
            <span>${d.perdido ? "Modo perdido" : "Protegido"}</span>
          </div>
          <div class="pet-card-acoes">
            <button type="button" data-acao="editar" data-tag="${escaparHtml(d.tagCodigo)}">Editar</button>
            <button type="button" data-acao="foto" data-tag="${escaparHtml(d.tagCodigo)}">Foto</button>
            <button type="button" data-acao="perfil" data-tag="${escaparHtml(d.tagCodigo)}">Perfil público</button>
          </div>
        </article>`;
    })
    .join("");
}

function abrirModalEdicaoComPet(pet) {
  const d = dadosPet(pet);
  if (!d.tagCodigo) return;
  estado.petEmEdicao = pet;
  elementos.editarTag.value = d.tagCodigo;
  elementos.editarNome.value = d.nome || "";
  elementos.editarEspecie.value = d.especie || "";
  elementos.editarRaca.value = d.raca || "";
  elementos.editarSexo.value = d.sexo || "";
  elementos.editarIdade.value = d.idade || "";
  elementos.editarComportamento.value = d.comportamento || "";
  elementos.editarTutor.value = d.tutor.nome || "";
  elementos.editarWhatsapp.value = d.tutor.whatsapp || "";
  elementos.editarEmail.value = d.tutor.email || "";
  elementos.editarCep.value = d.localizacao.cep || "";
  elementos.editarCidade.value = d.localizacao.cidade || "";
  elementos.editarEstado.value = d.localizacao.estado || "";
  elementos.editarEndereco.value = d.localizacao.logradouro || "";
  elementos.modalEditar.hidden = false;
  document.body.classList.add("modal-aberto");
}

function abrirModalEdicao(evento) {
  const tag = evento.currentTarget?.dataset?.tag || estado.petAtivoTag;
  const pet = estado.pets.find((item) => String(dadosPet(item).tagCodigo) === String(tag)) || petAtivo();
  if (pet) abrirModalEdicaoComPet(pet);
}

function fecharModalEdicao() {
  if (estado.salvando) return;
  elementos.modalEditar.hidden = true;
  document.body.classList.remove("modal-aberto");
}

function abrirPerfilTutor(evento) {
  const tag = evento.currentTarget?.dataset?.tag || estado.petAtivoTag;
  if (!tag) return;
  window.open(`/t.html?tag=${encodeURIComponent(tag)}`, "_blank", "noopener,noreferrer");
}

function definirCarregamento(carregando) {
  elementos.carregando.hidden = !carregando;
}

function exibirMensagem(texto, tipo = "sucesso") {
  if (!elementos.mensagem) return;
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `mensagem ${tipo}`;
  elementos.mensagem.hidden = false;
  clearTimeout(exibirMensagem.timer);
  exibirMensagem.timer = setTimeout(() => {
    elementos.mensagem.hidden = true;
  }, 4500);
}

async function carregarPainel() {
  definirCarregamento(true);
  elementos.estadoErro.hidden = true;
  elementos.estadoVazio.hidden = true;
  elementos.listaPets.innerHTML = "";
  elementos.resumo.hidden = true;
  if (elementos.dashboardDetalhes) elementos.dashboardDetalhes.hidden = true;
  if (elementos.painel2) elementos.painel2.hidden = true;
  if (elementos.menuInferior) elementos.menuInferior.hidden = true;
  elementos.topoPets.hidden = true;

  try {
    const [respostaTutor, respostaDashboard] = await Promise.all([
      fetch("/api/tutor", {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      }),
      fetch("/api/dashboard", {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      }),
    ]);

    const [dados, dashboard] = await Promise.all([
      respostaTutor.json().catch(() => ({})),
      respostaDashboard.json().catch(() => ({})),
    ]);

    // A sessão é determinada exclusivamente por /api/tutor.
    // O dashboard é complementar e não deve derrubar uma conta válida.
    if (respostaTutor.status === 401 || dados.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!respostaTutor.ok || !dados.sucesso) {
      throw new Error(dados.mensagem || "Não foi possível carregar os dados.");
    }

    const pets = Array.isArray(dados.pets) ? dados.pets : [];
    estado.pets = pets;
    prepararSeletorPetAtivo(pets);

    const resumoDashboard = respostaDashboard.ok && dashboard.sucesso
      ? dashboard.resumo || {}
      : {
          totalPets: pets.length,
          tagsAtivas: pets.length,
          petsPerdidos: pets.filter((pet) => dadosPet(pet).perdido).length,
          cadastrosMes: 0,
        };

    const petsRecentes = respostaDashboard.ok && dashboard.sucesso
      ? (Array.isArray(dashboard.ultimosPets) ? dashboard.ultimosPets : [])
      : pets.slice(0, 3);

    const nomeTutor = formatarTexto(dados.tutor?.nome, "Tutor");
    renderizarPainel2(pets, nomeTutor);
    elementos.tituloSaudacao.textContent = `Olá, ${nomeTutor} 👋`;
    elementos.textoSaudacao.textContent =
      pets.length === 1
        ? "Aqui está o resumo da conta e do seu pet."
        : "Aqui está o resumo da sua conta e dos seus pets.";

    elementos.quantidadePets.textContent = String(resumoDashboard.totalPets ?? pets.length);
    elementos.quantidadeTagsAtivas.textContent = String(resumoDashboard.tagsAtivas ?? pets.length);
    elementos.quantidadePerdidos.textContent = String(
      resumoDashboard.petsPerdidos ?? pets.filter((pet) => dadosPet(pet).perdido).length
    );
    elementos.quantidadeCadastrosMes.textContent = String(resumoDashboard.cadastrosMes ?? 0);

    renderizarPetsRecentes(petsRecentes);
    if (elementos.painelAtualizado) {
      elementos.painelAtualizado.textContent = `Atualizado às ${new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date())}`;
    }
    elementos.resumo.hidden = false;
    if (elementos.dashboardDetalhes) elementos.dashboardDetalhes.hidden = false;
    elementos.topoPets.hidden = false;

    if (!pets.length) {
      elementos.estadoVazio.hidden = false;
      return;
    }

    renderizarPets(pets);
  } catch (erro) {
    console.error("Erro ao carregar painel:", erro);
    elementos.textoErro.textContent = erro.message || "Ocorreu um erro inesperado.";
    elementos.estadoErro.hidden = false;
  } finally {
    definirCarregamento(false);
  }
}

async function alterarModoPerdido(evento) {
  const botao = evento.currentTarget;
  const tagCodigo = botao.dataset.tag;
  const novoEstado = botao.dataset.perdido !== "1";
  const petAtual = dadosPet(estado.pets.find((item) => String(dadosPet(item).tagCodigo) === String(tagCodigo)) || {});
  const feminina = petFemea(petAtual);

  const confirmar = window.BIRXUI?.confirmar
    ? await window.BIRXUI.confirmar({
        titulo: novoEstado ? "Ativar modo perdido?" : `Pet ${feminina ? "encontrada" : "encontrado"}?`,
        mensagem: novoEstado
          ? `O perfil público destacará que este pet está ${feminina ? "perdida" : "perdido"}.`
          : "O alerta de pet perdido será removido do perfil público.",
        textoConfirmar: novoEstado ? "Ativar modo perdido" : `Marcar como ${feminina ? "encontrada" : "encontrado"}`,
      })
    : window.confirm(
        novoEstado
          ? "Deseja ativar o modo perdido para este pet?"
          : `Deseja marcar este pet como ${feminina ? "encontrada" : "encontrado"}?`
      );

  if (!confirmar) return;

  let localPerdido = null;
  if (novoEstado) {
    if (!window.BIRXSelecionarLocalizacao?.abrir) {
      exibirMensagem("O seletor de localização não foi carregado. Atualize a página e tente novamente.", "erro");
      return;
    }
    localPerdido = await window.BIRXSelecionarLocalizacao.abrir();
    if (!localPerdido) return;
  }

  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = "Atualizando...";

  try {
    const resposta = await fetch("/api/tutor-status", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ tagCodigo, perdido: novoEstado, latitude: localPerdido?.latitude, longitude: localPerdido?.longitude }),
    });

    const dados = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || dados.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(dados.mensagem || "Não foi possível atualizar o modo perdido.");
    }

    exibirMensagem(dados.mensagem || "Status atualizado com sucesso.");
    await carregarPainel();
  } catch (erro) {
    exibirMensagem(erro.message || "Não foi possível atualizar o modo perdido.", "erro");
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

async function sair() {
  elementos.botaoSair.disabled = true;
  elementos.botaoSair.textContent = "Saindo...";

  try {
    const resposta = await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(dados.mensagem || "Não foi possível sair.");
    }

    window.location.replace("/login.html");
  } catch (erro) {
    exibirMensagem(erro.message || "Não foi possível encerrar a sessão.", "erro");
    elementos.botaoSair.disabled = false;
    elementos.botaoSair.textContent = "Sair";
  }
}

function configurarEventos() {
  elementos.botaoTentarNovamente?.addEventListener("click", carregarPainel);
  elementos.editarPetDestaque?.addEventListener("click", abrirModalEdicao);
  elementos.verPerfilPublico?.addEventListener("click", () => {
    abrirPerfilTutor({ currentTarget: elementos.verPerfilPublico });
  });
  elementos.modoPerdidoDestaque?.addEventListener("click", alterarModoPerdido);
  elementos.checklistPerfil?.addEventListener("click", acionarItemChecklist);
  elementos.proximasAcoesLista?.addEventListener("click", acionarItemChecklist);
  elementos.seletorPetAtivo?.addEventListener("change", () => {
    estado.petAtivoTag = elementos.seletorPetAtivo.value;
    localStorage.setItem("orbitek_pet_ativo", estado.petAtivoTag);
    renderizarPainel2(estado.pets, "Tutor");
    const escolhido = dadosPet(petAtivo());
    window.dispatchEvent(new CustomEvent("birx:pet-ativo-alterado", { detail: escolhido }));
    exibirMensagem(`${formatarTexto(escolhido.nome, "Pet")} selecionado para as ações do app.`);
  });

  document.querySelectorAll("[data-modulo]").forEach((botao) => {
    botao.addEventListener("click", () => acionarModulo(botao.dataset.modulo));
  });

  document.querySelectorAll("[data-menu]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const destino = botao.dataset.menu;
      if (destino === "painel") window.scrollTo({ top: 0, behavior: "smooth" });
      if (destino === "pet") rolarAtePets();
      if (destino === "documentos") acionarModulo("documentos");
      if (destino === "conta") {
        elementos.botaoSair?.scrollIntoView({ behavior: "smooth", block: "center" });
        exibirMensagem("Use o botão Sair no topo para encerrar sua sessão.");
      }
    });
  });

elementos.atualizarPainel?.addEventListener("click", async () => {
  elementos.atualizarPainel.disabled = true;
  elementos.atualizarPainel.textContent = "Atualizando...";
  await carregarPainel();
  elementos.atualizarPainel.disabled = false;
  elementos.atualizarPainel.textContent = "Atualizar";
});

elementos.listaPetsRecentes?.addEventListener("click", (evento) => {
  const botao = evento.target.closest('[data-acao="ver-perfil-recente"]');
  if (!botao) return;
  abrirPerfilTutor({ currentTarget: botao });
});
  elementos.botaoSair?.addEventListener("click", sair);
  elementos.verTodosPets?.addEventListener("click", rolarAtePets);
  elementos.atalhoMeusPets?.addEventListener("click", rolarAtePets);
  elementos.atalhoPerdidos?.addEventListener("click", () => {
    const perdidos = estado.pets.filter((pet) => dadosPet(pet).perdido).length;
    rolarAtePets();
    exibirMensagem(
      perdidos
        ? `${perdidos} ${perdidos === 1 ? "pet está" : "pets estão"} em modo perdido.`
        : "Nenhum pet está em modo perdido."
    );
  });

  elementos.listaPets?.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const tag = botao.dataset.tag;
    const pet = estado.pets.find((item) => String(dadosPet(item).tagCodigo) === String(tag));
    if (!pet) return;

    if (botao.dataset.acao === "editar") abrirModalEdicaoComPet(pet);
    if (botao.dataset.acao === "foto") abrirModalFoto(pet);
    if (botao.dataset.acao === "perfil") abrirPerfilTutor({ currentTarget: botao });
  });

  elementos.fecharModal?.addEventListener("click", fecharModalEdicao);
  elementos.cancelarEdicao?.addEventListener("click", fecharModalEdicao);
  elementos.modalOverlay?.addEventListener("click", fecharModalEdicao);
  elementos.formEditarPet?.addEventListener("submit", salvarEdicao);

  elementos.fecharModalFoto?.addEventListener("click", fecharModalFoto);
  elementos.cancelarFoto?.addEventListener("click", fecharModalFoto);
  elementos.modalFotoOverlay?.addEventListener("click", fecharModalFoto);
  elementos.formFotoPet?.addEventListener("submit", salvarFoto);
  elementos.arquivoFoto?.addEventListener("change", atualizarPreviewFoto);

  elementos.fecharModalSaude?.addEventListener("click", fecharModalSaude);
  elementos.modalSaudeOverlay?.addEventListener("click", fecharModalSaude);
  elementos.novoRegistroSaude?.addEventListener("click", () => mostrarFormSaude());
  elementos.cancelarFormSaude?.addEventListener("click", esconderFormSaude);
  elementos.fecharFormSaude?.addEventListener("click", esconderFormSaude);
  elementos.formSaude?.addEventListener("submit", salvarRegistroSaude);
  elementos.listaSaude?.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    if (!id) return;

    if (botao.dataset.acao === "editar") {
      const registro = estado.saudeRegistros.find((item) => Number(item.id) === id);
      if (registro) mostrarFormSaude(registro);
    }

    if (botao.dataset.acao === "excluir") {
      await excluirRegistroSaude(id, botao);
    }
  });

  elementos.fecharModalDocumentos?.addEventListener("click", fecharModalDocumentos);
  elementos.modalDocumentosOverlay?.addEventListener("click", fecharModalDocumentos);
  elementos.novoDocumento?.addEventListener("click", () => mostrarFormDocumento());
  elementos.cancelarFormDocumento?.addEventListener("click", esconderFormDocumento);
  elementos.fecharFormDocumento?.addEventListener("click", esconderFormDocumento);
  elementos.formDocumento?.addEventListener("submit", salvarDocumento);
  elementos.documentosBusca?.addEventListener("input", renderizarDocumentos);
  elementos.documentosFiltroCategoria?.addEventListener("change", renderizarDocumentos);
  elementos.documentoArquivo?.addEventListener("change", () => {
    if (!elementos.documentoArquivoTexto) return;
    elementos.documentoArquivoTexto.textContent = elementos.documentoArquivo.files?.[0]?.name || "Escolher arquivo";
  });
  elementos.listaDocumentos?.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("[data-documento-acao]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    if (!id) return;

    if (botao.dataset.documentoAcao === "editar") {
      const documento = estado.documentos.find((item) => Number(item.id) === id);
      if (documento) mostrarFormDocumento(documento);
    }

    if (botao.dataset.documentoAcao === "excluir") {
      await excluirDocumento(id, botao);
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;

    if (!elementos.modalEditar.hidden) fecharModalEdicao();
    if (!elementos.modalFoto.hidden) fecharModalFoto();
    if (!elementos.modalSaude.hidden) fecharModalSaude();
    if (!elementos.modalDocumentos.hidden) fecharModalDocumentos();
  });
}

configurarEventos();
carregarPainel();
