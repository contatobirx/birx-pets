const digits=value=>String(value??"").replace(/\D/g,"");
const integer=(value,fallback)=>{const parsed=Number.parseInt(value,10);return Number.isInteger(parsed)&&parsed>=0?parsed:fallback};

const REGIONS={
  sul:{name:"Sul",states:["PR","SC","RS"],min:3,max:7,variable:"LOJA_FRETE_SUL_CENTAVOS"},
  sudeste:{name:"Sudeste",states:["SP","RJ","MG","ES"],min:4,max:9,variable:"LOJA_FRETE_SUDESTE_CENTAVOS"},
  centro_oeste:{name:"Centro-Oeste",states:["DF","GO","MT","MS"],min:5,max:11,variable:"LOJA_FRETE_CENTRO_OESTE_CENTAVOS"},
  nordeste:{name:"Nordeste",states:["AL","BA","CE","MA","PB","PE","PI","RN","SE"],min:7,max:14,variable:"LOJA_FRETE_NORDESTE_CENTAVOS"},
  norte:{name:"Norte",states:["AC","AP","AM","PA","RO","RR","TO"],min:8,max:16,variable:"LOJA_FRETE_NORTE_CENTAVOS"}
};

export async function lookupCep(rawCep){
  const cep=digits(rawCep).slice(0,8);
  if(cep.length!==8)throw new Error("Informe um CEP válido.");
  const response=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{headers:{Accept:"application/json","User-Agent":"BIRX-Pets/4.11"}});
  if(!response.ok)throw new Error("Não foi possível consultar o CEP.");
  const data=await response.json();
  if(data.erro||!data.uf||!data.localidade)throw new Error("CEP não encontrado.");
  return{cep,logradouro:String(data.logradouro||"").trim(),bairro:String(data.bairro||"").trim(),cidade:String(data.localidade||"").trim(),estado:String(data.uf||"").trim().toUpperCase()};
}

export function deliveryOptions(env,address,subtotalCentavos){
  const base=integer(env.LOJA_FRETE_CENTAVOS,1290),freeFrom=integer(env.LOJA_FRETE_GRATIS_CENTAVOS,14900);
  const region=Object.values(REGIONS).find(item=>item.states.includes(address.estado))||REGIONS.sudeste;
  const configured=integer(env[region.variable],base),shipping=Number(subtotalCentavos)>=freeFrom?0:configured;
  const options=[{modalidade:"envio",nome:"Entrega BIRX",descricao:`Envio para ${address.cidade} - ${address.estado}`,valorCentavos:shipping,prazoMinDias:region.min,prazoMaxDias:region.max,regiao:region.name}];
  const pickupActive=String(env.LOJA_RETIRADA_ATIVA||"").toLowerCase()==="true"&&String(env.LOJA_RETIRADA_ENDERECO||"").trim();
  if(pickupActive)options.push({modalidade:"retirada",nome:"Retirada local",descricao:String(env.LOJA_RETIRADA_ENDERECO).trim().slice(0,220),valorCentavos:0,prazoMinDias:1,prazoMaxDias:2,regiao:"Retirada"});
  return options;
}

export async function quoteDelivery(env,rawCep,subtotalCentavos){
  const address=await lookupCep(rawCep),options=deliveryOptions(env,address,subtotalCentavos);
  return{endereco:address,opcoes:options,freteGratisAPartirCentavos:integer(env.LOJA_FRETE_GRATIS_CENTAVOS,14900)};
}
