#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PN5180.h>
#include <PN5180ISO14443.h>

// ============================================================
// BIRX NFC Wi-Fi v2.0 - prototipo de bancada
// ============================================================
// Preencha antes do upload.
const char* WIFI_SSID = "SEU_WIFI";
const char* WIFI_PASS = "SUA_SENHA";
const char* WRITER_TOKEN = "COLE_AQUI_O_GRAVADORA_API_TOKEN";
const char* API_URL = "https://pets.birx.com.br/api/nfc-writer";

// OLED 0,91 SSD1306 128x32 I2C
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1
#define OLED_ADDR 0x3C
#define OLED_SDA 21
#define OLED_SCL 22
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Botoes: outro terminal de todos vai ao GND
#define BTN_UP 25
#define BTN_DOWN 26
#define BTN_OK 27

// PN5180
#define PN_NSS 16
#define PN_BUSY 5
#define PN_RST 17
#define SPI_SCK 18
#define SPI_MISO 19
#define SPI_MOSI 23

class BirxNFC : public PN5180ISO14443 {
public:
  BirxNFC(uint8_t s,uint8_t b,uint8_t r):PN5180ISO14443(s,b,r){}
  bool page(uint8_t p,const uint8_t*d){
    uint8_t c[6]={0xA2,p,d[0],d[1],d[2],d[3]};
    if(!sendData(c,6,0)) return false;
    delay(12);
    return true;
  }
  bool auth(const uint8_t*pwd,uint8_t*pack){
    uint8_t c[5]={0x1B,pwd[0],pwd[1],pwd[2],pwd[3]};
    if(!sendData(c,5,0)) return false;
    delay(10);
    return readData(2,pack);
  }
};

BirxNFC nfc(PN_NSS,PN_BUSY,PN_RST);

const char* menuItems[]={"GRAVAR","ZERAR","STATUS","WIFI"};
const int menuCount=4;
int menuIndex=0;
unsigned long lastButtonTime=0;
const unsigned long debounceTime=180;
String ndefError="";

// ============================================================
// OLED
// ============================================================
void telaMensagem(const String &a,const String &b="",const String &c=""){
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0,0); display.println(a);
  display.setCursor(0,11); display.println(b);
  display.setCursor(0,22); display.println(c);
  display.display();
}

void desenharMenu(){
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(35,0); display.print("BIRX NFC");
  display.setCursor(116,0); display.print(WiFi.status()==WL_CONNECTED?"W":"X");
  display.drawLine(0,9,127,9,SSD1306_WHITE);

  String item=menuItems[menuIndex];
  display.setTextSize(2);
  int16_t x1,y1; uint16_t w,h;
  display.getTextBounds(item,0,0,&x1,&y1,&w,&h);
  display.setCursor((SCREEN_WIDTH-w)/2,14);
  display.print(item);
  display.setTextSize(1);
  display.setCursor(1,19); display.print("<");
  display.setCursor(120,19); display.print(">");
  display.display();
}

void telaCodigo(const String &codigo){
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0,0); display.println("PROXIMA TAG");
  display.drawLine(0,9,127,9,SSD1306_WHITE);
  display.setCursor(0,14); display.println(codigo);
  display.setCursor(0,24); display.print("Aproxime a tag...");
  display.display();
}

// ============================================================
// BOTOES
// ============================================================
bool botaoPressionado(int pino){
  if(digitalRead(pino)==LOW && millis()-lastButtonTime>debounceTime){
    lastButtonTime=millis();
    return true;
  }
  return false;
}

// ============================================================
// WIFI / API
// ============================================================
bool conectarWiFi(unsigned long timeout=15000){
  if(WiFi.status()==WL_CONNECTED) return true;
  telaMensagem("BIRX WIFI","Conectando...",WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID,WIFI_PASS);
  unsigned long inicio=millis();
  while(WiFi.status()!=WL_CONNECTED && millis()-inicio<timeout) delay(250);
  if(WiFi.status()==WL_CONNECTED){
    telaMensagem("WIFI CONECTADO",WiFi.localIP().toString(),"BIRX ONLINE");
    delay(1000);
    return true;
  }
  telaMensagem("WIFI ERRO","Sem conexao","Tente novamente");
  delay(1500);
  return false;
}

bool apiPost(const String &acao,const String &codigo,const String &uid,DynamicJsonDocument &responseDoc,String &erro){
  if(!conectarWiFi()){erro="WiFi offline";return false;}

  // Token dedicado e limitado. Para a versao final, vamos fixar a CA do servidor.
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  if(!http.begin(client,API_URL)){erro="Falha HTTP";return false;}
  http.addHeader("Content-Type","application/json");
  http.addHeader("X-BIRX-Writer",WRITER_TOKEN);

  DynamicJsonDocument req(512);
  req["acao"]=acao;
  if(codigo.length()) req["codigo"]=codigo;
  if(uid.length()) req["uid"]=uid;
  String body;
  serializeJson(req,body);

  int status=http.POST(body);
  String payload=http.getString();
  http.end();
  if(status<=0){erro="Sem resposta da API";return false;}
  DeserializationError jsonErr=deserializeJson(responseDoc,payload);
  if(jsonErr){erro="Resposta JSON invalida";return false;}
  if(status<200||status>=300||responseDoc["sucesso"]!=true){
    erro=responseDoc["mensagem"]|"API recusou a operacao";
    return false;
  }
  return true;
}

// ============================================================
// NFC
// ============================================================
bool selectTag(uint8_t*info,uint8_t&len){
  nfc.reset(); nfc.setupRF(); delay(10);
  len=nfc.activateTypeA(info,1);
  return len>0;
}

String uidFromInfo(uint8_t*info,uint8_t len){
  String uid="";
  for(int i=0;i<len;i++){
    if(info[3+i]<16) uid+='0';
    uid+=String(info[3+i],HEX);
    if(i<len-1) uid+=':';
  }
  uid.toUpperCase();
  return uid;
}

bool fromHex(const String&s,uint8_t*out,int n){
  if((int)s.length()!=n*2) return false;
  for(int i=0;i<n;i++){
    char a=s[i*2],b=s[i*2+1];
    auto v=[](char c)->int{
      if(c>='0'&&c<='9') return c-'0';
      if(c>='A'&&c<='F') return c-'A'+10;
      if(c>='a'&&c<='f') return c-'a'+10;
      return -1;
    };
    int x=v(a),y=v(b);
    if(x<0||y<0) return false;
    out[i]=(x<<4)|y;
  }
  return true;
}

bool authenticateCurrent(const uint8_t*pwd,const uint8_t*pack){
  uint8_t got[2]={0};
  if(!nfc.auth(pwd,got)) return false;
  return got[0]==pack[0]&&got[1]==pack[1];
}

bool writeNdef(const String&url,const uint8_t*pwd,const uint8_t*pack,bool protectedWrite){
  String rest=url.startsWith("https://")?url.substring(8):url;
  int payload=1+rest.length(),ndefLen=4+payload,pos=0;
  if(ndefLen>254){ndefError="URL muito longa";return false;}
  uint8_t data[440];
  data[pos++]=0x03; data[pos++]=ndefLen; data[pos++]=0xD1; data[pos++]=0x01;
  data[pos++]=payload; data[pos++]=0x55; data[pos++]=0x04;
  for(unsigned i=0;i<rest.length();i++) data[pos++]=rest[i];
  data[pos++]=0xFE;
  while(pos%4) data[pos++]=0;

  uint8_t page=4,info[10],len;
  for(int i=0;i<pos;i+=4,page++){
    if(!selectTag(info,len)){ndefError="Tag removida";return false;}
    if(protectedWrite&&!authenticateCurrent(pwd,pack)){ndefError="Tag protegida";return false;}
    if(!nfc.page(page,&data[i])){ndefError="Falha WRITE";return false;}
    if(!selectTag(info,len)){ndefError="Tag removida";return false;}
    uint8_t check[16];
    if(!nfc.mifareBlockRead(page,check)){ndefError="Falha READ";return false;}
    for(int b=0;b<4;b++) if(check[b]!=data[i+b]){ndefError="Falha verificar";return false;}
  }
  return true;
}

bool programTag(const String&url,const String&pwdHex,const String&packHex,String &uid,String &erro){
  uint8_t pwd[4],pack[2],info[10],len;
  if(!fromHex(pwdHex,pwd,4)||!fromHex(packHex,pack,2)){erro="Credencial invalida";return false;}

  unsigned long inicio=millis();
  while(millis()-inicio<15000){
    if(selectTag(info,len)) break;
    delay(120);
  }
  if(len==0){erro="Tag nao encontrada";return false;}
  uid=uidFromInfo(info,len);

  uint8_t cfg[16];
  if(!nfc.mifareBlockRead(0x83,cfg)){erro="Falha configuracao";return false;}
  bool protectedWrite=cfg[3]!=0xFF;
  if(protectedWrite){
    if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){erro="Tag ja protegida";return false;}
  }

  telaMensagem("GRAVANDO...","Nao retire","NDEF");
  if(!writeNdef(url,pwd,pack,protectedWrite)){erro=ndefError;return false;}

  if(!protectedWrite){
    telaMensagem("PROTEGENDO...","Nao retire","PWD / PACK");
    if(!selectTag(info,len)||!nfc.page(0x85,pwd)){erro="Falha PWD";return false;}
    uint8_t pp[4]={pack[0],pack[1],0,0};
    if(!selectTag(info,len)||!nfc.page(0x86,pp)){erro="Falha PACK";return false;}
  }

  if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)){erro="Auth falhou";return false;}
  if(!selectTag(info,len)||!nfc.mifareBlockRead(0x83,cfg)){erro="Falha config";return false;}
  if(cfg[3]!=0x04){
    uint8_t p83[4]={cfg[0],cfg[1],cfg[2],0x04};
    if(!selectTag(info,len)||!authenticateCurrent(pwd,pack)||!nfc.page(0x83,p83)){erro="Falha AUTH0";return false;}
  }
  if(!selectTag(info,len)||!nfc.mifareBlockRead(0x83,cfg)||cfg[3]!=0x04){erro="Protecao nao confirmada";return false;}
  return true;
}

// ============================================================
// MENU REAL
// ============================================================
void opcaoGravar(){
  if(!conectarWiFi()){desenharMenu();return;}
  telaMensagem("GRAVAR","Buscando proxima","tag no site...");

  DynamicJsonDocument doc(2048);
  String erro;
  if(!apiPost("proxima","","",doc,erro)){
    telaMensagem("ERRO API",erro," "); delay(2200); desenharMenu(); return;
  }

  String codigo=doc["codigo"]|"";
  String url=doc["url"]|"";
  String pwd=doc["pwd"]|"";
  String pack=doc["pack"]|"";
  if(!codigo.length()||!url.length()||!pwd.length()||!pack.length()){
    telaMensagem("ERRO API","Dados incompletos",""); delay(1800); desenharMenu(); return;
  }

  telaCodigo(codigo);
  String uid;
  if(!programTag(url,pwd,pack,uid,erro)){
    telaMensagem("FALHA NFC",erro,"Tente novamente"); delay(2200); desenharMenu(); return;
  }

  telaMensagem("NFC OK","Confirmando site",uid);
  DynamicJsonDocument confirmDoc(1024);
  if(!apiPost("confirmar",codigo,uid,confirmDoc,erro)){
    // NFC ja esta fisicamente gravado. Nao tente outro codigo: a API 'proxima'
    // continuara devolvendo este mesmo codigo enquanto ele estiver em estoque.
    telaMensagem("NFC GRAVADO","Site nao confirmou",erro); delay(3000); desenharMenu(); return;
  }

  telaMensagem("TAG GRAVADA!",codigo,"OK = proxima");
  unsigned long inicio=millis();
  while(millis()-inicio<10000){
    if(botaoPressionado(BTN_OK)) break;
    delay(30);
  }
  desenharMenu();
}

void opcaoZerar(){
  telaMensagem("ZERAR TAG","Em breve via API","Use USB por agora");
  delay(2200); desenharMenu();
}

void opcaoStatus(){
  String wifi=WiFi.status()==WL_CONNECTED?"WiFi: OK":"WiFi: OFF";
  telaMensagem("STATUS","PN5180: OK",wifi);
  delay(1800); desenharMenu();
}

void opcaoWiFi(){
  if(WiFi.status()!=WL_CONNECTED) conectarWiFi();
  if(WiFi.status()==WL_CONNECTED) telaMensagem("WIFI OK",WIFI_SSID,WiFi.localIP().toString());
  delay(2000); desenharMenu();
}

void executarOpcao(){
  if(menuIndex==0) opcaoGravar();
  else if(menuIndex==1) opcaoZerar();
  else if(menuIndex==2) opcaoStatus();
  else opcaoWiFi();
}

void setup(){
  Serial.begin(115200);
  pinMode(BTN_UP,INPUT_PULLUP); pinMode(BTN_DOWN,INPUT_PULLUP); pinMode(BTN_OK,INPUT_PULLUP);
  Wire.begin(OLED_SDA,OLED_SCL);
  if(!display.begin(SSD1306_SWITCHCAPVCC,OLED_ADDR)){while(true)delay(100);}
  SPI.begin(SPI_SCK,SPI_MISO,SPI_MOSI);
  nfc.begin(); nfc.reset(); nfc.setupRF();

  telaMensagem("BIRX PETS","NFC WIFI","v2.0");
  delay(1000);
  conectarWiFi();
  desenharMenu();
}

void loop(){
  if(botaoPressionado(BTN_UP)){
    menuIndex--; if(menuIndex<0) menuIndex=menuCount-1; desenharMenu();
  }
  if(botaoPressionado(BTN_DOWN)){
    menuIndex++; if(menuIndex>=menuCount) menuIndex=0; desenharMenu();
  }
  if(botaoPressionado(BTN_OK)) executarOpcao();
}
