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
};

BirxNFC nfc(NSS,BUSY,RST);
String ndefError="";

void progress(const char*m){Serial.print("{\"type\":\"progress\",\"message\":\"");Serial.print(m);Serial.println("\"}");}
void fail(const String&m){Serial.print("{\"ok\":false,\"error\":\"");Serial.print(m);Serial.println("\"}");}

bool selectTag(uint8_t*info,uint8_t&len){nfc.reset();nfc.setupRF();delay(10);len=nfc.activateTypeA(info,1);return len>0;}

String uidFromInfo(uint8_t*info,uint8_t len){String uid="";for(int i=0;i<len;i++){if(info[3+i]<16)uid+='0';uid+=String(info[3+i],HEX);if(i<len-1)uid+=':';}uid.toUpperCase();return uid;}

bool fromHex(const String&s,uint8_t*out,int n){if((int)s.length()!=n*2)return false;for(int i=0;i<n;i++){char a=s[i*2],b=s[i*2+1];auto v=[](char c)->int{if(c>='0'&&c<='9')return c-'0';if(c>='A'&&c<='F')return c-'A'+10;if(c>='a'&&c<='f')return c-'a'+10;return -1;};int x=v(a),y=v(b);if(x<0||y<0)return false;out[i]=(x<<4)|y;}return true;}
String field(const String&j,const char*k){String q=String("\"")+k+"\":\"";int a=j.indexOf(q);if(a<0)return"";a+=q.length();int b=j.indexOf('"',a);return b<0?"":j.substring(a,b);}

bool authenticateCurrent(const uint8_t*pwd,const uint8_t*pack){uint8_t got[2]={0};if(!nfc.auth(pwd,got))return false;return got[0]==pack[0]&&got[1]==pack[1];}

bool writeNdef(const String&url,const uint8_t*pwd,const uint8_t*pack,bool protectedWrite){
  String rest=url.startsWith("https://")?url.substring(8):url;
  int payload=1+rest.length(),ndefLen=4+payload,pos=0;
  if(ndefLen>254){ndefError="URL NDEF muito longa";return false;}
  uint8_t data[440];
  data[pos++]=0x03;data[pos++]=ndefLen;data[pos++]=0xD1;data[pos++]=0x01;data[pos++]=payload;data[pos++]=0x55;data[pos++]=0x04;
  for(unsigned i=0;i<rest.length();i++)data[pos++]=rest[i];
  data[pos++]=0xFE;while(pos%4)data[pos++]=0;
  uint8_t page=4,info[10],len;
  for(int i=0;i<pos;i+=4,page++){
    if(!selectTag(info,len)){ndefError="Tag perdida antes da pagina 0x"+String(page,HEX);return false;}
    if(protectedWrite&&!authenticateCurrent(pwd,pack)){ndefError="Tag protegida com senha diferente na pagina 0x"+String(page,HEX);return false;}
    if(!nfc.page(page,&data[i])){ndefError="Falha WRITE na pagina 0x"+String(page,HEX);return false;}
    if(!selectTag(info,len)){ndefError="Tag perdida ao verificar pagina 0x"+String(page,HEX);return false;}
    uint8_t check[16];
    if(!nfc.mifareBlockRead(page,check)){ndefError="Falha READ de verificacao na pagina 0x"+String(page,HEX);return false;}
    for(int b=0;b<4;b++)if(check[b]!=data[i+b]){ndefError="Verificacao diferente na pagina 0x"+String(page,HEX);return false;}
  }
  return true;
}

void programTag(const String&url,const String&pwdHex,const String&packHex){
  uint8_t pwd[4],pack[2],info[10],len;
  if(!fromHex(pwdHex,pwd,4)||!fromHex(packHex,pack,2)){fail("Credenciais invalidas");return;}
  progress("Aproxime e mantenha a tag no leitor...");
  if(!selectTag(info,len)){fail("Tag nao encontrada");return;}
  String uid=uidFromInfo(info,len);
  uint8_t cfg[16];
  if(!nfc.mifareBlockRead(0x83,cfg)){fail("Falha ao ler configuracao inicial");return;}
  bool protectedWrite=cfg[3]!=0xFF;
  if(protectedWrite){progress("Tag ja protegida. Autenticando...");if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){fail("Esta tag ja esta protegida com outra senha.");return;}}
  progress("Gravando link NDEF...");
  if(!writeNdef(url,pwd,pack,protectedWrite)){fail(ndefError);return;}
  progress("Configurando senha exclusiva...");
  if(!protectedWrite){
    if(!selectTag(info,len)||!nfc.page(0x85,pwd)){fail("Falha ao gravar PWD");return;}
    uint8_t pp[4]={pack[0],pack[1],0,0};
    if(!selectTag(info,len)||!nfc.page(0x86,pp)){fail("Falha ao gravar PACK");return;}
  }
  if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){fail("PWD_AUTH nao confirmado");return;}
  progress("Ativando protecao contra escrita...");
  if(!selectTag(info,len)){fail("Tag perdida antes da protecao");return;}
  if(!nfc.mifareBlockRead(0x83,cfg)){fail("Falha ao ler configuracao");return;}
  if(cfg[3]!=0x04){uint8_t p83[4]={cfg[0],cfg[1],cfg[2],0x04};if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)||!nfc.page(0x83,p83)){fail("Falha ao ativar AUTH0");return;}}
  if(!selectTag(info,len)||!nfc.mifareBlockRead(0x83,cfg)||cfg[3]!=0x04){fail("Protecao nao confirmada");return;}
  Serial.print("{\"ok\":true,\"uid\":\"");Serial.print(uid);Serial.println("\",\"protected\":true}");
}

void zeroTag(const String&pwdHex,const String&packHex,const String&uidExpected){
  uint8_t pwd[4],pack[2],info[10],len;
  if(!fromHex(pwdHex,pwd,4)||!fromHex(packHex,pack,2)){fail("Credenciais invalidas");return;}
  progress("Identificando a tag antes de zerar...");
  if(!selectTag(info,len)){fail("Tag nao encontrada");return;}
  String uid=uidFromInfo(info,len);
  String expected=uidExpected;expected.toUpperCase();
  if(expected.length()&&uid!=expected){fail("UID incorreto. Nenhuma alteracao foi feita.");return;}

  uint8_t cfg[16];
  if(!nfc.mifareBlockRead(0x83,cfg)){fail("Falha ao ler configuracao da tag");return;}
  bool protectedWrite=cfg[3]!=0xFF;
  if(protectedWrite){progress("Autenticando para liberar a tag...");if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){fail("Senha da tag nao confere. Nenhuma alteracao foi feita.");return;}}

  progress("Apagando conteudo NDEF...");
  uint8_t emptyNdef[4]={0x03,0x00,0xFE,0x00};
  if(!selectTag(info,len)){fail("Tag perdida antes de apagar NDEF");return;}
  if(protectedWrite&&!authenticateCurrent(pwd,pack)){fail("Falha de autenticacao antes de apagar NDEF");return;}
  if(!nfc.page(0x04,emptyNdef)){fail("Falha ao apagar NDEF");return;}

  progress("Removendo protecao de escrita...");
  if(!selectTag(info,len)){fail("Tag perdida antes de remover protecao");return;}
  if(!nfc.mifareBlockRead(0x83,cfg)){fail("Falha ao reler configuracao");return;}
  if(cfg[3]!=0xFF){
    if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){fail("Falha de autenticacao para remover AUTH0");return;}
    uint8_t p83[4]={cfg[0],cfg[1],cfg[2],0xFF};
    if(!nfc.page(0x83,p83)){fail("Falha ao desativar AUTH0");return;}
  }

  progress("Restaurando PWD e PACK padrao...");
  uint8_t defaultPwd[4]={0xFF,0xFF,0xFF,0xFF};
  uint8_t defaultPack[4]={0x00,0x00,0x00,0x00};
  if(!selectTag(info,len)||!nfc.page(0x85,defaultPwd)){fail("Falha ao restaurar PWD padrao");return;}
  if(!selectTag(info,len)||!nfc.page(0x86,defaultPack)){fail("Falha ao restaurar PACK padrao");return;}

  progress("Verificando se a tag ficou livre...");
  if(!selectTag(info,len)){fail("Tag perdida na verificacao final");return;}
  uint8_t verifyCfg[16];
  if(!nfc.mifareBlockRead(0x83,verifyCfg)||verifyCfg[3]!=0xFF){fail("AUTH0 nao foi removido corretamente");return;}
  uint8_t check[16];
  if(!selectTag(info,len)||!nfc.mifareBlockRead(0x04,check)||check[0]!=0x03||check[1]!=0x00||check[2]!=0xFE){fail("NDEF vazio nao foi confirmado");return;}

  Serial.print("{\"ok\":true,\"uid\":\"");Serial.print(uid);Serial.println("\",\"zeroed\":true,\"protected\":false}");
}

void setup(){Serial.begin(115200);Serial.setTimeout(3000);SPI.begin(18,19,23);nfc.begin();nfc.reset();nfc.setupRF();Serial.println("{\"type\":\"ready\",\"device\":\"BIRX-NFC\",\"fw\":\"1.5\"}");}

void loop(){
  if(!Serial.available())return;
  String j=Serial.readStringUntil('\n');j.trim();
  String cmd=field(j,"cmd");
  if(cmd=="program"){
    String url=field(j,"url"),pwd=field(j,"pwd"),pack=field(j,"pack");
    if(!url.startsWith("https://")){fail("URL invalida");return;}
    programTag(url,pwd,pack);return;
  }
  if(cmd=="zero"){
    String pwd=field(j,"pwd"),pack=field(j,"pack"),uidExpected=field(j,"uidExpected");
    zeroTag(pwd,pack,uidExpected);return;
  }
  fail("Comando invalido");
}
