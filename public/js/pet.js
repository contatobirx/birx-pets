const parametros = new URLSearchParams(window.location.search);
const codigoTag = parametros.get("tag")?.trim().toUpperCase();
const estadoCarregando = document.getElementById("estadoCarregando");
const perfilPet = document.getElementById("perfilPet");
const estadoErro = document.getElementById("estadoErro");
const tituloErro = document.getElementById("tituloErro");
const mensagemErro = document.getElementById("mensagemErro");
const botaoAtivar = document.getElementById("botaoAtivar");
const voltarPerfil = document.getElementById("voltarPerfil");
let telefoneTutor = "";
let temporizadorToast;

const origemPerfil = parametros.get("origem") || "";
if (voltarPerfil) {
  if (origemPerfil === "tutor") { voltarPerfil.href = "/tutor.html"; voltarPerfil.textContent = "← Voltar ao painel"; }
  else if (origemPerfil === "perdidos" || document.referrer.includes("/perdidos")) { voltarPerfil.href = "/perdidos"; voltarPerfil.textContent = "← Voltar para animais perdidos"; }
  else { voltarPerfil.href = "/"; voltarPerfil.textContent = "← Voltar para o início"; }
}

iniciar();

async function iniciar() {
  if (!codigoTag) return mostrarErro("Código não informado", "Não foi possível identificar o código desta tag.");
  try {
    const resultadoApi = await consultarTag();
    const resultado = resultadoApi.dados;
    if (resultado.status === "nao-ativada") return mostrarTagNaoAtivada();
    if (!resultadoApi.ok || !["ativa", "perdido"].includes(resultado.status) || !resultado.pet) {
      return mostrarErro("Não foi possível abrir esta tag", resultado.mensagem || "O perfil do pet não foi encontrado.");
    }
    preencherPerfil(resultado.pet, resultado.status);
  } catch (erro) {
    console.error("Erro ao consultar tag:", erro);
    mostrarErro("Erro de conexão", erro?.message || "Não foi possível consultar esta tag agora.");
  }
}

async function consultarTag() {
  const url = `/api/tag?tag=${encodeURIComponent(codigoTag)}`;
  if (window.BIRXAPI?.get) return window.BIRXAPI.get(url, { aceitarErroDeNegocio: true, redirecionarLogin: false, retornarRespostaCompleta: true });
  const resposta = await fetch(url, { method: "GET", credentials: "same-origin", headers: { Accept: "application/json" } });
  return { ok: resposta.ok, statusHttp: resposta.status, dados: await resposta.json().catch(() => ({})) };
}

function mostrarTagNaoAtivada() {
  mostrarErro("Tag ainda não ativada", "Esta tag ainda precisa ser cadastrada para exibir o perfil do pet.");
  if (!botaoAtivar) return;
  botaoAtivar.href = `/ativar.html?tag=${encodeURIComponent(codigoTag)}`;
  botaoAtivar.classList.remove("escondido");
}

function preencherPerfil(pet, statusApi) {
  estadoCarregando?.classList.add("escondido");
  estadoErro?.classList.add("escondido");
  perfilPet?.classList.remove("escondido");
  const nome = textoSeguro(pet.nome, "Pet");
  definirTexto("nomePet", nome);
  definirTexto("codigoTagPerfil", codigoTag);
  definirTexto("localPet", montarLocalizacaoSegura(pet));
  definirTexto("especiePet", textoSeguro(pet.especie));
  definirTexto("racaPet", textoSeguro(pet.raca));
  definirTexto("sexoPet", textoSeguro(pet.sexo));
  definirTexto("idadePet", textoSeguro(pet.idade));
  definirTexto("comportamentoPet", textoSeguro(pet.comportamento, "Nenhuma orientação especial foi cadastrada pelo tutor."));
  definirTexto("nomeTutor", textoSeguro(pet.nome_tutor));
  const estaPerdido = statusApi === "perdido" || Number(pet.perdido) === 1;
  const veioDePerdidos = parametros.get("origem") === "perdidos" || document.referrer.includes("/perdidos");
  document.getElementById("voltarPerdidos")?.classList.toggle("escondido", !(estaPerdido && veioDePerdidos));
  if (veioDePerdidos) document.getElementById("voltarPerdidos")?.classList.add("escondido");
  configurarTemaSexo(pet.sexo);
  preencherStatus(estaPerdido, pet.sexo);
  configurarContato(pet, estaPerdido);
  configurarFoto(pet);
  configurarModoPerdido(estaPerdido);
  configurarCompartilhamento(nome);
  atualizarMetadados(nome, estaPerdido);
  window.dispatchEvent(new CustomEvent("orbitek:pet-carregado", { detail: { pet, perdido: estaPerdido } }));
}

function textoSeguro(valor, fallback = "Não informado") { const texto = String(valor ?? "").trim(); return texto || fallback; }
function definirTexto(id, valor) { const elemento = document.getElementById(id); if (elemento) elemento.textContent = valor; }
function montarLocalizacaoSegura(pet) { const bairro=String(pet?.bairro||"").trim(), cidade=String(pet?.cidade||"").trim(), estado=String(pet?.estado||"").trim().toUpperCase(); const cidadeEstado=[cidade,estado].filter(Boolean).join(" - "); return bairro&&cidadeEstado?`${bairro} • ${cidadeEstado}`:cidadeEstado||bairro||"Localização não informada"; }

function configurarTemaSexo(sexo) {
  const valor = String(sexo || "").trim().toLowerCase();
  perfilPet?.classList.remove("sexo-macho", "sexo-femea");
  if (valor.includes("fêmea") || valor.includes("femea") || valor.includes("femin")) {
    perfilPet?.classList.add("sexo-femea");
  } else {
    perfilPet?.classList.add("sexo-macho");
  }
}

function sexoFeminino(sexo) {
  const valor = String(sexo || "").trim().toLocaleLowerCase("pt-BR");
  return valor.includes("fêmea") || valor.includes("femea") || valor.includes("femin");
}

function preencherStatus(estaPerdido, sexo) {
  const statusPet = document.getElementById("statusPet");
  if (!statusPet) return;
  const feminina = sexoFeminino(sexo);
  statusPet.textContent = estaPerdido ? `Pet ${feminina ? "desaparecida" : "desaparecido"}` : `Estou ${feminina ? "segura" : "seguro"}`;
  const alerta = document.querySelector("#alertaPetPerdido strong");
  if (alerta) alerta.textContent = `Este pet está ${feminina ? "desaparecida" : "desaparecido"}`;
  const ajuda = document.querySelector("#alertaPetPerdido p");
  if (ajuda) ajuda.textContent = `${feminina ? "Ajude-a" : "Ajude-o"} a voltar para casa. Entre em contato com o tutor imediatamente.`;
  statusPet.classList.toggle("perdido", estaPerdido);
  statusPet.classList.toggle("seguro", !estaPerdido);
}

function configurarModoPerdido(estaPerdido) {
  perfilPet?.classList.toggle("modo-perdido", estaPerdido);
  document.getElementById("alertaPetPerdido")?.classList.toggle("escondido", !estaPerdido);
}

function configurarContato(pet, estaPerdido) {
  const whatsapp = document.getElementById("botaoWhatsapp");
  const ligar = document.getElementById("botaoLigar");
  const copiar = document.getElementById("botaoCopiarContato");
  telefoneTutor = somenteNumeros(pet.whatsapp);
  if (!telefoneTutor) return;
  const completo = (telefoneTutor.length===10||telefoneTutor.length===11)?`55${telefoneTutor}`:telefoneTutor;
  const nomePet = pet.nome || "o pet";
  const mensagem = estaPerdido ? `Olá! Encontrei ${nomePet}, que consta como ${sexoFeminino(pet.sexo) ? "desaparecida" : "desaparecido"} na Tag BIRX ${codigoTag}.` : `Olá! Encontrei ${nomePet} pela Tag BIRX ${codigoTag}.`;
  if (whatsapp) { whatsapp.href=`https://wa.me/${completo}?text=${encodeURIComponent(mensagem)}`; whatsapp.querySelector("span:last-child").textContent=estaPerdido?"Avisar que encontrei":"Falar no WhatsApp"; whatsapp.classList.remove("escondido"); }
  if (ligar) { ligar.href=`tel:+${completo}`; ligar.classList.remove("escondido"); }
  if (copiar) { copiar.classList.remove("escondido"); copiar.addEventListener("click",()=>copiarTexto(formatarTelefone(telefoneTutor),"Contato copiado")); }
}

function configurarFoto(pet) {
  const fotoPet=document.getElementById("fotoPet");
  if(!fotoPet||!pet.foto_url)return;
  const imagem=document.createElement("img"); imagem.src=pet.foto_url; imagem.alt=`Foto de ${pet.nome||"pet"}`; imagem.loading="eager"; imagem.decoding="async";
  imagem.addEventListener("load",()=>{fotoPet.textContent="";fotoPet.appendChild(imagem);});
}

function configurarCompartilhamento(nomePet) {
  const botaoCompartilhar=document.getElementById("botaoCompartilhar");
  const botaoCopiarLink=document.getElementById("botaoCopiarLink");
  const url=window.location.href;
  botaoCompartilhar?.addEventListener("click",async()=>{ if(navigator.share){ try{await navigator.share({title:`${nomePet} - BIRX Pets`,text:`Veja o perfil de ${nomePet} na BIRX Pets.`,url});return;}catch(e){if(e?.name==="AbortError")return;} } await copiarTexto(url,"Link do perfil copiado"); });
  botaoCopiarLink?.addEventListener("click",()=>copiarTexto(url,"Link do perfil copiado"));
}

async function copiarTexto(texto,mensagem){ try{await navigator.clipboard.writeText(texto);}catch{const campo=document.createElement("textarea");campo.value=texto;campo.style.position="fixed";campo.style.opacity="0";document.body.appendChild(campo);campo.select();document.execCommand("copy");campo.remove();}mostrarToast(mensagem); }
function mostrarToast(mensagem){const toast=document.getElementById("toastPerfil");if(!toast)return;clearTimeout(temporizadorToast);toast.textContent=mensagem;toast.classList.add("visivel");temporizadorToast=setTimeout(()=>toast.classList.remove("visivel"),2400);}
function atualizarMetadados(nome,estaPerdido){const titulo=estaPerdido?`${nome} está desaparecido - BIRX Pets`:`${nome} - BIRX Pets`;const descricao=estaPerdido?`Ajude ${nome} a voltar para casa. Consulte o perfil e fale com o tutor.`:`Perfil de identificação de ${nome}, protegido pela BIRX Pets.`;document.title=titulo;document.getElementById("metaOgTitulo")?.setAttribute("content",titulo);document.getElementById("metaOgDescricao")?.setAttribute("content",descricao);document.getElementById("metaOgUrl")?.setAttribute("content",window.location.href);document.querySelector('meta[name="description"]')?.setAttribute("content",descricao);}
function formatarTelefone(valor){const n=somenteNumeros(valor);if(n.length===11)return`(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;if(n.length===10)return`(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;return n;}
function somenteNumeros(valor){return String(valor||"").replace(/\D/g,"");}
function mostrarErro(titulo,mensagem){estadoCarregando?.classList.add("escondido");perfilPet?.classList.add("escondido");estadoErro?.classList.remove("escondido");if(tituloErro)tituloErro.textContent=titulo;if(mensagemErro)mensagemErro.textContent=mensagem;}
