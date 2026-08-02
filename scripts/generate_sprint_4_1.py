from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "birx-id-especificacao-lote-piloto.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

BLUE = colors.HexColor("#1267F4")
NAVY = colors.HexColor("#07152F")
LIGHT = colors.HexColor("#EEF4FF")
GRAY = colors.HexColor("#5C677D")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleBirx", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=NAVY, spaceAfter=12))
styles.add(ParagraphStyle(name="H1Birx", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=NAVY, spaceAfter=10))
styles.add(ParagraphStyle(name="H2Birx", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=BLUE, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyBirx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14, textColor=NAVY, spaceAfter=7))
styles.add(ParagraphStyle(name="SmallBirx", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, leading=10, textColor=GRAY))
styles.add(ParagraphStyle(name="CenterBirx", parent=styles["BodyText"], alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=NAVY))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D8E2F3"))
    canvas.line(18*mm, 15*mm, 192*mm, 15*mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(GRAY)
    canvas.drawString(18*mm, 10*mm, "BIRX Pets - Sprint 4.1 - Especificação para lote piloto")
    canvas.drawRightString(192*mm, 10*mm, f"Página {doc.page}")
    canvas.restoreState()

def bullets(items):
    return [Paragraph(f"• {item}", styles["BodyBirx"]) for item in items]

story = []
logo = ROOT / "public" / "assets" / "login.png"
story += [Spacer(1, 18*mm), Image(str(logo), width=48*mm, height=48.5*mm), Spacer(1, 8*mm)]
story += [Paragraph("BIRX ID", styles["TitleBirx"]), Paragraph("Especificação do lote piloto", styles["H1Birx"])]
story += [Paragraph("Família física de identificação para cães e gatos, preparada para orçamento, prototipagem e homologação.", styles["BodyBirx"]), Spacer(1, 8*mm)]
story += [Table([["SPRINT", "4.1"], ["STATUS", "BASE PARA COTAÇÃO"], ["DOMÍNIO", "pets.birx.com.br"]], colWidths=[42*mm, 82*mm], style=TableStyle([
    ("BACKGROUND", (0,0), (0,-1), NAVY), ("TEXTCOLOR", (0,0), (0,-1), colors.white), ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
    ("BACKGROUND", (1,0), (1,-1), LIGHT), ("TEXTCOLOR", (1,0), (1,-1), NAVY), ("FONTSIZE", (0,0), (-1,-1), 9),
    ("GRID", (0,0), (-1,-1), .5, colors.HexColor("#C9D7EE")), ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("TOPPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 8)
]))]
story += [Spacer(1, 12*mm), Paragraph("Decisão comercial", styles["H2Birx"]), Paragraph("A linha adota o nome guarda-chuva BIRX ID. Os nomes foram escolhidos para serem fáceis de explicar no balcão e manter espaço para futuras versões.", styles["BodyBirx"])]
story += bullets(["BIRX ID Essential - identificação gravada.", "BIRX ID Connect - NFC e QR Code.", "BIRX ID Complete - NFC, QR Code, nome e telefone.", "BIRX ID Cat - compacta, leve e silenciosa."])

story += [PageBreak(), Paragraph("1. Família e especificações", styles["H1Birx"])]
data = [["MODELO", "CORPO", "ESPESSURA", "PESO", "IDENTIFICAÇÃO"],
        ["Essential", "35 x 25 mm", "2,5 mm", "até 5 g", "nome + telefone"],
        ["Connect", "38 x 28 mm", "4,5 mm", "até 8 g", "NFC + QR Code"],
        ["Complete", "42 x 30 mm", "4,5 mm", "até 10 g", "NFC + QR + gravação"],
        ["Cat", "28 x 22 mm", "3,5 mm", "até 4 g", "NFC compacto + QR"]]
story += [Table(data, repeatRows=1, colWidths=[28*mm, 31*mm, 27*mm, 23*mm, 53*mm], style=TableStyle([
    ("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("BACKGROUND", (0,1), (-1,-1), colors.white), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT]),
    ("GRID", (0,0), (-1,-1), .5, colors.HexColor("#C9D7EE")), ("FONTSIZE", (0,0), (-1,-1), 8),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7)
]))]
story += [Spacer(1, 8*mm), Paragraph("Construção recomendada", styles["H2Birx"])]
story += bullets(["PETG ou nylon PA12, acabamento fosco, bordas arredondadas e raio mínimo de 4 mm.", "Furo de 4 mm com pelo menos 3 mm de parede; argola inox de 15 mm para cães e 12 mm para gatos.", "Cores iniciais: preto, azul BIRX, branco e rosa.", "Inlay NFC NTAG213 ou equivalente. Homologar tamanho e alcance na amostra.", "URL única no NFC e no QR Code: pets.birx.com.br/q/CODIGO."])
story += [Paragraph("Atenção", styles["H2Birx"]), Paragraph("As dimensões são metas do produto. O fornecedor deve confirmar a compatibilidade entre antena, encapsulamento e alcance antes de produzir o lote.", styles["BodyBirx"])]

story += [PageBreak(), Paragraph("2. Embalagem de balcão", styles["H1Birx"]), Paragraph("Cartela vertical final de 80 x 120 mm, com sangria de 3 mm e euro hole de 32 x 6 mm. Papel cartão de 300 a 350 g/m² com laminação fosca.", styles["BodyBirx"])]
box = Table([[Paragraph("FRENTE", styles["CenterBirx"]), Paragraph("VERSO", styles["CenterBirx"])],
             [Paragraph("BIRX ID<br/><br/>Nome do modelo<br/><br/>Proteção para voltar para casa<br/><br/>[ área da tag ]<br/><br/>NFC + QR Code", styles["CenterBirx"]),
              Paragraph("ATIVE EM 3 PASSOS<br/><br/>1. Leia o QR ou aproxime<br/>2. Cadastre o pet<br/>3. Teste a identificação<br/><br/>pets.birx.com.br<br/>WhatsApp: (41) 98831-5017", styles["CenterBirx"])]],
            colWidths=[76*mm, 76*mm], rowHeights=[10*mm, 112*mm], style=TableStyle([
                ("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("BACKGROUND", (0,1), (0,1), colors.HexColor("#F5F8FF")), ("BACKGROUND", (1,1), (1,1), LIGHT),
                ("BOX", (0,0), (-1,-1), 1, BLUE), ("INNERGRID", (0,0), (-1,-1), .5, colors.HexColor("#B8C9E8")),
                ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("ALIGN", (0,0), (-1,-1), "CENTER")]))
story += [box, Spacer(1, 5*mm), Paragraph("Berço interno: cartão 250 a 300 g/m² ou PET reciclável, com dois cortes para prender a argola. Não colar a tag diretamente na cartela.", styles["SmallBirx"])]

story += [PageBreak(), Paragraph("3. Guia rápido e controle de qualidade", styles["H1Birx"])]
steps = [["1", "LER", "Aponte a câmera para o QR Code ou aproxime o celular."], ["2", "ATIVAR", "Abra o endereço e confirme o código exclusivo da BIRX ID."], ["3", "CADASTRAR", "Informe os dados do pet e os contatos do tutor."], ["4", "TESTAR", "Teste o QR Code e o NFC antes de colocar na coleira."]]
story += [Table(steps, colWidths=[12*mm, 25*mm, 120*mm], style=TableStyle([
    ("BACKGROUND", (0,0), (0,-1), BLUE), ("TEXTCOLOR", (0,0), (0,-1), colors.white), ("FONTNAME", (0,0), (1,-1), "Helvetica-Bold"),
    ("BACKGROUND", (1,0), (-1,-1), LIGHT), ("GRID", (0,0), (-1,-1), .5, colors.HexColor("#C9D7EE")),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9), ("FONTSIZE", (0,0), (-1,-1), 9)
]))]
story += [Spacer(1, 8*mm), Paragraph("Checklist de homologação", styles["H2Birx"])]
story += bullets(["Leitura NFC em iPhone e Android, com e sem capa.", "Leitura do QR Code no tamanho final e sob luz baixa.", "Teste de água, impacto, abrasão, bordas e resistência da argola.", "Peso real dentro da meta de cada modelo.", "Versão Cat sem cantos agressivos e com baixo ruído na coleira.", "Conferência de código: embalagem, QR Code, NFC e painel administrativo devem coincidir.", "Prova física da gráfica aprovada antes do lote."])
story += [Spacer(1, 7*mm), KeepTogether([Paragraph("Contato para cotação", styles["H2Birx"]), Paragraph("BIRX Pets | contato@pets.birx.com.br | (41) 98831-5017 | pets.birx.com.br", styles["BodyBirx"])])]

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=18*mm, bottomMargin=22*mm, title="BIRX ID - Especificação do lote piloto", author="BIRX Pets")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
