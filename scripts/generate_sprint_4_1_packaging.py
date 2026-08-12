from io import BytesIO
from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "birx-id-embalagens-prova-grafica.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = 86 * mm, 126 * mm
BLEED = 3 * mm
TRIM_X, TRIM_Y = BLEED, BLEED
TRIM_W, TRIM_H = 80 * mm, 120 * mm
BLACK = HexColor("#050505")
NAVY = HexColor("#07152F")
BLUE = HexColor("#1267F4")
PALE = HexColor("#EEF4FF")
GRAY = HexColor("#667085")
ORANGE = HexColor("#FF8A3D")

MODELS = [
    {"name": "ESSENTIAL", "subtitle": "IDENTIFICAÇÃO GRAVADA", "feature": "Nome e telefone sempre visíveis", "image": "tag-essential.png", "badge": "SEM MENSALIDADE", "tech": "GRAVAÇÃO DIRETA"},
    {"name": "CONNECT", "subtitle": "NFC + QR CODE", "feature": "Aproxime ou use a câmera", "image": "tag-nfc.png", "badge": "PERFIL ATUALIZÁVEL", "tech": "NFC + QR CODE"},
    {"name": "COMPLETE", "subtitle": "PROTEÇÃO COMPLETA", "feature": "NFC, QR Code, nome e telefone", "image": "tag-nfc-identificacao.png", "badge": "3 FORMAS DE IDENTIFICAR", "tech": "NFC + QR + GRAVAÇÃO"},
    {"name": "CAT", "subtitle": "LEVE E SILENCIOSA", "feature": "Proteção pensada para gatos", "image": None, "badge": "ATÉ 4 G", "tech": "NFC COMPACTO + QR"},
]

def fit_text(c, text, x, y, max_width, size, font="Helvetica-Bold", minimum=6):
    while size > minimum and stringWidth(text, font, size) > max_width:
        size -= .25
    c.setFont(font, size)
    c.drawString(x, y, text)

def transparent_asset(name):
    img = Image.open(ROOT / "public" / "assets" / name).convert("RGBA")
    data = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = data[x, y]
            brightness = min(r, g, b)
            if brightness > 238:
                alpha = max(0, int((255 - brightness) * 15))
                data[x, y] = (r, g, b, min(a, alpha))
    stream = BytesIO()
    img.save(stream, "PNG")
    stream.seek(0)
    return ImageReader(stream), stream

def draw_guides(c):
    c.saveState()
    c.setStrokeColor(HexColor("#00AEEF"))
    c.setLineWidth(.25)
    c.setDash(2, 2)
    c.rect(TRIM_X, TRIM_Y, TRIM_W, TRIM_H, stroke=1, fill=0)
    c.setDash()
    c.setFont("Helvetica", 3.8)
    c.setFillColor(HexColor("#00AEEF"))
    c.drawString(TRIM_X + 1.5*mm, TRIM_Y + 1.2*mm, "LINHA DE CORTE 80 x 120 mm | SANGRIA 3 mm")
    c.restoreState()

def draw_euro_hole(c):
    cx = PAGE_W / 2
    cy = PAGE_H - BLEED - 8 * mm
    w, h = 32 * mm, 6 * mm
    c.saveState()
    c.setFillColor(colors.white)
    c.setStrokeColor(HexColor("#00AEEF"))
    c.setLineWidth(.3)
    c.roundRect(cx - w/2, cy - h/2, w, h, h/2, stroke=1, fill=1)
    c.restoreState()

def draw_logo(c, y):
    logo = ImageReader(str(ROOT / "public" / "assets" / "login.png"))
    c.drawImage(logo, 29*mm, y, width=28*mm, height=28.3*mm, preserveAspectRatio=True, mask="auto")

def draw_cat_tag(c):
    cx, cy = PAGE_W/2, 59*mm
    c.saveState()
    c.setFillColor(HexColor("#111111"))
    c.circle(cx, cy, 22*mm, stroke=0, fill=1)
    c.setStrokeColor(ORANGE)
    c.setLineWidth(1.2)
    c.circle(cx, cy, 18.5*mm, stroke=1, fill=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(cx, cy + 1*mm, "NFC")
    c.setFont("Helvetica-Bold", 5.5)
    c.drawCentredString(cx, cy - 5*mm, "BIRX ID CAT")
    c.restoreState()

def front(c, model, index):
    c.setFillColor(BLACK)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(BLUE)
    c.circle(PAGE_W + 10*mm, -2*mm, 53*mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#0C42A3"))
    c.circle(-15*mm, 1*mm, 38*mm, stroke=0, fill=1)
    draw_logo(c, 91*mm)
    draw_euro_hole(c)

    c.setFillColor(HexColor("#75A7FF"))
    c.setFont("Helvetica-Bold", 5.5)
    c.drawCentredString(PAGE_W/2, 88*mm, "BIRX ID")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(PAGE_W/2, 80.5*mm, model["name"])
    c.setFont("Helvetica-Bold", 5.5)
    c.setFillColor(HexColor("#AFC9FF"))
    c.drawCentredString(PAGE_W/2, 76.8*mm, model["subtitle"])

    if model["image"]:
        image, stream = transparent_asset(model["image"])
        c.drawImage(image, 20.5*mm, 27*mm, width=45*mm, height=45*mm, preserveAspectRatio=True, mask="auto")
        stream.close()
    else:
        draw_cat_tag(c)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(PAGE_W/2, 25*mm, model["feature"])
    c.setFillColor(HexColor("#DCE8FF"))
    c.setFont("Helvetica", 5.4)
    c.drawCentredString(PAGE_W/2, 21.2*mm, "Identificação que ajuda seu pet a voltar para casa")
    c.setFillColor(colors.white)
    c.roundRect(18*mm, 12.2*mm, 50*mm, 6.7*mm, 3.3*mm, stroke=0, fill=1)
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 5.3)
    c.drawCentredString(PAGE_W/2, 14.5*mm, model["badge"])
    c.setFont("Helvetica", 4.2)
    c.setFillColor(HexColor("#B7C8E9"))
    c.drawCentredString(PAGE_W/2, 7.1*mm, f"FRENTE | MODELO {index:02d}")
    draw_guides(c)
    c.showPage()

def back(c, model, index):
    c.setFillColor(HexColor("#F7F9FD"))
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(BLACK)
    c.rect(0, PAGE_H - 31*mm, PAGE_W, 31*mm, stroke=0, fill=1)
    draw_logo(c, 92*mm)
    draw_euro_hole(c)

    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 5.5)
    c.drawString(10*mm, 88*mm, "ATIVE EM 3 PASSOS")
    steps = [("1", "LEIA A TAG", "Use o QR Code ou aproxime o celular."), ("2", "CADASTRE O PET", "Informe os dados e contatos do tutor."), ("3", "FAÇA UM TESTE", "Confira a leitura antes de usar na coleira.")]
    y = 80*mm
    for number, title, body in steps:
        c.setFillColor(BLUE)
        c.circle(13*mm, y + 1.2*mm, 3.2*mm, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(13*mm, y, number)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 6.2)
        c.drawString(19*mm, y + 1.7*mm, title)
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 5.1)
        c.drawString(19*mm, y - 1.5*mm, body)
        y -= 13.2*mm

    c.setFillColor(PALE)
    c.roundRect(8*mm, 33*mm, 70*mm, 13*mm, 3*mm, stroke=0, fill=1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 6)
    c.drawString(12*mm, 40.2*mm, model["tech"])
    c.setFillColor(GRAY)
    c.setFont("Helvetica", 4.8)
    c.drawString(12*mm, 36.6*mm, "Perfil digital sem mensalidade. Dados atualizáveis pelo tutor.")

    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 6)
    c.drawString(10*mm, 26.5*mm, "PRECISA DE AJUDA?")
    c.setFont("Helvetica", 5.2)
    c.drawString(10*mm, 22.8*mm, "pets.birx.com.br")
    c.drawString(10*mm, 19.6*mm, "contato@pets.birx.com.br")
    c.drawString(10*mm, 16.4*mm, "WhatsApp: (41) 98831-5017")
    c.setFillColor(GRAY)
    c.setFont("Helvetica", 4.1)
    c.drawString(10*mm, 10.5*mm, "Não é rastreador GPS. NFC depende de aparelho compatível.")
    c.drawString(10*mm, 8*mm, "Guarde a embalagem. Produto para identificação de animais.")
    c.setFillColor(BLUE)
    c.roundRect(61*mm, 15*mm, 15*mm, 15*mm, 2*mm, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 5)
    c.drawCentredString(68.5*mm, 22.4*mm, "QR DO")
    c.drawCentredString(68.5*mm, 19.5*mm, "GUIA")
    c.setFont("Helvetica", 4.2)
    c.setFillColor(GRAY)
    c.drawCentredString(PAGE_W/2, 5.8*mm, f"VERSO | MODELO {index:02d} | PROVA TÉCNICA")
    draw_guides(c)
    c.showPage()

c = canvas.Canvas(str(OUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
c.setTitle("BIRX ID - Embalagens para prova gráfica")
c.setAuthor("BIRX Pets")
c.setSubject("Cartelas 80 x 120 mm com sangria de 3 mm")
for i, model in enumerate(MODELS, 1):
    front(c, model, i)
    back(c, model, i)
c.save()
print(OUT)
