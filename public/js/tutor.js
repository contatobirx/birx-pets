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
  urlPreviewFoto: "",
  registrosSaude: [],
  carregandoSaude: false,
  salvandoSaude: false,
  documentos: [],
  carregandoDocumentos: false,
  salvandoDocumento: false,
};

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarTexto(valor, fallback = "Não informado") {
  const texto = String(valor ?? "").trim();
  return texto || fallback;
}

function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function valorPet(pet, camel, snake = camel) {
  return pet?.[camel] ?? pet?.[snake] ?? "";
}

function dadosPet(pet) {
  const local = pet?.localizacao ?? {};
  const tutor = pet?.tutor ?? {};

  return {
    tagCodigo: valorPet(pet, "tagCodigo", "tag_codigo"),
    nome: valorPet(pet, "nome"),
    especie: valorPet(pet, "especie"),
    raca: valorPet(pet, "raca"),
    sexo: valorPet(pet, "sexo"),
    idade: valorPet(pet, "idade"),
    comportamento: valorPet(pet, "comportamento"),
    nomeTutor: tutor.nome ?? valorPet(pet, "nomeTutor", "nome_tutor"),
    whatsapp: tutor.whatsapp ?? valorPet(pet, "whatsapp"),
    email: tutor.email ?? valorPet(pet, "email"),
    cep: local.cep ?? valorPet(pet, "cep"),
    logradouro: local.logradouro ?? local.endereco ?? valorPet(pet, "logradouro"),
    cidade: local.cidade ?? valorPet(pet, "cidade"),
    estado: local.estado ?? valorPet(pet, "estado"),
    perdido: Boolean(pet?.perdido),
    publicoPerdidos: Boolean(pet?.publicoPerdidos ?? pet?.publico_perdidos),
    fotoUrl: valorPet(pet, "fotoUrl", "foto_url"),
  };
}

function petAtivo() {
  return estado.pets.find((item) => String(dadosPet(item).tagCodigo) === String(estado.petAtivoTag)) || estado.pets[0] || null;
}

function prepararSeletorPetAtivo(pets) {
  if (!pets.length) return;
  if (!pets.some((item) => String(dadosPet(item).tagCodigo) === String(estado.petAtivoTag))) estado.petAtivoTag = dadosPet(pets[0]).tagCodigo;
  localStorage.setItem("orbitek_pet_ativo", estado.petAtivoTag);
  if (!elementos.seletorPetAtivo) return;
  elementos.seletorPetAtivo.innerHTML = pets.map((item) => {
    const pet = dadosPet(item);
    return `<option value="${escaparHtml(pet.tagCodigo)}" ${String(pet.tagCodigo) === String(estado.petAtivoTag) ? "selected" : ""}>${escaparHtml(formatarTexto(pet.nome, "Pet"))} • ${escaparHtml(pet.tagCodigo)}</option>`;
  }).join("");
  elementos.seletorPetAtivo.closest(".pet-ativo-controle")?.classList.toggle("unico", pets.length === 1);
}

function exibirMensagem(texto, tipo = "sucesso") {
  if (window.OrbitekUI?.notificar) {
    window.OrbitekUI.notificar(texto, tipo === "erro" ? "erro" : "sucesso");
    return;
  }

  if (!elementos.mensagem) return;
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className =
    tipo === "erro"
      ? "mensagem mensagem-erro"
      : "mensagem mensagem-sucesso";
}

function definirCarregamento(ativo) {
  if (!elementos.carregando) return;
  elementos.carregando.hidden = !ativo;
  elementos.carregando.style.display = ativo ? "grid" : "none";
}

function rolarAtePets() {
  elementos.secaoMeusPets?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatarDataCurta(valor) {
  if (!valor) return "Cadastro recente";

  const normalizado = String(valor).includes("T")
    ? String(valor)
    : `${String(valor).replace(" ", "T")}Z`;
  const data = new Date(normalizado);

  if (Number.isNaN(data.getTime())) return "Cadastro recente";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(data);
}

function renderizarPetsRecentes(pets) {
  if (!elementos.listaPetsRecentes) return;

  if (!pets.length) {
    elementos.listaPetsRecentes.innerHTML = `
      <div class="pet-recente">
        <div class="pet-recente-sem-foto" aria-hidden="true">🐾</div>
        <div class="pet-recente-info">
          <strong>Nenhum pet cadastrado</strong>
          <small>Ative uma tag para começar.</small>
        </div>
      </div>
    `;
    return;
  }

  elementos.listaPetsRecentes.innerHTML = pets.map((petOriginal) => {
    const pet = dadosPet(petOriginal);
    const perfil = [pet.especie, pet.raca].filter(Boolean).join(" • ") || "Perfil não informado";
    const foto = pet.fotoUrl
      ? `<img class="pet-recente-foto" src="${escaparHtml(pet.fotoUrl)}" alt="Foto de ${escaparHtml(formatarTexto(pet.nome, "Pet"))}" loading="lazy">`
      : `<div class="pet-recente-sem-foto" aria-hidden="true">🐶</div>`;

    const dataCadastro = petOriginal.dataCadastro ?? petOriginal.data_cadastro;

    return `
      <button
        class="pet-recente"
        type="button"
        data-acao="ver-perfil-recente"
        data-tag="${escaparHtml(pet.tagCodigo)}"
        aria-label="Abrir perfil de ${escaparHtml(formatarTexto(pet.nome, "Pet"))}"
      >
        ${foto}
        <div class="pet-recente-info">
          <strong>${escaparHtml(formatarTexto(pet.nome, "Pet"))}</strong>
          <small>${escaparHtml(perfil)} · ${escaparHtml(formatarDataCurta(dataCadastro))}</small>
        </div>
        <span class="pet-recente-status ${pet.perdido ? "perdido" : "seguro"}">
          ${pet.perdido ? "● Perdido" : "● Seguro"}
        </span>
        <span class="pet-recente-seta" aria-hidden="true">›</span>
      </button>
    `;
  }).join("");
}

function renderizarPainel2(pets, nomeTutor) {
  if (!elementos.painel2 || !pets.length) return;

  prepararSeletorPetAtivo(pets);
  const original = petAtivo();
  const pet = dadosPet(original);
  const nomePet = formatarTexto(pet.nome, "Seu pet");
  const perfil = [pet.especie, pet.raca].filter(Boolean).join(" • ") || "Complete o perfil do pet";

  const estaPerdido = Boolean(pet.perdido);

  elementos.boasVindasTitulo.textContent = estaPerdido
    ? `${nomePet} está perdido`
    : `${nomePet} está protegido 🐾`;
  if (elementos.protecaoRotulo) elementos.protecaoRotulo.textContent = estaPerdido ? "Pet desaparecido" : "Proteção Orbitek";
  if (elementos.protecaoIcone) elementos.protecaoIcone.textContent = estaPerdido ? "🚨" : "🛡️";
  if (elementos.textoProtecao) {
    elementos.textoProtecao.textContent = estaPerdido
      ? "Caso alguém encontre este pet, o perfil público mostrará o contato do tutor em destaque."
      : "Mantenha os dados atualizados para facilitar o contato em uma emergência.";
  }
  elementos.dashboardProtecao?.classList.toggle("pet-perdido", estaPerdido);

  elementos.petDestaqueNome.textContent = nomePet;
  elementos.petDestaquePerfil.textContent = perfil;
  elementos.petDestaqueTag.textContent = `Tag ${formatarTexto(pet.tagCodigo, "não informada")}`;

  if (elementos.statusPetPrincipal) {
    elementos.statusPetPrincipal.textContent = pet.perdido ? "● Pet perdido" : "● Tag ativa";
    elementos.statusPetPrincipal.classList.toggle("perdido", pet.perdido);
  }
  if (elementos.metricaStatusTag) elementos.metricaStatusTag.textContent = pet.perdido ? "Em alerta" : "Ativa";
  if (elementos.metricaLocalizacao) elementos.metricaLocalizacao.textContent = montarLocalizacao(original);
  if (elementos.metricaAtualizacao) elementos.metricaAtualizacao.textContent = "Agora";
  if (elementos.modoPerdidoDestaque) {
    elementos.modoPerdidoDestaque.dataset.tag = pet.tagCodigo;
    elementos.modoPerdidoDestaque.dataset.perdido = pet.perdido ? "1" : "0";
    elementos.modoPerdidoDestaque.textContent = pet.perdido ? "✅ Marcar como encontrado" : "🚨 Ativar modo perdido";
    elementos.modoPerdidoDestaque.classList.toggle("ativo", pet.perdido);
  }
  if (elementos.verPerfilPublico) elementos.verPerfilPublico.dataset.tag = pet.tagCodigo;
  const transferir = document.getElementById("transferirPetDestaque");
  if (transferir) { transferir.dataset.tag = pet.tagCodigo; transferir.dataset.nome = nomePet; }
  if (elementos.publicarPerdidoDestaque) {
    elementos.publicarPerdidoDestaque.hidden = !pet.perdido;
    elementos.publicarPerdidoDestaque.dataset.tag = pet.tagCodigo;
    elementos.publicarPerdidoDestaque.dataset.publicado = pet.publicoPerdidos ? "1" : "0";
    elementos.publicarPerdidoDestaque.textContent = pet.publicoPerdidos ? "✓ Remover do diretório público" : "🌐 Publicar em pets perdidos";
    elementos.publicarPerdidoDestaque.classList.toggle("ativo", pet.publicoPerdidos);
  }
  if (elementos.gerarCartazDestaque) {
    elementos.gerarCartazDestaque.hidden = !pet.perdido;
    elementos.gerarCartazDestaque.dataset.tag = pet.tagCodigo;
  }

  elementos.petDestaqueFoto.innerHTML = pet.fotoUrl
    ? `<img src="${escaparHtml(pet.fotoUrl)}" alt="Foto de ${escaparHtml(nomePet)}">`
    : "🐶";

  const itens = [
    { nome: "Tag ativada", ok: Boolean(pet.tagCodigo), acao: "perfil", campo: "" },
    { nome: "Dados básicos", ok: Boolean(pet.nome && pet.especie), acao: "editar", campo: "editarNome" },
    { nome: "Foto", ok: Boolean(pet.fotoUrl), acao: "foto", campo: "" },
    { nome: "Contato", ok: Boolean(pet.whatsapp || pet.email), acao: "editar", campo: "editarWhatsapp" },
    { nome: "Localização", ok: Boolean(pet.cidade || pet.cep), acao: "editar", campo: "editarCep" },
    { nome: "Raça", ok: Boolean(pet.raca), acao: "editar", campo: "editarRaca" },
  ];

  const concluidos = itens.filter((item) => item.ok).length;
  const percentual = Math.round((concluidos / itens.length) * 100);
  elementos.progressoTexto.textContent = `${percentual}% completo`;
  elementos.progressoNumero.textContent = `${percentual}%`;
  elementos.progressoBarra.style.width = `${percentual}%`;
  elementos.progressoTrilho.setAttribute("aria-valuenow", String(percentual));

  const faltantes = itens.length - concluidos;
  if (elementos.progressoMensagem) {
    elementos.progressoMensagem.textContent = faltantes === 0
      ? "Perfil completo! Os dados essenciais estão prontos para uma emergência."
      : faltantes === 1
        ? "Falta apenas 1 etapa. Clique no item pendente para completar agora."
        : `Faltam ${faltantes} etapas. Clique nos itens para agilizar o preenchimento.`;
  }

  elementos.checklistPerfil.innerHTML = itens.map((item) => `
    <button class="checklist-item ${item.ok ? "concluido" : "pendente"}" type="button"
      data-checklist-acao="${item.acao}" data-checklist-campo="${item.campo}" data-tag="${escaparHtml(pet.tagCodigo)}"
      aria-label="${item.ok ? "Revisar" : "Completar"} ${escaparHtml(item.nome)}">
      ${item.ok ? "✓" : "○"} ${escaparHtml(item.nome)}
    </button>
  `).join("");

  if (elementos.proximasAcoesLista && elementos.proximasAcoesCard) {
    const pendentes = itens.filter((item) => !item.ok);
    elementos.proximasAcoesCard.hidden = false;
    elementos.proximasAcoesLista.innerHTML = pendentes.length
      ? pendentes.slice(0, 4).map((item) => `
          <button class="proxima-acao-item" type="button"
            data-checklist-acao="${item.acao}" data-checklist-campo="${item.campo}" data-tag="${escaparHtml(pet.tagCodigo)}">
            <span class="proxima-acao-alerta" aria-hidden="true">!</span>
            <span><strong>${escaparHtml(item.nome)}</strong><small>Toque para completar esta informação</small></span>
            <b>Resolver agora</b>
          </button>
        `).join("")
      : `<div class="proximas-acoes-concluidas"><span aria-hidden="true">✓</span><div><strong>Tudo certo!</strong><small>Os dados essenciais do perfil estão completos.</small></div></div>`;
  }

  elementos.editarPetDestaque.dataset.tag = pet.tagCodigo;
  elementos.painel2.hidden = false;
  if (elementos.menuInferior) elementos.menuInferior.hidden = false;
}


function acionarItemChecklist(evento) {
  const botao = evento.target.closest("[data-checklist-acao]");
  if (!botao) return;

  const acao = botao.dataset.checklistAcao;
  const tag = botao.dataset.tag;

  if (acao === "foto") {
    abrirModalFoto({ currentTarget: { dataset: { tag } } });
    return;
  }

  if (acao === "perfil") {
    abrirPerfilTutor({ currentTarget: { dataset: { tag } } });
    return;
  }

  abrirModalEdicao({ currentTarget: { dataset: { tag } } });
  const campo = botao.dataset.checklistCampo;
  if (campo && elementos[campo]) {
    setTimeout(() => {
      elementos[campo].focus();
      elementos[campo].scrollIntoView({ behavior: "smooth", block: "center" });
    }, 90);
  }
}

function acionarModulo(modulo) {
  const petOriginal = petAtivo();
  if (!petOriginal) {
    exibirMensagem("Cadastre um pet para acessar este recurso.", "erro");
    return;
  }

  const pet = dadosPet(petOriginal);
  const evento = { currentTarget: { dataset: { tag: pet.tagCodigo } } };

  if (modulo === "saude" || modulo === "vacinas") {
    abrirModalSaude(evento);
    return;
  }
  if (modulo === "carteirinha") {
    window.dispatchEvent(new CustomEvent("orbitek:abrir-carteirinha", {
      detail: pet
    }));
    return;
  }
  if (modulo === "documentos") {
    abrirModalDocumentos(evento);
    return;
  }
  if (modulo === "historico") {
    abrirHistoricoTutor(evento);
    return;
  }
  if (modulo === "timeline") {
    window.location.href = `/historico.html?tag=${encodeURIComponent(pet.tagCodigo)}&origem=tutor&secao=timeline`;
    return;
  }
  if (modulo === "medicamentos") {
    window.dispatchEvent(new CustomEvent("orbitek:abrir-medicamentos", {
      detail: { tagCodigo: pet.tagCodigo, nome: pet.nome }
    }));
    return;
  }
  if (modulo === "agendamentos") {
    window.dispatchEvent(new CustomEvent("orbitek:abrir-agendamentos", {
      detail: { tagCodigo: pet.tagCodigo, nome: pet.nome }
    }));
    return;
  }
  if (modulo === "clinicas") {
    window.dispatchEvent(new CustomEvent("orbitek:clinicas-proximas"));
    return;
  }
}

function montarLocalizacao(petOriginal) {
  const pet = dadosPet(petOriginal);
  const cidade = String(pet.cidade ?? "").trim();
  const uf = String(pet.estado ?? "").trim();

  if (cidade && uf) return `${cidade} - ${uf}`;
  return cidade || uf || "Não informada";
}

function criarCardPet(petOriginal) {
  const pet = dadosPet(petOriginal);
  const especieRaca = [pet.especie, pet.raca].filter(Boolean).join(" • ");

  const foto = pet.fotoUrl
    ? `<img class="pet-foto" src="${escaparHtml(pet.fotoUrl)}" alt="Foto de ${escaparHtml(pet.nome)}" loading="lazy">`
    : `<div class="pet-sem-foto" aria-hidden="true">🐶</div>`;

  const status = pet.perdido
    ? `<span class="status status-perdido">🔴 Perdido</span>`
    : `<span class="status status-seguro">🟢 Seguro</span>`;

  const classeStatus = pet.perdido ? "botao-seguro" : "botao-alerta";
  const textoStatus = pet.perdido ? "Marcar como encontrado" : "Ativar modo perdido";

  return `
    <article class="pet-card">
      <div class="pet-foto-area">
        ${foto}
        ${status}
      </div>

      <div class="pet-conteudo">
        <div class="pet-titulo">
          <div>
            <div class="pet-nome">${escaparHtml(formatarTexto(pet.nome, "Pet"))}</div>
            <div class="pet-tag">Tag: ${escaparHtml(formatarTexto(pet.tagCodigo, "Não informada"))}</div>
          </div>
        </div>

        <div class="pet-dados">
          <div class="pet-dado">
            <div class="pet-dado-label">Perfil</div>
            <div class="pet-dado-valor">${escaparHtml(formatarTexto(especieRaca))}</div>
          </div>

          <div class="pet-dado">
            <div class="pet-dado-label">Localização</div>
            <div class="pet-dado-valor">${escaparHtml(montarLocalizacao(petOriginal))}</div>
          </div>
        </div>

        <div class="acoes">
          <button
            class="botao botao-principal"
            type="button"
            data-acao="ver-perfil"
            data-tag="${escaparHtml(pet.tagCodigo)}"
          >
            Ver perfil
          </button>

          <button
            class="botao botao-secundario"
            type="button"
            data-acao="historico"
            data-tag="${escaparHtml(pet.tagCodigo)}"
          >
            Histórico
          </button>

          <button class="botao botao-timeline" type="button" data-acao="timeline" data-tag="${escaparHtml(pet.tagCodigo)}">
            Timeline
          </button>

          <button class="botao botao-saude" type="button" data-acao="saude" data-tag="${escaparHtml(pet.tagCodigo)}">
            Vacinas
          </button>

          <button class="botao botao-documentos" type="button" data-acao="documentos" data-tag="${escaparHtml(pet.tagCodigo)}">
            Documentos
          </button>

          <button class="botao botao-foto" type="button" data-acao="foto" data-tag="${escaparHtml(pet.tagCodigo)}">
            Alterar foto
          </button>

          <button class="botao botao-editar" type="button" data-acao="editar" data-tag="${escaparHtml(pet.tagCodigo)}">
            Editar informações
          </button>

          <button class="botao ${classeStatus}" type="button" data-acao="modo-perdido" data-tag="${escaparHtml(pet.tagCodigo)}" data-perdido="${pet.perdido ? "1" : "0"}">
            ${textoStatus}
          </button>
        </div>
      </div>
    </article>
  `;
}

function abrirPerfilTutor(evento) {
  const tag = evento.currentTarget.dataset.tag;

  if (!tag) {
    exibirMensagem("A tag deste pet não foi identificada.", "erro");
    return;
  }

  if (window.OrbitekNavigation?.abrirPerfilTutor) {
    window.OrbitekNavigation.abrirPerfilTutor(tag);
    return;
  }

  window.open(
    `/t.html?tag=${encodeURIComponent(tag)}&origem=tutor`,
    "_blank",
    "noopener"
  );
}

function abrirHistoricoTutor(evento) {
  const tag = evento.currentTarget.dataset.tag;

  if (!tag) {
    exibirMensagem("A tag deste pet não foi identificada.", "erro");
    return;
  }

  if (window.OrbitekNavigation?.abrirHistoricoTutor) {
    window.OrbitekNavigation.abrirHistoricoTutor(tag);
    return;
  }

  window.location.href =
    `/historico.html?tag=${encodeURIComponent(tag)}&origem=tutor`;
}

function renderizarPets(pets) {
  elementos.listaPets.innerHTML = pets.map(criarCardPet).join("");

  elementos.listaPets.querySelectorAll('[data-acao="ver-perfil"]').forEach((botao) => {
    botao.addEventListener("click", abrirPerfilTutor);
  });

  elementos.listaPets.querySelectorAll('[data-acao="historico"]').forEach((botao) => {
    botao.addEventListener("click", abrirHistoricoTutor);
  });

  elementos.listaPets.querySelectorAll('[data-acao="modo-perdido"]').forEach((botao) => {
    botao.addEventListener("click", alterarModoPerdido);
  });

  elementos.listaPets.querySelectorAll('[data-acao="editar"]').forEach((botao) => {
    botao.addEventListener("click", abrirModalEdicao);
  });

  elementos.listaPets.querySelectorAll('[data-acao="foto"]').forEach((botao) => {
    botao.addEventListener("click", abrirModalFoto);
  });

  elementos.listaPets.querySelectorAll('[data-acao="saude"]').forEach((botao) => {
    botao.addEventListener("click", abrirModalSaude);
  });

  elementos.listaPets.querySelectorAll('[data-acao="documentos"]').forEach((botao) => {
    botao.addEventListener("click", abrirModalDocumentos);
  });
}

function definirValor(elemento, valor) {
  if (elemento) elemento.value = valor ?? "";
}

function preencherFormulario(petOriginal) {
  const pet = dadosPet(petOriginal);

  definirValor(elementos.editarTag, pet.tagCodigo);
  definirValor(elementos.editarNome, pet.nome);
  definirValor(elementos.editarEspecie, pet.especie);
  definirValor(elementos.editarRaca, pet.raca);
  definirValor(elementos.editarSexo, pet.sexo);
  definirValor(elementos.editarIdade, pet.idade);
  definirValor(elementos.editarComportamento, pet.comportamento);
  definirValor(elementos.editarTutor, pet.nomeTutor);
  definirValor(elementos.editarWhatsapp, pet.whatsapp);
  definirValor(elementos.editarEmail, pet.email);
  definirValor(elementos.editarCep, pet.cep);
  definirValor(elementos.editarCidade, pet.cidade);
  definirValor(elementos.editarEstado, pet.estado);
  definirValor(elementos.editarEndereco, pet.logradouro);
  atualizarStatusSecoes();
  estado.formularioInicial = serializarFormulario();
  estado.formularioAlterado = false;
  atualizarAvisoAlteracoes();
}

function abrirModalEdicao(evento) {
  const tag = evento.currentTarget.dataset.tag;
  const pet = estado.pets.find((item) => String(dadosPet(item).tagCodigo) === String(tag));

  if (!pet) {
    exibirMensagem("Não foi possível localizar este pet.", "erro");
    return;
  }

  if (!elementos.modalEditar || !elementos.formEditarPet) {
    exibirMensagem("O modal de edição não foi encontrado no tutor.html.", "erro");
    return;
  }

  estado.petEmEdicao = pet;
  preencherFormulario(pet);
  elementos.modalEditar.hidden = false;
  document.body.classList.add("modal-aberto");
  selecionarAbaEdicao("pet");
  setTimeout(() => elementos.editarNome?.focus(), 50);
}

async function fecharModalEdicao(forcar = false) {
  if (estado.salvando || !elementos.modalEditar) return;
  if (!forcar && estado.formularioAlterado) {
    const sair = window.OrbitekUI?.confirmar
      ? await window.OrbitekUI.confirmar({ titulo: "Alterações não salvas", mensagem: "Você modificou informações. Deseja sair sem salvar?", textoConfirmar: "Sair sem salvar" })
      : window.confirm("Você possui alterações não salvas. Deseja sair sem salvar?");
    if (!sair) return;
  }
  elementos.modalEditar.hidden = true;
  document.body.classList.remove("modal-aberto");
  elementos.formEditarPet?.reset();
  estado.petEmEdicao = null;
  estado.formularioInicial = "";
  estado.formularioAlterado = false;
  atualizarAvisoAlteracoes();
}

function serializarFormulario() {
  return JSON.stringify(dadosFormulario());
}

function atualizarAvisoAlteracoes() {
  if (elementos.avisoAlteracoes) elementos.avisoAlteracoes.hidden = !estado.formularioAlterado;
}

function marcarAlteracaoFormulario() {
  if (!elementos.formEditarPet || !estado.petEmEdicao) return;
  estado.formularioAlterado = serializarFormulario() !== estado.formularioInicial;
  atualizarAvisoAlteracoes();
  atualizarStatusSecoes();
}

function definirStatusSecao(elemento, completo) {
  if (!elemento) return;
  elemento.textContent = completo ? "✓ Completo" : "⚠ Pendente";
  elemento.classList.toggle("completo", completo);
  elemento.classList.toggle("pendente", !completo);
}

function atualizarStatusSecoes() {
  const d = dadosFormulario();
  definirStatusSecao(elementos.statusSecaoPet, Boolean(d.nome && d.especie && d.raca && d.sexo));
  definirStatusSecao(elementos.statusSecaoTutor, Boolean(d.nomeTutor && (d.whatsapp || d.email)));
  definirStatusSecao(elementos.statusSecaoEndereco, Boolean(d.cidade && d.estado));
}

function selecionarAbaEdicao(nome) {
  document.querySelectorAll("[data-edicao-aba]").forEach((botao) => {
    const ativa = botao.dataset.edicaoAba === nome;
    botao.classList.toggle("ativa", ativa);
    botao.setAttribute("aria-selected", String(ativa));
  });
  document.querySelectorAll("[data-edicao-painel]").forEach((painel) => {
    const ativo = painel.dataset.edicaoPainel === nome;
    painel.hidden = !ativo;
    painel.classList.toggle("ativa", ativo);
  });
}

function dadosFormulario() {
  return {
    tagCodigo: elementos.editarTag?.value.trim() ?? "",
    nome: elementos.editarNome?.value.trim() ?? "",
    especie: elementos.editarEspecie?.value.trim() ?? "",
    raca: elementos.editarRaca?.value.trim() ?? "",
    sexo: elementos.editarSexo?.value.trim() ?? "",
    idade: elementos.editarIdade?.value.trim() ?? "",
    comportamento: elementos.editarComportamento?.value.trim() ?? "",
    nomeTutor: elementos.editarTutor?.value.trim() ?? "",
    whatsapp: elementos.editarWhatsapp?.value.trim() ?? "",
    email: elementos.editarEmail?.value.trim() ?? "",
    cep: elementos.editarCep?.value.trim() ?? "",
    cidade: elementos.editarCidade?.value.trim() ?? "",
    estado: elementos.editarEstado?.value.trim().toUpperCase() ?? "",
    logradouro: elementos.editarEndereco?.value.trim() ?? "",
  };
}

function validarFormulario(dados) {
  if (!dados.tagCodigo) return "A tag do pet não foi identificada.";
  if (!dados.nome) return "Informe o nome do pet.";
  if (!dados.nomeTutor) return "Informe o nome do tutor.";

  const telefone = somenteNumeros(dados.whatsapp);
  if (telefone.length < 10 || telefone.length > 13) return "Informe um WhatsApp válido com DDD.";

  if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    return "Informe um e-mail válido.";
  }

  if (dados.cep && somenteNumeros(dados.cep).length !== 8) {
    return "Informe um CEP válido com 8 números.";
  }

  if (dados.estado && dados.estado.length !== 2) {
    return "Informe o estado usando a sigla com 2 letras.";
  }

  return "";
}

function definirBotaoSalvar(ativo) {
  const botao = elementos.formEditarPet?.querySelector('button[type="submit"]');
  if (!botao) return;

  if (ativo) {
    botao.dataset.textoOriginal = botao.textContent;
    botao.disabled = true;
    botao.textContent = "Salvando...";
  } else {
    botao.disabled = false;
    botao.textContent = botao.dataset.textoOriginal || "Salvar alterações";
  }
}

async function salvarEdicao(evento) {
  evento.preventDefault();
  if (estado.salvando) return;

  const dados = dadosFormulario();
  const erro = validarFormulario(dados);

  if (erro) {
    exibirMensagem(erro, "erro");
    return;
  }

  estado.salvando = true;
  definirBotaoSalvar(true);

  try {
    const resposta = await fetch("/api/tutor-salvar", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dados),
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || resultado.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(resultado.mensagem || "Não foi possível salvar as informações.");
    }

    exibirMensagem(resultado.mensagem || "Informações atualizadas com sucesso.");
    elementos.modalEditar.hidden = true;
    document.body.classList.remove("modal-aberto");
    estado.petEmEdicao = null;
    estado.formularioAlterado = false;
    estado.formularioInicial = "";
    atualizarAvisoAlteracoes();
    await carregarPainel();
  } catch (erroSalvar) {
    console.error("Erro ao salvar:", erroSalvar);
    exibirMensagem(erroSalvar.message || "Não foi possível salvar as informações.", "erro");
  } finally {
    estado.salvando = false;
    definirBotaoSalvar(false);
  }
}

async function buscarCep() {
  if (!elementos.editarCep || estado.buscandoCep) return;

  const cep = somenteNumeros(elementos.editarCep.value);
  if (!cep) return;

  if (cep.length !== 8) {
    exibirMensagem("Informe um CEP válido com 8 números.", "erro");
    return;
  }

  estado.buscandoCep = true;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const endereco = await resposta.json();

    if (!resposta.ok || endereco.erro) throw new Error("CEP não encontrado.");

    definirValor(elementos.editarEndereco, endereco.logradouro);
    definirValor(elementos.editarCidade, endereco.localidade);
    definirValor(elementos.editarEstado, endereco.uf);
  } catch (erro) {
    exibirMensagem(erro.message || "Não foi possível consultar o CEP.", "erro");
  } finally {
    estado.buscandoCep = false;
  }
}


function limparPreviewFoto() {
  if (estado.urlPreviewFoto) {
    URL.revokeObjectURL(estado.urlPreviewFoto);
    estado.urlPreviewFoto = "";
  }

  if (elementos.arquivoFoto) elementos.arquivoFoto.value = "";
  if (elementos.fotoPreview) {
    elementos.fotoPreview.src = "";
    elementos.fotoPreview.hidden = true;
  }
  if (elementos.fotoPreviewVazio) elementos.fotoPreviewVazio.hidden = false;
  if (elementos.nomeArquivoFoto) {
    elementos.nomeArquivoFoto.textContent = "Nenhuma imagem selecionada.";
  }
  if (elementos.enviarFoto) elementos.enviarFoto.disabled = true;
}

function mostrarFotoAtual(petOriginal) {
  const pet = dadosPet(petOriginal);

  if (pet.fotoUrl && elementos.fotoPreview) {
    elementos.fotoPreview.src = pet.fotoUrl;
    elementos.fotoPreview.hidden = false;
    if (elementos.fotoPreviewVazio) elementos.fotoPreviewVazio.hidden = true;
  }
}

function abrirModalFoto(evento) {
  const tag = evento.currentTarget.dataset.tag;
  const pet = estado.pets.find(
    (item) => String(dadosPet(item).tagCodigo) === String(tag)
  );

  if (!pet || !elementos.modalFoto || !elementos.formFotoPet) {
    exibirMensagem("Não foi possível abrir a alteração de foto.", "erro");
    return;
  }

  estado.petEmEdicao = pet;
  limparPreviewFoto();

  const dados = dadosPet(pet);
  definirValor(elementos.fotoTag, dados.tagCodigo);

  if (elementos.fotoNomePet) {
    elementos.fotoNomePet.textContent = formatarTexto(dados.nome, "Pet");
  }

  mostrarFotoAtual(pet);
  elementos.modalFoto.hidden = false;
  document.body.classList.add("modal-aberto");
}

function fecharModalFoto() {
  if (estado.enviandoFoto || !elementos.modalFoto) return;

  elementos.modalFoto.hidden = true;
  limparPreviewFoto();
  estado.petEmEdicao = null;

  const algumModalAberto =
    (elementos.modalEditar && !elementos.modalEditar.hidden) ||
    (elementos.modalFoto && !elementos.modalFoto.hidden);

  if (!algumModalAberto) {
    document.body.classList.remove("modal-aberto");
  }
}

function aoSelecionarFoto() {
  const arquivo = elementos.arquivoFoto?.files?.[0];

  if (!arquivo) {
    limparPreviewFoto();
    if (estado.petEmEdicao) mostrarFotoAtual(estado.petEmEdicao);
    return;
  }

  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  const tamanhoMaximo = 5 * 1024 * 1024;

  if (!tiposPermitidos.includes(arquivo.type)) {
    exibirMensagem("Escolha uma imagem JPG, PNG ou WEBP.", "erro");
    limparPreviewFoto();
    if (estado.petEmEdicao) mostrarFotoAtual(estado.petEmEdicao);
    return;
  }

  if (arquivo.size > tamanhoMaximo) {
    exibirMensagem("A imagem deve ter no máximo 5 MB.", "erro");
    limparPreviewFoto();
    if (estado.petEmEdicao) mostrarFotoAtual(estado.petEmEdicao);
    return;
  }

  if (estado.urlPreviewFoto) {
    URL.revokeObjectURL(estado.urlPreviewFoto);
  }

  estado.urlPreviewFoto = URL.createObjectURL(arquivo);

  if (elementos.fotoPreview) {
    elementos.fotoPreview.src = estado.urlPreviewFoto;
    elementos.fotoPreview.hidden = false;
  }

  if (elementos.fotoPreviewVazio) elementos.fotoPreviewVazio.hidden = true;
  if (elementos.nomeArquivoFoto) {
    elementos.nomeArquivoFoto.textContent = arquivo.name;
  }
  if (elementos.enviarFoto) elementos.enviarFoto.disabled = false;
}

async function enviarNovaFoto(evento) {
  evento.preventDefault();

  if (estado.enviandoFoto) return;

  const arquivo = elementos.arquivoFoto?.files?.[0];
  const tagCodigo = elementos.fotoTag?.value.trim() ?? "";

  if (!arquivo || !tagCodigo) {
    exibirMensagem("Escolha uma imagem antes de enviar.", "erro");
    return;
  }

  estado.enviandoFoto = true;

  const textoOriginal = elementos.enviarFoto?.textContent || "Enviar nova foto";
  if (elementos.enviarFoto) {
    elementos.enviarFoto.disabled = true;
    elementos.enviarFoto.textContent = "Enviando...";
  }

  try {
    const formulario = new FormData();
    formulario.append("foto", arquivo);
    formulario.append("tagCodigo", tagCodigo);

    const resposta = await fetch("/api/tutor-foto", {
      method: "POST",
      credentials: "same-origin",
      body: formulario,
      headers: {
        Accept: "application/json",
      },
    });

    const dados = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || dados.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(dados.mensagem || "Não foi possível atualizar a foto.");
    }

    exibirMensagem(dados.mensagem || "Foto atualizada com sucesso.");
    fecharModalFotoForcado();
    await carregarPainel();
  } catch (erro) {
    exibirMensagem(erro.message || "Não foi possível atualizar a foto.", "erro");
  } finally {
    estado.enviandoFoto = false;

    if (elementos.enviarFoto) {
      elementos.enviarFoto.textContent = textoOriginal;
      elementos.enviarFoto.disabled = !elementos.arquivoFoto?.files?.[0];
    }
  }
}

function fecharModalFotoForcado() {
  if (!elementos.modalFoto) return;

  elementos.modalFoto.hidden = true;
  limparPreviewFoto();
  estado.petEmEdicao = null;
  document.body.classList.remove("modal-aberto");
}



function iconeTipoSaude(tipo) {
  const icones = {
    Vacina: "💉",
    "Vermífugo": "🐛",
    Antipulgas: "🦟",
    Medicamento: "💊",
    Consulta: "🏥",
    Exame: "📄",
    Outro: "❤️",
  };

  return icones[tipo] || "🩺";
}

function formatarDataSaude(valor) {
  const texto = String(valor || "").trim();
  if (!texto) return "";

  const partes = texto.slice(0, 10).split("-");
  if (partes.length !== 3) return texto;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function limparFormSaude() {
  definirValor(elementos.saudeId, "");
  definirValor(elementos.saudeTipo, "Vacina");
  definirValor(elementos.saudeNome, "");
  definirValor(elementos.saudeFabricante, "");
  definirValor(elementos.saudeLote, "");
  definirValor(elementos.saudeVeterinario, "");
  definirValor(elementos.saudeDataAplicacao, "");
  definirValor(elementos.saudeProximaData, "");
  definirValor(elementos.saudeObservacoes, "");

  if (elementos.tituloFormSaude) {
    elementos.tituloFormSaude.textContent = "Nova vacina";
  }

  if (elementos.salvarSaude) {
    elementos.salvarSaude.textContent = "Salvar vacina";
  }
}

function mostrarFormSaude(registro = null) {
  limparFormSaude();

  if (registro) {
    definirValor(elementos.saudeId, registro.id);
    definirValor(elementos.saudeTipo, registro.tipo);
    definirValor(elementos.saudeNome, registro.nome);
    definirValor(elementos.saudeFabricante, registro.fabricante);
    definirValor(elementos.saudeLote, registro.lote);
    definirValor(elementos.saudeVeterinario, registro.veterinario);
    definirValor(elementos.saudeDataAplicacao, registro.dataAplicacao || registro.data_aplicacao);
    definirValor(elementos.saudeProximaData, registro.proximaData || registro.proxima_data);
    definirValor(elementos.saudeObservacoes, registro.observacoes);

    if (elementos.tituloFormSaude) {
      elementos.tituloFormSaude.textContent = "Editar vacina";
    }
  }

  if (elementos.formSaude) elementos.formSaude.hidden = false;
  setTimeout(() => elementos.saudeNome?.focus(), 40);
}

function esconderFormSaude() {
  if (estado.salvandoSaude) return;
  if (elementos.formSaude) elementos.formSaude.hidden = true;
  limparFormSaude();
}

function statusVacina(proximaData) {
  if (!proximaData) return { texto: "Sem próxima dose", classe: "neutro" };
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(`${proximaData}T00:00:00`);
  const dias = Math.ceil((alvo - hoje) / 86400000);
  if (dias < 0) return { texto: `Atrasada há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"}`, classe: "atrasada" };
  if (dias === 0) return { texto: "Vence hoje", classe: "vencendo" };
  if (dias <= 30) return { texto: `Vence em ${dias} dia${dias === 1 ? "" : "s"}`, classe: "vencendo" };
  return { texto: "Em dia", classe: "emdia" };
}

function prioridadeVacina(registro) {
  const proximaData = registro.proximaData || registro.proxima_data || "";
  const prioridades = { atrasada: 0, vencendo: 1, emdia: 2, neutro: 3 };
  return prioridades[statusVacina(proximaData).classe] ?? 4;
}

function ordenarVacinas(registros) {
  return [...registros].sort((a, b) => {
    const prioridade = prioridadeVacina(a) - prioridadeVacina(b);
    if (prioridade) return prioridade;

    const proximaA = a.proximaData || a.proxima_data || "9999-12-31";
    const proximaB = b.proximaData || b.proxima_data || "9999-12-31";
    if (proximaA !== proximaB) return proximaA.localeCompare(proximaB);

    const aplicacaoA = a.dataAplicacao || a.data_aplicacao || "0000-00-00";
    const aplicacaoB = b.dataAplicacao || b.data_aplicacao || "0000-00-00";
    return aplicacaoB.localeCompare(aplicacaoA) || Number(b.id || 0) - Number(a.id || 0);
  });
}

function criarCardSaude(registro) {
  const dataAplicacao = registro.dataAplicacao || registro.data_aplicacao || "";
  const proximaData = registro.proximaData || registro.proxima_data || "";
  const observacoes = String(registro.observacoes || "").trim();
  const status = statusVacina(proximaData);
  const detalhes = [
    registro.fabricante ? `<span><strong>Fabricante:</strong> ${escaparHtml(registro.fabricante)}</span>` : "",
    registro.lote ? `<span><strong>Lote:</strong> ${escaparHtml(registro.lote)}</span>` : "",
    registro.veterinario ? `<span><strong>Veterinário:</strong> ${escaparHtml(registro.veterinario)}</span>` : "",
  ].filter(Boolean).join("");
  return `
    <article class="saude-card saude-card-${status.classe}">
      <div class="saude-card-icone" aria-hidden="true">💉</div>
      <div class="saude-card-corpo">
        <div class="saude-card-cabecalho"><div><div class="saude-card-tipo">Vacina</div><div class="saude-card-nome">${escaparHtml(formatarTexto(registro.nome, "Vacina"))}</div></div><span class="vacina-status vacina-status-${status.classe}">${escaparHtml(status.texto)}</span></div>
        <div class="saude-card-datas"><span><strong>Aplicada:</strong> ${escaparHtml(formatarDataSaude(dataAplicacao))}</span>${proximaData ? `<span><strong>Próxima dose:</strong> ${escaparHtml(formatarDataSaude(proximaData))}</span>` : ""}</div>
        ${detalhes ? `<div class="saude-card-detalhes">${detalhes}</div>` : ""}
        ${observacoes ? `<div class="saude-card-observacoes">${escaparHtml(observacoes)}</div>` : ""}
      </div>
      <div class="saude-card-acoes"><button class="saude-acao" type="button" title="Editar vacina" aria-label="Editar vacina" data-saude-acao="editar" data-id="${escaparHtml(registro.id)}">✏️</button><button class="saude-acao saude-acao-excluir" type="button" title="Excluir vacina" aria-label="Excluir vacina" data-saude-acao="excluir" data-id="${escaparHtml(registro.id)}">🗑️</button></div>
    </article>`;
}

function renderizarSaude() {
  const registros = estado.registrosSaude;
  const contadores = registros.reduce((total, registro) => {
    const classe = statusVacina(registro.proximaData || registro.proxima_data || "").classe;
    if (classe === "atrasada") total.atrasadas += 1;
    else if (classe === "vencendo") total.proximas += 1;
    else total.emDia += 1;
    return total;
  }, { emDia: 0, proximas: 0, atrasadas: 0 });

  if (elementos.saudeResumo) elementos.saudeResumo.textContent = registros.length
    ? `${registros.length} vacina${registros.length === 1 ? "" : "s"} cadastrada${registros.length === 1 ? "" : "s"}, ordenadas por prioridade.`
    : "Nenhuma vacina cadastrada.";
  if (elementos.saudeDashboard) elementos.saudeDashboard.hidden = registros.length === 0;
  if (elementos.saudeEmDia) elementos.saudeEmDia.textContent = String(contadores.emDia);
  if (elementos.saudeProximas) elementos.saudeProximas.textContent = String(contadores.proximas);
  if (elementos.saudeAtrasadas) elementos.saudeAtrasadas.textContent = String(contadores.atrasadas);

  if (elementos.saudeVazio) elementos.saudeVazio.hidden = registros.length > 0;
  if (elementos.listaSaude) {
    elementos.listaSaude.innerHTML = registros.map(criarCardSaude).join("");
  }

  elementos.listaSaude
    ?.querySelectorAll('[data-saude-acao="editar"]')
    .forEach((botao) => {
      botao.addEventListener("click", () => {
        const registro = estado.registrosSaude.find(
          (item) => String(item.id) === String(botao.dataset.id)
        );

        if (registro) mostrarFormSaude(registro);
      });
    });

  elementos.listaSaude
    ?.querySelectorAll('[data-saude-acao="excluir"]')
    .forEach((botao) => {
      botao.addEventListener("click", excluirRegistroSaude);
    });
}

async function carregarSaude() {
  const tagCodigo = elementos.saudeTag?.value.trim() || "";
  if (!tagCodigo || estado.carregandoSaude) return;

  estado.carregandoSaude = true;
  if (elementos.saudeCarregando) elementos.saudeCarregando.hidden = false;
  if (elementos.listaSaude) elementos.listaSaude.innerHTML = "";
  if (elementos.saudeVazio) elementos.saudeVazio.hidden = true;

  try {
    const resposta = await fetch(
      `/api/saude-listar?tagCodigo=${encodeURIComponent(tagCodigo)}`,
      {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      }
    );

    const dados = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || dados.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(dados.mensagem || "Não foi possível carregar as vacinas.");
    }

    estado.registrosSaude = Array.isArray(dados.registros) ? ordenarVacinas(dados.registros) : [];
    renderizarSaude();
  } catch (erro) {
    estado.registrosSaude = [];
    renderizarSaude();
    exibirMensagem(erro.message || "Não foi possível carregar as vacinas do pet.", "erro");
  } finally {
    estado.carregandoSaude = false;
    if (elementos.saudeCarregando) elementos.saudeCarregando.hidden = true;
  }
}

function abrirModalSaude(evento) {
  const tag = evento.currentTarget.dataset.tag;
  const pet = estado.pets.find(
    (item) => String(dadosPet(item).tagCodigo) === String(tag)
  );

  if (!pet || !elementos.modalSaude) {
    exibirMensagem("Não foi possível abrir as vacinas deste pet.", "erro");
    return;
  }

  const dados = dadosPet(pet);
  estado.petEmEdicao = pet;
  estado.registrosSaude = [];

  definirValor(elementos.saudeTag, dados.tagCodigo);

  if (elementos.saudeNomePet) {
    elementos.saudeNomePet.textContent = formatarTexto(dados.nome, "Pet");
  }

  if (elementos.saudeResumo) {
    elementos.saudeResumo.textContent = "Carregando vacinas...";
  }

  esconderFormSaude();
  elementos.modalSaude.hidden = false;
  document.body.classList.add("modal-aberto");
  carregarSaude();
}

function fecharModalSaude() {
  if (estado.salvandoSaude || !elementos.modalSaude) return;

  elementos.modalSaude.hidden = true;
  estado.registrosSaude = [];
  estado.petEmEdicao = null;
  esconderFormSaude();

  const algumModalAberto =
    (elementos.modalEditar && !elementos.modalEditar.hidden) ||
    (elementos.modalFoto && !elementos.modalFoto.hidden) ||
    (elementos.modalSaude && !elementos.modalSaude.hidden);

  if (!algumModalAberto) {
    document.body.classList.remove("modal-aberto");
  }
}

async function salvarRegistroSaude(evento) {
  evento.preventDefault();
  if (estado.salvandoSaude) return;

  const dados = {
    id: elementos.saudeId?.value.trim() || null,
    tagCodigo: elementos.saudeTag?.value.trim() || "",
    tipo: "Vacina",
    nome: elementos.saudeNome?.value.trim() || "",
    fabricante: elementos.saudeFabricante?.value.trim() || "",
    lote: elementos.saudeLote?.value.trim() || "",
    veterinario: elementos.saudeVeterinario?.value.trim() || "",
    dataAplicacao: elementos.saudeDataAplicacao?.value || "",
    proximaData: elementos.saudeProximaData?.value || "",
    observacoes: elementos.saudeObservacoes?.value.trim() || "",
  };

  if (!dados.tagCodigo || !dados.nome || !dados.dataAplicacao) {
    exibirMensagem("Preencha o nome da vacina e a data de aplicação.", "erro");
    return;
  }

  if (
    dados.dataAplicacao &&
    dados.proximaData &&
    dados.proximaData < dados.dataAplicacao
  ) {
    exibirMensagem("A próxima data não pode ser anterior à data do registro.", "erro");
    return;
  }

  estado.salvandoSaude = true;
  const textoOriginal = elementos.salvarSaude?.textContent || "Salvar vacina";

  if (elementos.salvarSaude) {
    elementos.salvarSaude.disabled = true;
    elementos.salvarSaude.innerHTML = '<span class="saude-spinner saude-spinner-botao" aria-hidden="true"></span> Salvando...';
  }

  elementos.formSaude?.querySelectorAll("input, select, textarea, button").forEach((campo) => {
    campo.disabled = true;
  });

  try {
    const resposta = await fetch("/api/saude-salvar", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dados),
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || resultado.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(resultado.mensagem || "Não foi possível salvar o registro.");
    }

    exibirMensagem(resultado.mensagem || "Registro salvo com sucesso.");
    esconderFormSaudeForcado();
    await carregarSaude();
  } catch (erro) {
    exibirMensagem(erro.message || "Não foi possível salvar o registro.", "erro");
  } finally {
    estado.salvandoSaude = false;

    if (elementos.salvarSaude) {
      elementos.salvarSaude.textContent = textoOriginal;
    }
    elementos.formSaude?.querySelectorAll("input, select, textarea, button").forEach((campo) => {
      campo.disabled = false;
    });
  }
}

function esconderFormSaudeForcado() {
  if (elementos.formSaude) elementos.formSaude.hidden = true;
  limparFormSaude();
}

async function excluirRegistroSaude(evento) {
  const id = evento.currentTarget.dataset.id;
  const tagCodigo = elementos.saudeTag?.value.trim() || "";

  if (!id || !tagCodigo) return;

  const confirmar = window.OrbitekUI?.confirmar
    ? await window.OrbitekUI.confirmar({
        titulo: "Excluir vacina?",
        mensagem: "Esta ação não poderá ser desfeita.",
        textoConfirmar: "Excluir vacina",
      })
    : window.confirm("Deseja realmente excluir esta vacina?");

  if (!confirmar) return;

  const botao = evento.currentTarget;
  botao.disabled = true;
  botao.textContent = "…";

  try {
    const resposta = await fetch("/api/saude-excluir", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id, tagCodigo }),
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || resultado.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(resultado.mensagem || "Não foi possível excluir o registro.");
    }

    exibirMensagem(resultado.mensagem || "Registro excluído.");
    await carregarSaude();
  } catch (erro) {
    botao.disabled = false;
    exibirMensagem(erro.message || "Não foi possível excluir o registro.", "erro");
  }
}



function formatarTamanhoArquivo(bytes) {
  const tamanho = Number(bytes || 0);
  if (!tamanho) return "";

  if (tamanho < 1024) return `${tamanho} B`;
  if (tamanho < 1024 * 1024) return `${(tamanho / 1024).toFixed(1)} KB`;

  return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarDataDocumento(valor) {
  const texto = String(valor || "").trim();
  if (!texto) return "";

  const data = new Date(texto.includes("T") ? texto : texto.replace(" ", "T") + "Z");
  if (Number.isNaN(data.getTime())) return texto;

  return data.toLocaleDateString("pt-BR");
}

function iconeCategoriaDocumento(categoria) {
  const icones = {
    "Carteira de vacinação": "💉",
    Receita: "🧾",
    Exame: "🩸",
    Laudo: "📋",
    Foto: "📷",
    Outro: "📄",
  };

  return icones[categoria] || "📄";
}

function limparFormDocumento() {
  definirValor(elementos.documentoId, "");
  definirValor(elementos.documentoCategoria, "");
  definirValor(elementos.documentoTitulo, "");
  definirValor(elementos.documentoData, new Date().toISOString().slice(0, 10));
  definirValor(elementos.documentoProfissional, "");
  definirValor(elementos.documentoObservacoes, "");

  if (elementos.documentoArquivo) elementos.documentoArquivo.value = "";
  if (elementos.documentoArquivoTexto) {
    elementos.documentoArquivoTexto.textContent = "Escolher arquivo";
  }

  if (elementos.tituloFormDocumento) {
    elementos.tituloFormDocumento.textContent = "Enviar documento";
  }

  if (elementos.salvarDocumento) {
    elementos.salvarDocumento.textContent = "Enviar documento";
  }

  if (elementos.campoArquivoDocumento) elementos.campoArquivoDocumento.hidden = false;
  if (elementos.documentoEdicaoAviso) elementos.documentoEdicaoAviso.hidden = true;
}

function mostrarFormDocumento(documento = null) {
  limparFormDocumento();

  if (documento) {
    definirValor(elementos.documentoId, documento.id);
    definirValor(elementos.documentoCategoria, documento.categoria);
    definirValor(elementos.documentoTitulo, documento.titulo);
    definirValor(elementos.documentoData, documento.dataDocumento || documento.data_documento || "");
    definirValor(elementos.documentoProfissional, documento.profissional || "");
    definirValor(elementos.documentoObservacoes, documento.observacoes || "");

    if (elementos.tituloFormDocumento) {
      elementos.tituloFormDocumento.textContent = "Editar documento";
    }

    if (elementos.salvarDocumento) {
      elementos.salvarDocumento.textContent = "Salvar alterações";
    }

    if (elementos.campoArquivoDocumento) elementos.campoArquivoDocumento.hidden = true;
    if (elementos.documentoEdicaoAviso) elementos.documentoEdicaoAviso.hidden = false;
  }

  if (elementos.formDocumento) elementos.formDocumento.hidden = false;
  setTimeout(() => elementos.documentoCategoria?.focus(), 40);
}

function esconderFormDocumento() {
  if (estado.salvandoDocumento) return;
  if (elementos.formDocumento) elementos.formDocumento.hidden = true;
  limparFormDocumento();
}

function criarCardDocumento(documento) {
  const ehPdf =
    documento.arquivoTipo === "application/pdf" ||
    documento.arquivo_tipo === "application/pdf";

  const url = documento.arquivoUrl || documento.arquivo_url || "";
  const nomeArquivo = documento.nomeArquivo || documento.nome_arquivo || "";
  const tamanho = documento.tamanhoBytes || documento.tamanho_bytes || 0;
  const criadoEm = documento.criadoEm || documento.criado_em || "";
  const dataDocumento = documento.dataDocumento || documento.data_documento || "";

  const preview = ehPdf
    ? `<div class="documento-preview-pdf" aria-hidden="true">📕</div>`
    : `<img src="${escaparHtml(url)}" alt="${escaparHtml(documento.titulo)}" loading="lazy">`;

  const detalhes = [
    ehPdf ? "PDF" : "Imagem",
    formatarTamanhoArquivo(tamanho),
    formatarDataDocumento(dataDocumento || criadoEm),
    documento.profissional,
  ].filter(Boolean).join(" • ");

  return `
    <article class="documento-card">
      <div class="documento-preview">
        ${preview}
        <span class="documento-categoria">
          ${iconeCategoriaDocumento(documento.categoria)}
          ${escaparHtml(documento.categoria)}
        </span>
      </div>

      <div class="documento-card-corpo">
        <div class="documento-card-titulo">${escaparHtml(documento.titulo)}</div>
        <div class="documento-card-detalhes">${escaparHtml(detalhes || nomeArquivo)}</div>
        ${documento.observacoes ? `<div class="documento-card-observacoes">${escaparHtml(documento.observacoes)}</div>` : ""}

        <div class="documento-card-acoes">
          <a
            class="documento-acao"
            href="${escaparHtml(url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            👁️ Abrir
          </a>

          <a
            class="documento-acao"
            href="${escaparHtml(url)}"
            target="_blank"
            rel="noopener noreferrer"
            download="${escaparHtml(nomeArquivo || documento.titulo)}"
          >
            ⬇️ Baixar
          </a>

          <button
            class="documento-acao"
            type="button"
            title="Editar"
            aria-label="Editar"
            data-documento-acao="editar"
            data-id="${escaparHtml(documento.id)}"
          >
            ✏️
          </button>

          <button
            class="documento-acao documento-acao-excluir"
            type="button"
            title="Excluir"
            aria-label="Excluir"
            data-documento-acao="excluir"
            data-id="${escaparHtml(documento.id)}"
          >
            🗑️
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderizarDocumentos() {
  const busca = (elementos.documentosBusca?.value || "").trim().toLocaleLowerCase("pt-BR");
  const categoria = elementos.documentosFiltroCategoria?.value || "";
  const documentos = estado.documentos.filter((item) => {
    if (categoria && item.categoria !== categoria) return false;
    if (!busca) return true;
    return [item.titulo, item.profissional, item.observacoes, item.categoria].some((valor) => String(valor || "").toLocaleLowerCase("pt-BR").includes(busca));
  });

  if (elementos.documentosResumo) {
    elementos.documentosResumo.textContent =
      documentos.length === 1
        ? "1 documento armazenado."
        : `${documentos.length} documento${documentos.length === 1 ? "" : "s"} exibido${documentos.length === 1 ? "" : "s"} de ${estado.documentos.length}.`;
  }

  if (elementos.documentosVazio) {
    elementos.documentosVazio.hidden = documentos.length > 0;
  }

  if (elementos.listaDocumentos) {
    elementos.listaDocumentos.innerHTML = documentos.map(criarCardDocumento).join("");
  }

  elementos.listaDocumentos
    ?.querySelectorAll('[data-documento-acao="editar"]')
    .forEach((botao) => {
      botao.addEventListener("click", () => {
        const documento = estado.documentos.find(
          (item) => String(item.id) === String(botao.dataset.id)
        );

        if (documento) mostrarFormDocumento(documento);
      });
    });

  elementos.listaDocumentos
    ?.querySelectorAll('[data-documento-acao="excluir"]')
    .forEach((botao) => {
      botao.addEventListener("click", excluirDocumento);
    });
}

async function carregarDocumentos() {
  const tagCodigo = elementos.documentosTag?.value.trim() || "";
  if (!tagCodigo || estado.carregandoDocumentos) return;

  estado.carregandoDocumentos = true;

  if (elementos.documentosCarregando) elementos.documentosCarregando.hidden = false;
  if (elementos.listaDocumentos) elementos.listaDocumentos.innerHTML = "";
  if (elementos.documentosVazio) elementos.documentosVazio.hidden = true;

  try {
    const resposta = await fetch(
      `/api/documentos-listar?tagCodigo=${encodeURIComponent(tagCodigo)}`,
      {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      }
    );

    const dados = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || dados.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(dados.mensagem || "Não foi possível carregar os documentos.");
    }

    estado.documentos = Array.isArray(dados.documentos) ? dados.documentos : [];
    renderizarDocumentos();
  } catch (erro) {
    estado.documentos = [];
    renderizarDocumentos();
    exibirMensagem(erro.message || "Não foi possível carregar os documentos.", "erro");
  } finally {
    estado.carregandoDocumentos = false;
    if (elementos.documentosCarregando) elementos.documentosCarregando.hidden = true;
  }
}

function abrirModalDocumentos(evento) {
  const tag = evento.currentTarget.dataset.tag;
  const pet = estado.pets.find(
    (item) => String(dadosPet(item).tagCodigo) === String(tag)
  );

  if (!pet || !elementos.modalDocumentos) {
    exibirMensagem("Não foi possível abrir os documentos deste pet.", "erro");
    return;
  }

  const dados = dadosPet(pet);
  estado.petEmEdicao = pet;
  estado.documentos = [];

  definirValor(elementos.documentosTag, dados.tagCodigo);

  if (elementos.documentosNomePet) {
    elementos.documentosNomePet.textContent = formatarTexto(dados.nome, "Pet");
  }

  if (elementos.documentosResumo) {
    elementos.documentosResumo.textContent = "Carregando documentos...";
  }

  esconderFormDocumento();
  elementos.modalDocumentos.hidden = false;
  document.body.classList.add("modal-aberto");
  carregarDocumentos();
}

function fecharModalDocumentos() {
  if (estado.salvandoDocumento || !elementos.modalDocumentos) return;

  elementos.modalDocumentos.hidden = true;
  estado.documentos = [];
  estado.petEmEdicao = null;
  esconderFormDocumento();

  const algumModalAberto =
    (elementos.modalEditar && !elementos.modalEditar.hidden) ||
    (elementos.modalFoto && !elementos.modalFoto.hidden) ||
    (elementos.modalSaude && !elementos.modalSaude.hidden) ||
    (elementos.modalDocumentos && !elementos.modalDocumentos.hidden);

  if (!algumModalAberto) document.body.classList.remove("modal-aberto");
}

function atualizarNomeArquivoDocumento() {
  const arquivo = elementos.documentoArquivo?.files?.[0];

  if (elementos.documentoArquivoTexto) {
    elementos.documentoArquivoTexto.textContent = arquivo
      ? arquivo.name
      : "Escolher arquivo";
  }

  if (
    arquivo &&
    elementos.documentoTitulo &&
    !elementos.documentoTitulo.value.trim()
  ) {
    elementos.documentoTitulo.value = arquivo.name.replace(/\.[^.]+$/, "");
  }
}

async function salvarDocumento(evento) {
  evento.preventDefault();
  if (estado.salvandoDocumento) return;

  const id = elementos.documentoId?.value.trim() || "";
  const tagCodigo = elementos.documentosTag?.value.trim() || "";
  const categoria = elementos.documentoCategoria?.value.trim() || "";
  const titulo = elementos.documentoTitulo?.value.trim() || "";
  const dataDocumento = elementos.documentoData?.value || "";
  const profissional = elementos.documentoProfissional?.value.trim() || "";
  const observacoes = elementos.documentoObservacoes?.value.trim() || "";
  const arquivo = elementos.documentoArquivo?.files?.[0];

  if (!tagCodigo || !categoria || !titulo) {
    exibirMensagem("Preencha a categoria e o título.", "erro");
    return;
  }

  if (!id && !arquivo) {
    exibirMensagem("Escolha uma imagem ou PDF.", "erro");
    return;
  }

  if (arquivo && arquivo.size > 10 * 1024 * 1024) {
    exibirMensagem("O arquivo deve ter no máximo 10 MB.", "erro");
    return;
  }

  estado.salvandoDocumento = true;
  const textoOriginal = elementos.salvarDocumento?.textContent || "Enviar documento";

  if (elementos.salvarDocumento) {
    elementos.salvarDocumento.disabled = true;
    elementos.salvarDocumento.textContent = id ? "Salvando..." : "Enviando...";
  }

  try {
    let resposta;

    if (id) {
      resposta = await fetch("/api/documentos-atualizar", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id, tagCodigo, categoria, titulo, dataDocumento, profissional, observacoes }),
      });
    } else {
      const formulario = new FormData();
      formulario.append("tagCodigo", tagCodigo);
      formulario.append("categoria", categoria);
      formulario.append("titulo", titulo);
      formulario.append("dataDocumento", dataDocumento);
      formulario.append("profissional", profissional);
      formulario.append("observacoes", observacoes);
      formulario.append("arquivo", arquivo);

      resposta = await fetch("/api/documentos-upload", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        body: formulario,
      });
    }

    const resultado = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || resultado.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(resultado.mensagem || "Não foi possível salvar o documento.");
    }

    exibirMensagem(resultado.mensagem || "Documento salvo com sucesso.");
    estado.salvandoDocumento = false;
    esconderFormDocumento();
    await carregarDocumentos();
  } catch (erro) {
    exibirMensagem(erro.message || "Não foi possível salvar o documento.", "erro");
  } finally {
    estado.salvandoDocumento = false;

    if (elementos.salvarDocumento) {
      elementos.salvarDocumento.disabled = false;
      elementos.salvarDocumento.textContent = textoOriginal;
    }
  }
}

async function excluirDocumento(evento) {
  const id = evento.currentTarget.dataset.id;
  const tagCodigo = elementos.documentosTag?.value.trim() || "";

  if (!id || !tagCodigo) return;

  const confirmar = window.OrbitekUI?.confirmar
    ? await window.OrbitekUI.confirmar({
        titulo: "Excluir documento?",
        mensagem: "O arquivo será removido permanentemente.",
        textoConfirmar: "Excluir documento",
      })
    : window.confirm("Deseja realmente excluir este documento?");

  if (!confirmar) return;

  const botao = evento.currentTarget;
  botao.disabled = true;

  try {
    const resposta = await fetch("/api/documentos-excluir", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id, tagCodigo }),
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (resposta.status === 401 || resultado.autenticado === false) {
      window.location.replace("/login.html");
      return;
    }

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(resultado.mensagem || "Não foi possível excluir o documento.");
    }

    exibirMensagem(resultado.mensagem || "Documento excluído.");
    await carregarDocumentos();
  } catch (erro) {
    botao.disabled = false;
    exibirMensagem(erro.message || "Não foi possível excluir o documento.", "erro");
  }
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

    if (
      respostaTutor.status === 401 ||
      respostaDashboard.status === 401 ||
      dados.autenticado === false ||
      dashboard.autenticado === false
    ) {
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

  const confirmar = window.OrbitekUI?.confirmar
    ? await window.OrbitekUI.confirmar({
        titulo: novoEstado ? "Ativar modo perdido?" : "Pet encontrado?",
        mensagem: novoEstado
          ? "O perfil público destacará que este pet está perdido."
          : "O alerta de pet perdido será removido do perfil público.",
        textoConfirmar: novoEstado ? "Ativar modo perdido" : "Marcar como encontrado",
      })
    : window.confirm(
        novoEstado
          ? "Deseja ativar o modo perdido para este pet?"
          : "Deseja marcar este pet como encontrado?"
      );

  if (!confirmar) return;

  let localPerdido = null;
  if (novoEstado) {
    if (!window.OrbitekSelecionarLocalizacao?.abrir) {
      exibirMensagem("O seletor de localização não foi carregado. Atualize a página e tente novamente.", "erro");
      return;
    }
    localPerdido = await window.OrbitekSelecionarLocalizacao.abrir();
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
  elementos.fecharModal?.addEventListener("click", () => fecharModalEdicao());
  elementos.cancelarEdicao?.addEventListener("click", () => fecharModalEdicao());
  elementos.modalOverlay?.addEventListener("click", () => fecharModalEdicao());
  elementos.formEditarPet?.addEventListener("input", marcarAlteracaoFormulario);
  elementos.formEditarPet?.addEventListener("change", marcarAlteracaoFormulario);
  document.querySelectorAll("[data-edicao-aba]").forEach((botao) => botao.addEventListener("click", () => selecionarAbaEdicao(botao.dataset.edicaoAba)));
  elementos.formEditarPet?.addEventListener("submit", salvarEdicao);
  elementos.editarCep?.addEventListener("blur", buscarCep);

  elementos.fecharModalFoto?.addEventListener("click", fecharModalFoto);
  elementos.cancelarFoto?.addEventListener("click", fecharModalFoto);
  elementos.modalFotoOverlay?.addEventListener("click", fecharModalFoto);
  elementos.arquivoFoto?.addEventListener("change", aoSelecionarFoto);
  elementos.formFotoPet?.addEventListener("submit", enviarNovaFoto);

  elementos.fecharModalSaude?.addEventListener("click", fecharModalSaude);
  elementos.modalSaudeOverlay?.addEventListener("click", fecharModalSaude);
  elementos.novoRegistroSaude?.addEventListener("click", () => mostrarFormSaude());
  elementos.cancelarFormSaude?.addEventListener("click", esconderFormSaude);
  elementos.fecharFormSaude?.addEventListener("click", esconderFormSaude);
  elementos.formSaude?.addEventListener("submit", salvarRegistroSaude);

  elementos.fecharModalDocumentos?.addEventListener("click", fecharModalDocumentos);
  elementos.modalDocumentosOverlay?.addEventListener("click", fecharModalDocumentos);
  elementos.novoDocumento?.addEventListener("click", () => mostrarFormDocumento());
  elementos.cancelarFormDocumento?.addEventListener("click", esconderFormDocumento);
  elementos.fecharFormDocumento?.addEventListener("click", esconderFormDocumento);
  elementos.documentoArquivo?.addEventListener("change", atualizarNomeArquivoDocumento);
  elementos.formDocumento?.addEventListener("submit", salvarDocumento);
  elementos.documentosBusca?.addEventListener("input", renderizarDocumentos);
  elementos.documentosFiltroCategoria?.addEventListener("change", renderizarDocumentos);

  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;

    if (elementos.modalDocumentos && !elementos.modalDocumentos.hidden) {
      fecharModalDocumentos();
      return;
    }

    if (elementos.modalSaude && !elementos.modalSaude.hidden) {
      fecharModalSaude();
      return;
    }

    if (elementos.modalFoto && !elementos.modalFoto.hidden) {
      fecharModalFoto();
      return;
    }

    if (elementos.modalEditar && !elementos.modalEditar.hidden) {
      fecharModalEdicao();
    }
  });
}

configurarEventos();
carregarPainel();
