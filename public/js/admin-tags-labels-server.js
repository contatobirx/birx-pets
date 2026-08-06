(() => {
  "use strict";

  const button = document.getElementById("gerarFolhaAdesivos");
  const batchInput = document.getElementById("lote");

  if (!button || !batchInput) return;

  function notify(message, isError = false) {
    if (window.BirxTagsAdmin?.notify) {
      window.BirxTagsAdmin.notify(message, isError);
      return;
    }
    window.alert(message);
  }

  function getAdminToken() {
    return sessionStorage.getItem("orbitek_tag_admin") || "";
  }

  function filenameFromDisposition(disposition, fallback) {
    const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8?.[1]) return decodeURIComponent(utf8[1]);

    const regular = disposition.match(/filename="?([^";]+)"?/i);
    return regular?.[1] || fallback;
  }

  async function readError(response) {
    const type = response.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      return data.mensagem || data.message || `Erro HTTP ${response.status}.`;
    }

    const text = await response.text().catch(() => "");
    return text.slice(0, 250) || `Erro HTTP ${response.status}.`;
  }

  async function generateLabelsPdf() {
    const batch = batchInput.value.trim();
    if (!batch) {
      notify("Informe o lote no campo Lote antes de gerar o PDF.", true);
      batchInput.focus();
      return;
    }

    const token = getAdminToken();
    if (!token) {
      notify("Sua sessão administrativa expirou. Entre novamente.", true);
      return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Gerando PDF...";

    try {
      const response = await fetch(
        `/api/admin-tags-labels?lote=${encodeURIComponent(batch)}&_=${Date.now()}`,
        {
          method: "GET",
          headers: {
            "X-BIRX-Admin": token,
            Accept: "application/pdf, application/json",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/pdf")) {
        throw new Error(
          "O servidor respondeu, mas não devolveu um PDF. Confira o deploy da Function admin-tags-labels.",
        );
      }

      const blob = await response.blob();
      if (!blob.size) throw new Error("O PDF gerado veio vazio.");

      const fallback = `Adesivos-Birx-${batch}.pdf`;
      const filename = filenameFromDisposition(
        response.headers.get("content-disposition") || "",
        fallback,
      );

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);

      notify(`Folha de adesivos do lote “${batch}” gerada com sucesso.`);
    } catch (error) {
      console.error("Erro ao gerar folha de adesivos:", error);
      notify(error?.message || "Não foi possível gerar o PDF.", true);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  button.addEventListener("click", generateLabelsPdf);
})();
