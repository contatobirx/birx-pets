# Gravadora BIRX NFC USB v1.6

Hardware integrado da caixa:
- ESP32
- PN5180
- OLED SSD1306 128x32 em I2C 0x3C
- 3 botões

## Pinos

OLED:
- SDA GPIO21
- SCL GPIO22

Botões:
- UP GPIO25
- DOWN GPIO26
- OK GPIO27

PN5180:
- NSS GPIO16
- BUSY GPIO5
- RST GPIO17
- SCK GPIO18
- MISO GPIO19
- MOSI GPIO23

## Fluxo
O navegador conversa com o ESP32 por Web Serial a 115200 bps. O celular lê o QR da BIRX ID e o PC envia ao ESP32 o código, URL, PWD e PACK da unidade.

O firmware espera até 30 segundos pela aproximação da NFC e mostra no OLED:
- aguardando QR
- código recebido
- aguardando NFC
- chip detectado
- gravação NDEF
- proteção PWD/PACK
- ativação AUTH0
- sucesso ou erro

Suporta NTAG213, NTAG215 e NTAG216 por GET_VERSION.

Cada BIRX ID usa credencial NFC exclusiva gerada no backend. O firmware não contém NFC_MASTER_KEY nem senha mestre.

Os botões UP/DOWN mostram status local e OK volta à tela de prontidão.
