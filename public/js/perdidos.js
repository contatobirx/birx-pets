const formulario = document.getElementById("filtrosPerdidos");
const lista = document.getElementById("listaPerdidos");
const estado = document.getElementById("estadoPerdidos");
const quantidade = document.getElementById("quantidadePerdidos");
const buscarPerto = document.getElementById("buscarPerto");
const limparFiltros = document.getElementById("limparFiltros");
let origemUsuario = null;
let petsAtuais = [];

function escapar(valor) { const div = document.createElement("div"); div.textContent = valor ?? ""; return div.innerHTML; }
function rad(graus) { return graus * Math.PI / 180; }
function distanciaKm(a, b) { const r=6371,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon); const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2; return 2*r*Math.asin(Math.sqrt(x)); }

function renderizar(pets) {
  let exibidos = pets.map((pet) => ({ ...pet, distancia: origemUsuario && pet.latitudeAproximada != null ? distanciaKm(origemUsuario, { lat: pet.latitudeAproximada, lon: pet.longitudeAproximada }) : null }));
  if (origemUsuario) exibidos = exibidos.filter((pet) => pet.distancia == null || pet.distancia <= 20).sort((a,b) => (a.distancia ?? 9999)-(b.distancia ?? 9999));
  quantidade.textContent = `${exibidos.length} ${exibidos.length === 1 ? "animal" : "animais"}`;
  estado.hidden = exibidos.length > 0;
  estado.textContent = origemUsuario ? "Nenhum animal publicado foi encontrado em um raio aproximado de 20 km." : "Nenhum animal perdido foi publicado com estes filtros.";
  lista.innerHTML = exibidos.map((pet) => `<article class="lost-card"><div class="lost-card-img">${pet.fotoUrl ? `<img src="${escapar(pet.fotoUrl)}" alt="Foto de ${escapar(pet.nome)}" loading="lazy">` : ""}<span class="lost-alert">PERDIDO</span></div><div class="lost-card-body"><h3>${escapar(pet.nome || "Pet")}</h3><p class="lost-meta">${escapar([pet.especie,pet.raca,pet.sexo].filter(Boolean).join(" · "))}</p><div class="lost-place">📍 ${escapar([pet.bairro,pet.cidade,pet.estado].filter(Boolean).join(" · ") || "Localização não informada")}</div>${pet.distancia != null ? `<span class="lost-distance">Aproximadamente ${pet.distancia.toFixed(1)} km de você</span>` : ""}<a href="/t.html?tag=${encodeURIComponent(pet.tag)}">Ver perfil e ajudar →</a></div></article>`).join("");
}

async function carregar() {
  quantidade.textContent = "Carregando..."; estado.hidden = true; lista.innerHTML = "";
  const params = new URLSearchParams();
  const cidade = document.getElementById("filtroCidade").value.trim();
  const especie = document.getElementById("filtroEspecie").value;
  if (cidade) params.set("cidade", cidade);
  if (especie) params.set("especie", especie);
  try { const resposta = await fetch(`/api/perdidos?${params}`, { headers: { Accept: "application/json" } }); const dados = await resposta.json(); if (!resposta.ok) throw new Error(dados.mensagem); petsAtuais = dados.pets || []; renderizar(petsAtuais); }
  catch (erro) { quantidade.textContent = ""; estado.hidden = false; estado.textContent = erro.message || "Não foi possível carregar os animais."; }
}

formulario.addEventListener("submit", (evento) => { evento.preventDefault(); origemUsuario = null; carregar(); });
limparFiltros.addEventListener("click", () => { formulario.reset(); origemUsuario = null; carregar(); });
buscarPerto.addEventListener("click", () => { if (!navigator.geolocation) return; buscarPerto.disabled = true; navigator.geolocation.getCurrentPosition((pos) => { origemUsuario={lat:pos.coords.latitude,lon:pos.coords.longitude}; buscarPerto.disabled=false; renderizar(petsAtuais); }, () => { buscarPerto.disabled=false; }, { timeout:12000 }); });
carregar();
