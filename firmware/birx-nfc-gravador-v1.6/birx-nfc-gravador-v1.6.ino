#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PN5180.h>
#include <PN5180ISO14443.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1
#define OLED_ADDR 0x3C
#define OLED_SDA 21
#define OLED_SCL 22

#define BTN_UP 25
#define BTN_DOWN 26
#define BTN_OK 27

#define PN_NSS 16
#define PN_BUSY 5
#define PN_RST 17
#define SPI_SCK 18
#define SPI_MISO 19
#define SPI_MOSI 23

Adafruit_SSD1306 display(SCREEN_WIDTH,SCREEN_HEIGHT,&Wire,OLED_RESET);
bool oledOk=false;
unsigned long lastButtonTime=0;
const unsigned long debounceTime=180;

class BirxNFC:public PN5180ISO14443{
public:
  BirxNFC(uint8_t s,uint8_t b,uint8_t r):PN5180ISO14443(s,b,r){}
  bool page(uint8_t p,const uint8_t*d){uint8_t c[6]={0xA2,p,d[0],d[1],d[2],d[3]};if(!sendData(c,6,0))return false;delay(12);return true;}
  bool auth(const uint8_t*pwd,uint8_t*pack){uint8_t c[5]={0x1B,pwd[0],pwd[1],pwd[2],pwd[3]};if(!sendData(c,5,0))return false;delay(10);return readData(2,pack);}
  bool version(uint8_t*out){uint8_t c=0x60;if(!sendData(&c,1,0))return false;delay(10);return readData(8,out);}
};

struct TagLayout{const char*name;uint8_t storage,cfgPage,pwdPage,packPage,userLastPage;};
const TagLayout TAGS[]={
  {"NTAG213",0x0F,0x29,0x2B,0x2C,0x27},
  {"NTAG215",0x11,0x83,0x85,0x86,0x81},
  {"NTAG216",0x13,0xE3,0xE5,0xE6,0xE1}
};

BirxNFC nfc(PN_NSS,PN_BUSY,PN_RST);
String ndefError="",currentCode="",lastChip="";
unsigned long sessionCount=0;

String fitLine(String s){s.replace("\r"," ");s.replace("\n"," ");if(s.length()>21)s=s.substring(0,21);return s;}
void tela(const String&a,const String&b="",const String&c=""){if(!oledOk)return;display.clearDisplay();display.setTextColor(SSD1306_WHITE);display.setTextSize(1);display.setCursor(0,0);display.println(fitLine(a));display.setCursor(0,11);display.println(fitLine(b));display.setCursor(0,22);display.println(fitLine(c));display.display();}
void telaPronto(){tela("BIRX NFC v1.6","USB / PN5180 OK","Aguardando QR...");}
void telaSucesso(){tela("GRAVADA + PROTEGIDA",currentCode,lastChip+" #"+String(sessionCount));}
void telaStatus(){tela("STATUS BIRX NFC","OLED: "+String(oledOk?"OK":"ERRO"),"Gravadas: "+String(sessionCount));}
bool btn(int p){if(digitalRead(p)==LOW&&millis()-lastButtonTime>debounceTime){lastButtonTime=millis();return true;}return false;}

void progress(const String&m){
  Serial.print("{\"type\":\"progress\",\"message\":\"");Serial.print(m);Serial.println("\"}");
  if(m.startsWith("Aproxime"))tela("BIRX ID RECEBIDA",currentCode,"Aproxime a tag");
  else if(m.startsWith("Chip identificado:")){lastChip=m.substring(18);lastChip.trim();tela(currentCode,lastChip,"Gravando...");}
  else if(m.startsWith("Gravando link"))tela(currentCode,lastChip,"GRAVANDO NDEF...");
  else if(m.startsWith("Configurando senha"))tela(currentCode,lastChip,"PROTEGENDO PWD...");
  else if(m.startsWith("Ativando protecao"))tela(currentCode,lastChip,"ATIVANDO AUTH0...");
}
void fail(const String&m){Serial.print("{\"ok\":false,\"error\":\"");Serial.print(m);Serial.println("\"}");tela("ERRO NFC",m,"OK = voltar");}

bool selectTag(uint8_t*info,uint8_t&len){nfc.reset();nfc.setupRF();delay(10);len=nfc.activateTypeA(info,1);return len>0;}
bool waitForTag(uint8_t*info,uint8_t&len){
  unsigned long start=millis();
  while(millis()-start<30000){
    if(selectTag(info,len))return true;
    unsigned long sec=(30000-(millis()-start))/1000;
    tela(currentCode,"Aproxime a NFC","Tempo: "+String(sec)+"s");
    delay(180);
  }
  return false;
}
bool fromHex(const String&s,uint8_t*out,int n){if((int)s.length()!=n*2)return false;for(int i=0;i<n;i++){char a=s[i*2],b=s[i*2+1];auto v=[](char c)->int{if(c>='0'&&c<='9')return c-'0';if(c>='A'&&c<='F')return c-'A'+10;if(c>='a'&&c<='f')return c-'a'+10;return -1;};int x=v(a),y=v(b);if(x<0||y<0)return false;out[i]=(x<<4)|y;}return true;}
String field(const String&j,const char*k){String q=String("\"")+k+"\":\"";int a=j.indexOf(q);if(a<0)return"";a+=q.length();int b=j.indexOf('"',a);return b<0?"":j.substring(a,b);}
bool authenticateCurrent(const uint8_t*pwd,const uint8_t*pack){uint8_t got[2]={0};if(!nfc.auth(pwd,got))return false;return got[0]==pack[0]&&got[1]==pack[1];}
const TagLayout*detectLayout(){uint8_t v[8]={0};if(!nfc.version(v))return nullptr;if(v[0]!=0x00||v[1]!=0x04||v[2]!=0x04||v[3]!=0x02||v[7]!=0x03)return nullptr;for(const auto&t:TAGS)if(t.storage==v[6])return &t;return nullptr;}
bool sameLayout(const TagLayout*l){const TagLayout*a=detectLayout();return a&&a->storage==l->storage;}

bool writeNdef(const String&url,const uint8_t*pwd,const uint8_t*pack,bool protectedWrite,const TagLayout*l){
  String rest=url.startsWith("https://")?url.substring(8):url;
  int payload=1+rest.length(),ndefLen=4+payload,pos=0;
  if(ndefLen>254){ndefError="URL muito longa";return false;}
  uint8_t data[440];
  data[pos++]=0x03;data[pos++]=ndefLen;data[pos++]=0xD1;data[pos++]=0x01;data[pos++]=payload;data[pos++]=0x55;data[pos++]=0x04;
  for(unsigned i=0;i<rest.length();i++)data[pos++]=rest[i];
  data[pos++]=0xFE;while(pos%4)data[pos++]=0;
  if(4+(pos/4)-1>l->userLastPage){ndefError="URL nao cabe no chip";return false;}
  uint8_t page=4,info[10],len;
  for(int i=0;i<pos;i+=4,page++){
    if(!selectTag(info,len)){ndefError="Tag removida";return false;}
    if(!sameLayout(l)){ndefError="Tag trocada";return false;}
    if(protectedWrite&&!authenticateCurrent(pwd,pack)){ndefError="Senha diferente";return false;}
    if(!nfc.page(page,&data[i])){ndefError="Falha WRITE";return false;}
    if(!selectTag(info,len)||!sameLayout(l)){ndefError="Tag removida/trocada";return false;}
    uint8_t check[16];if(!nfc.mifareBlockRead(page,check)){ndefError="Falha READ";return false;}
    for(int b=0;b<4;b++)if(check[b]!=data[i+b]){ndefError="Falha verificar";return false;}
  }
  return true;
}

void programTag(const String&codigo,const String&url,const String&pwdHex,const String&packHex){
  currentCode=codigo.length()?codigo:"BIRX ID";lastChip="";
  uint8_t pwd[4],pack[2],info[10],len=0;
  if(!fromHex(pwdHex,pwd,4)||!fromHex(packHex,pack,2)){fail("Credenciais invalidas");return;}
  progress("Aproxime e mantenha a tag no leitor...");
  if(!waitForTag(info,len)){fail("Tempo esgotado NFC");return;}
  const TagLayout*l=detectLayout();if(!l){fail("Chip nao suportado");return;}
  lastChip=l->name;progress(String("Chip identificado: ")+l->name);

  String uid="";for(int i=0;i<len;i++){if(info[3+i]<16)uid+='0';uid+=String(info[3+i],HEX);if(i<len-1)uid+=':';}uid.toUpperCase();

  uint8_t cfg[16];if(!nfc.mifareBlockRead(l->cfgPage,cfg)){fail("Falha config inicial");return;}
  bool protectedWrite=cfg[3]!=0xFF;
  if(protectedWrite){
    if(!selectTag(info,len)||!sameLayout(l)||!authenticateCurrent(pwd,pack)){fail("Tag protegida outra senha");return;}
  }

  progress("Gravando link NDEF...");
  if(!writeNdef(url,pwd,pack,protectedWrite,l)){fail(ndefError);return;}

  progress("Configurando senha exclusiva...");
  if(!protectedWrite){
    if(!selectTag(info,len)||!sameLayout(l)||!nfc.page(l->pwdPage,pwd)){fail("Falha PWD");return;}
    uint8_t pp[4]={pack[0],pack[1],0,0};
    if(!selectTag(info,len)||!sameLayout(l)||!nfc.page(l->packPage,pp)){fail("Falha PACK");return;}
  }

  if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){fail("PWD_AUTH falhou");return;}
  progress("Ativando protecao contra escrita...");
  if(!selectTag(info,len)||!sameLayout(l)||!nfc.mifareBlockRead(l->cfgPage,cfg)){fail("Falha config");return;}
  if(cfg[3]!=0x04){
    uint8_t pCfg[4]={cfg[0],cfg[1],cfg[2],0x04};
    if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)||!nfc.page(l->cfgPage,pCfg)){fail("Falha AUTH0");return;}
  }
  if(!selectTag(info,len)||!sameLayout(l)||!nfc.mifareBlockRead(l->cfgPage,cfg)||cfg[3]!=0x04||!authenticateCurrent(pwd,pack)){fail("Protecao nao confirmada");return;}

  sessionCount++;telaSucesso();
  Serial.print("{\"ok\":true,\"uid\":\"");Serial.print(uid);Serial.print("\",\"chip\":\"");Serial.print(l->name);Serial.print("\",\"protected\":true,\"count\":");Serial.print(sessionCount);Serial.println("}");
}

void setup(){
  Serial.begin(115200);Serial.setTimeout(3000);
  pinMode(BTN_UP,INPUT_PULLUP);pinMode(BTN_DOWN,INPUT_PULLUP);pinMode(BTN_OK,INPUT_PULLUP);
  Wire.begin(OLED_SDA,OLED_SCL);oledOk=display.begin(SSD1306_SWITCHCAPVCC,OLED_ADDR);
  if(oledOk)tela("BIRX PETS","NFC USB v1.6","Iniciando...");
  else Serial.println("{\"type\":\"warning\",\"message\":\"OLED nao encontrada 0x3C\"}");
  SPI.begin(SPI_SCK,SPI_MISO,SPI_MOSI);nfc.begin();nfc.reset();nfc.setupRF();
  delay(500);telaPronto();
  Serial.println("{\"type\":\"ready\",\"device\":\"BIRX-NFC\",\"fw\":\"1.6\",\"display\":\"SSD1306-128x32\",\"chips\":[\"NTAG213\",\"NTAG215\",\"NTAG216\"],\"wait_tag_ms\":30000}");
}

void loop(){
  if(btn(BTN_UP)||btn(BTN_DOWN))telaStatus();
  if(btn(BTN_OK))telaPronto();
  if(!Serial.available()){delay(5);return;}
  String j=Serial.readStringUntil('\n');j.trim();
  if(field(j,"cmd")!="program"){fail("Comando invalido");return;}
  String code=field(j,"code"),url=field(j,"url"),pwd=field(j,"pwd"),pack=field(j,"pack");
  if(!url.startsWith("https://pets.birx.com.br/q/")){fail("URL fora Birx Pets");return;}
  programTag(code,url,pwd,pack);
  unsigned long t=millis();while(millis()-t<3500){if(btn(BTN_OK))break;delay(20);}telaPronto();
}
