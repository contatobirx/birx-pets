import { jsPDF } from "jspdf";
import qrcode from "qrcode-generator";

const clean = (value, max = 120) => String(value ?? "").trim().slice(0, max);

async function digest(value) {
  const data = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(data)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function authorized(request, env) {
  const supplied = clean(request.headers.get("X-BIRX-Admin"), 500);
  const expected = clean(env.TAG_ADMIN_TOKEN, 500);
  return Boolean(
    supplied &&
      expected &&
      (await digest(supplied)) === (await digest(expected)),
  );
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });

function safeFilename(value) {
  return (
    clean(value, 60)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "LOTE"
  );
}

function drawQr(pdf, text, x, y, sizeMm) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const quiet = 4;
  const total = count + quiet * 2;
  const module = sizeMm / total;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, sizeMm, sizeMm, "F");

  pdf.setFillColor(0, 0, 0);
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      pdf.rect(
        x + (col + quiet) * module,
        y + (row + quiet) * module,
        module + 0.015,
        module + 0.015,
        "F",
      );
    }
  }
}

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) {
    return json(
      {
        sucesso: false,
        mensagem: env.TAG_ADMIN_TOKEN
          ? "Chave administrativa inválida."
          : "Configure TAG_ADMIN_TOKEN na Cloudflare.",
      },
      401,
    );
  }

  try {
    const requestUrl = new URL(request.url);
    const batch = clean(requestUrl.searchParams.get("lote"), 60);

    if (!batch) {
      return json(
        { sucesso: false, mensagem: "Informe o lote que será exportado." },
        400,
      );
    }

    const result = await env.DB.prepare(
      `SELECT codigo, modelo, lote
         FROM tags
        WHERE LOWER(TRIM(COALESCE(lote, ''))) = LOWER(TRIM(?))
          AND COALESCE(modelo, 'nfc') <> 'essential'
        ORDER BY id ASC
        LIMIT 500`,
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
    });

    const diameter = 30;
    const gapX = 3;
    const gapY = 3;
    const cols = 6;
    const rows = 8;
    const perPage = cols * rows;
    const pageWidth = 210;
    const pageHeight = 297;
    const gridWidth = cols * diameter + (cols - 1) * gapX;
    const gridHeight = rows * diameter + (rows - 1) * gapY;
    const startX = (pageWidth - gridWidth) / 2;
    const startY = (pageHeight - gridHeight) / 2;

    for (let index = 0; index < tags.length; index += 1) {
      if (index > 0 && index % perPage === 0) pdf.addPage();

      const local = index % perPage;
      const col = local % cols;
      const row = Math.floor(local / cols);
      const x = startX + col * (diameter + gapX);
      const y = startY + row * (diameter + gapY);
      const tag = tags[index];
      const targetUrl = `${requestUrl.origin}/q/${encodeURIComponent(tag.codigo)}`;

      pdf.setFillColor(0, 0, 0);
      pdf.circle(x + diameter / 2, y + diameter / 2, diameter / 2, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text("SCAN", x + diameter / 2, y + 4.2, {
        align: "center",
        baseline: "middle",
      });

      drawQr(pdf, targetUrl, x + 5, y + 5.5, 20);

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(4.4);
      pdf.text(String(tag.codigo), x + diameter / 2, y + 28.1, {
        align: "center",
        maxWidth: 25,
      });
    }

    pdf.setProperties({
      title: `Adesivos Birx ID - ${batch}`,
      subject: "Adesivos redondos Birx ID de 30 mm",
      author: "BIRX Pets",
      creator: "BIRX Pets",
    });

    const bytes = pdf.output("arraybuffer");
    const filename = `Adesivos-Birx-${safeFilename(batch)}-${tags.length}un.pdf`;

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("admin-tags-labels GET", error);
    return json(
      {
        sucesso: false,
        mensagem: "Não foi possível gerar a folha de adesivos.",
      },
      500,
    );
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
