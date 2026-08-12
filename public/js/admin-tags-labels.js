(() => {
  const button = document.getElementById("gerarFolhaAdesivos");
  const batchInput = document.getElementById("lote");
  if (!button || !batchInput) return;

  async function generate() {
    const batch = batchInput.value.trim();
    if (!batch) {
      window.BirxTagsAdmin?.notify(
        "Informe o lote no campo Lote antes de gerar o PDF.",
        true,
      );
      batchInput.focus();
      return;
    }

    const token = sessionStorage.getItem("orbitek_tag_admin") || "";
    if (!token) {
      window.BirxTagsAdmin?.notify(
        "Sua sessão administrativa expirou. Entre novamente.",
        true,
      );
      return;
    }

    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Gerando PDF...";

    try {
      const response = await fetch(
        `/api/admin-tags-labels?lote=${encodeURIComponent(batch)}`,
        {
          headers: { "X-BIRX-Admin": token },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.mensagem || "Não foi possível gerar o PDF.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/i);
      const filename = match?.[1] || `Adesivos-Birx-${batch}.pdf`;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

      window.BirxTagsAdmin?.notify(
        `Folha de adesivos do lote “${batch}” gerada com sucesso.`,
      );
    } catch (error) {
      console.error(error);
      window.BirxTagsAdmin?.notify(
        error.message || "Não foi possível gerar o PDF.",
        true,
      );
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  }

  button.addEventListener("click", generate);
})();
