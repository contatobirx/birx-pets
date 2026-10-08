#include <SPI.h>
#include <PN5180.h>
#include <PN5180ISO14443.h>

#define NSS 16
#define BUSY 5
#define RST 17

class BirxNFC : public PN5180ISO14443 {
public:
  BirxNFC(uint8_t s,uint8_t b,uint8_t r):PN5180ISO14443(s,b,r){}
  bool page(uint8_t p,const uint8_t*d){uint8_t c[6]={0xA2,p,d[0],d[1],d[2],d[3]};if(!sendData(c,6,0))return false;delay(12);return true;}
  bool auth(const uint8_t*pwd,uint8_t*pack){uint8_t c[5]={0x1B,pwd[0],pwd[1],pwd[2],pwd[3]};if(!sendData(c,5,0))return false;delay(10);return readData(2,pack);}
  bool version(uint8_t*out){uint8_t c=0x60;if(!sendData(&c,1,0))return false;delay(10);return readData(8,out);}
};

struct TagLayout{
  const char*name;
  uint8_t storage;
  uint8_t cfgPage;
  uint8_t pwdPage;
  uint8_t packPage;
  uint8_t userLastPage;
};

const TagLayout TAGS[]={
  {"NTAG213",0x0F,0x29,0x2B,0x2C,0x27},
  {"NTAG215",0x11,0x83,0x85,0x86,0x81},
  {"NTAG216",0x13,0xE3,0xE5,0xE6,0xE1}
};

BirxNFC nfc(NSS,BUSY,RST);
String ndefError="";

void progress(const String&m){Serial.print("{\"type\":\"progress\",\"message\":\"");Serial.print(m);Serial.println("\"}");}
void fail(const String&m){Serial.print("{\"ok\":false,\"error\":\"");Serial.print(m);Serial.println("\"}");}

bool selectTag(uint8_t*info,uint8_t&len){nfc.reset();nfc.setupRF();delay(10);len=nfc.activateTypeA(info,1);return len>0;}

bool fromHex(const String&s,uint8_t*out,int n){if((int)s.length()!=n*2)return false;for(int i=0;i<n;i++){char a=s[i*2],b=s[i*2+1];auto v=[](char c)->int{if(c>='0'&&c<='9')return c-'0';if(c>='A'&&c<='F')return c-'A'+10;if(c>='a'&&c<='f')return c-'a'+10;return -1;};int x=v(a),y=v(b);if(x<0||y<0)return false;out[i]=(x<<4)|y;}return true;}
String field(const String&j,const char*k){String q=String("\"")+k+"\":\"";int a=j.indexOf(q);if(a<0)return"";a+=q.length();int b=j.indexOf('"',a);return b<0?"":j.substring(a,b);}

bool authenticateCurrent(const uint8_t*pwd,const uint8_t*pack){uint8_t got[2]={0};if(!nfc.auth(pwd,got))return false;return got[0]==pack[0]&&got[1]==pack[1];}

const TagLayout*detectLayout(){
  uint8_t version[8]={0};
  if(!nfc.version(version))return nullptr;
  if(version[0]!=0x00||version[1]!=0x04||version[2]!=0x04||version[3]!=0x02||version[7]!=0x03)return nullptr;
  for(const auto &tag:TAGS)if(tag.storage==version[6])return &tag;
  return nullptr;
}

bool writeNdef(const String&url,const uint8_t*pwd,const uint8_t*pack,bool protectedWrite,const TagLayout*layout){
  String rest=url.startsWith("https://")?url.substring(8):url;
  int payload=1+rest.length(),ndefLen=4+payload,pos=0;
  if(ndefLen>254){ndefError="URL NDEF muito longa";return false;}

  uint8_t data[440];
  data[pos++]=0x03;data[pos++]=ndefLen;data[pos++]=0xD1;data[pos++]=0x01;data[pos++]=payload;data[pos++]=0x55;data[pos++]=0x04;
  for(unsigned i=0;i<rest.length();i++)data[pos++]=rest[i];
  data[pos++]=0xFE;while(pos%4)data[pos++]=0;

  const int pagesNeeded=pos/4;
  const int lastPage=4+pagesNeeded-1;
  if(lastPage>layout->userLastPage){ndefError=String("URL nao cabe em ")+layout->name;return false;}

  uint8_t page=4,info[10],len;
  for(int i=0;i<pos;i+=4,page++){
    if(!selectTag(info,len)){ndefError="Tag perdida antes da pagina 0x"+String(page,HEX);return false;}
    const TagLayout*again=detectLayout();
    if(!again||again->storage!=layout->storage){ndefError="A tag foi trocada durante a gravacao";return false;}
    if(protectedWrite && !authenticateCurrent(pwd,pack)){ndefError="Tag protegida com senha diferente na pagina 0x"+String(page,HEX);return false;}
    if(!nfc.page(page,&data[i])){ndefError="Falha WRITE na pagina 0x"+String(page,HEX);return false;}

    if(!selectTag(info,len)){ndefError="Tag perdida ao verificar pagina 0x"+String(page,HEX);return false;}
    again=detectLayout();
    if(!again||again->storage!=layout->storage){ndefError="A tag foi trocada durante a verificacao";return false;}
    uint8_t check[16];
    if(!nfc.mifareBlockRead(page,check)){ndefError="Falha READ de verificacao na pagina 0x"+String(page,HEX);return false;}
    for(int b=0;b<4;b++)if(check[b]!=data[i+b]){ndefError="Verificacao diferente na pagina 0x"+String(page,HEX);return false;}
  }
  return true;
}

void program(const String&url,const String&pwdHex,const String&packHex){
  uint8_t pwd[4],pack[2],info[10],len;
  if(!fromHex(pwdHex,pwd,4)||!fromHex(packHex,pack,2)){fail("Credenciais invalidas");return;}

  progress("Aproxime e mantenha a tag no leitor...");
  if(!selectTag(info,len)){fail("Tag nao encontrada");return;}

  const TagLayout*layout=detectLayout();
  if(!layout){fail("Chip NFC nao suportado. Use NTAG213, NTAG215 ou NTAG216 original/compativel.");return;}
  progress(String("Chip identificado: ")+layout->name);

  String uid="";
  for(int i=0;i<len;i++){if(info[3+i]<16)uid+='0';uid+=String(info[3+i],HEX);if(i<len-1)uid+=':';}
  uid.toUpperCase();

  uint8_t cfg[16];
  if(!nfc.mifareBlockRead(layout->cfgPage,cfg)){fail("Falha ao ler configuracao inicial");return;}
  bool protectedWrite=cfg[3]!=0xFF;

  if(protectedWrite){
    progress("Tag ja protegida. Testando credencial pendente...");
    if(!selectTag(info,len)){fail("Tag perdida antes da autenticacao");return;}
    const TagLayout*again=detectLayout();
    if(!again||again->storage!=layout->storage){fail("A tag foi trocada antes da autenticacao");return;}
    if(!authenticateCurrent(pwd,pack)){fail("Esta tag ja esta protegida com outra senha. Use uma tag nova ou a rotina de regravacao.");return;}
  }

  progress("Gravando link NDEF...");
  if(!writeNdef(url,pwd,pack,protectedWrite,layout)){fail(ndefError);return;}

  progress("Configurando senha exclusiva...");
  if(!protectedWrite){
    if(!selectTag(info,len)){fail("Tag perdida antes de gravar PWD");return;}
    const TagLayout*again=detectLayout();
    if(!again||again->storage!=layout->storage){fail("A tag foi trocada antes de gravar PWD");return;}
    if(!nfc.page(layout->pwdPage,pwd)){fail("Falha ao gravar PWD");return;}

    uint8_t pp[4]={pack[0],pack[1],0,0};
    if(!selectTag(info,len)){fail("Tag perdida antes de gravar PACK");return;}
    again=detectLayout();
    if(!again||again->storage!=layout->storage){fail("A tag foi trocada antes de gravar PACK");return;}
    if(!nfc.page(layout->packPage,pp)){fail("Falha ao gravar PACK");return;}
  }

  if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){fail("PWD_AUTH nao confirmado");return;}

  progress("Ativando protecao contra escrita...");
  if(!selectTag(info,len)){fail("Tag perdida antes da protecao");return;}
  const TagLayout*again=detectLayout();
  if(!again||again->storage!=layout->storage){fail("A tag foi trocada antes da protecao");return;}
  if(!nfc.mifareBlockRead(layout->cfgPage,cfg)){fail("Falha ao ler configuracao");return;}

  if(cfg[3]!=0x04){
    uint8_t pCfg[4]={cfg[0],cfg[1],cfg[2],0x04};
    if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)||!nfc.page(layout->cfgPage,pCfg)){fail("Falha ao ativar AUTH0");return;}
  }

  if(!selectTag(info,len)){fail("Tag perdida ao confirmar protecao");return;}
  again=detectLayout();
  if(!again||again->storage!=layout->storage){fail("A tag foi trocada ao confirmar protecao");return;}
  if(!nfc.mifareBlockRead(layout->cfgPage,cfg)||cfg[3]!=0x04){fail("Protecao nao confirmada");return;}
  if(!authenticateCurrent(pwd,pack)){fail("Senha final nao autenticou");return;}

  Serial.print("{\"ok\":true,\"uid\":\"");Serial.print(uid);
  Serial.print("\",\"chip\":\"");Serial.print(layout->name);
  Serial.println("\",\"protected\":true}");
}

void setup(){
  Serial.begin(115200);
  Serial.setTimeout(3000);
  SPI.begin(18,19,23);
  nfc.begin();nfc.reset();nfc.setupRF();
  Serial.println("{\"type\":\"ready\",\"device\":\"BIRX-NFC\",\"fw\":\"1.5\",\"chips\":[\"NTAG213\",\"NTAG215\",\"NTAG216\"]}");
}

void loop(){
  if(!Serial.available())return;
  String j=Serial.readStringUntil('\n');j.trim();
  if(field(j,"cmd")!="program"){fail("Comando invalido");return;}
  String url=field(j,"url"),pwd=field(j,"pwd"),pack=field(j,"pack");
  if(!url.startsWith("https://pets.birx.com.br/q/")){fail("URL fora do dominio BIRX Pets");return;}
  program(url,pwd,pack);
}
