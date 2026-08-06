import { jsPDF } from "jspdf";
import qrcode from "qrcode-generator";
import {
  authorized,
  clean,
  json,
  safeFilename,
  unauthorized,
} from "./_shared.js";

function drawInvertedQr(pdf, text, x, y, sizeMm) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const module = sizeMm / count;

  pdf.setFillColor(255, 255, 255);
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      pdf.rect(
        x + col * module,
        y + row * module,
        module + 0.018,
        module + 0.018,
        "F",
      );
    }
  }
}

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);

  try {
    const requestUrl = new URL(request.url);
    const batch = clean(requestUrl.searchParams.get("lote"), 60);
    const showCode = requestUrl.searchParams.get("codigo") === "1";

    if (!batch) {
      return json(
        { sucesso: false, mensagem: "Selecione o lote que será exportado." },
        400,
      );
    }

    const result = await env.DB.prepare(
      `SELECT codigo, modelo, lote
         FROM tags
        WHERE LOWER(TRIM(COALESCE(lote, ''))) = LOWER(TRIM(?))
          AND COALESCE(modelo, 'nfc') <> 'essential'
        ORDER BY id ASC
        LIMIT 1000`,
    )
      .bind(batch)
      .all();

    const tags = result.results || [];
    if (!tags.length) {
      return json(
        {
          sucesso: false,
          mensagem: `Nenhuma tag NFC foi encontrada no lote “${batch}”.`,
        },
        404,
      );
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
      precision: 4,
    });

    const diameter = 30;
    const bleed = 0.8;
    const pitchX = 32;
    const pitchY = 33;
    const cols = 6;
    const rows = 8;
    const perPage = cols * rows;
    const pageWidth = 210;
    const pageHeight = 297;
    const gridWidth = diameter + (cols - 1) * pitchX;
    const gridHeight = diameter + (rows - 1) * pitchY;
    const startCenterX = (pageWidth - gridWidth) / 2 + diameter / 2;
    const startCenterY = (pageHeight - gridHeight) / 2 + diameter / 2;

    for (let index = 0; index < tags.length; index += 1) {
      if (index > 0 && index % perPage === 0) pdf.addPage();

      const local = index % perPage;
      const col = local % cols;
      const row = Math.floor(local / cols);
      const centerX = startCenterX + col * pitchX;
      const centerY = startCenterY + row * pitchY;
      const tag = tags[index];
      const targetUrl = `${requestUrl.origin}/q/${encodeURIComponent(tag.codigo)}`;

      // Fundo com pequena sangria para evitar filetes brancos no recorte.
      pdf.setFillColor(0, 0, 0);
      pdf.circle(centerX, centerY, diameter / 2 + bleed, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.8);
      pdf.text("SCAN", centerX, centerY - 10.1, {
        align: "center",
        baseline: "middle",
      });

      const qrSize = showCode ? 19.3 : 20.8;
      drawInvertedQr(
        pdf,
        targetUrl,
        centerX - qrSize / 2,
        centerY - 7.7,
        qrSize,
      );

      if (showCode) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(4.2);
        pdf.text(String(tag.codigo), centerX, centerY + 12.1, {
          align: "center",
          maxWidth: 26,
        });
      }
    }

    pdf.setProperties({
      title: `Adesivos Birx ID - ${batch}`,
      subject: "Adesivos redondos Birx ID de 30 mm para gráfica",
      author: "BIRX Pets",
      creator: "Módulo de Produção BIRX Pets",
    });

    const bytes = pdf.output("arraybuffer");
    const filename = `BIRX-Adesivos-${safeFilename(batch)}-${tags.length}un-30mm.pdf`;

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-BIRX-Quantidade": String(tags.length),
      },
    });
  } catch (error) {
    console.error("producao/adesivos GET", error);
    return json(
      { sucesso: false, mensagem: "Não foi possível gerar os adesivos." },
      500,
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
