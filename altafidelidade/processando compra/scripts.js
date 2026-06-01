document.addEventListener("DOMContentLoaded", () => {
  // (opcional) Fechar o toast se existir um botão de fechar com data-close
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const toast = btn.closest(".toast-img-wrap, .toast");
      toast?.parentElement?.removeChild(toast);
    });
  });

  // ===== REDIRECIONAR APÓS VERIFICAR RESULTADO REAL DA API =====
  async function verificarResultadoPagamento() {
    try {
      if (window.api?.estaLogado()) {
        const resultado = await window.api.pagamento?.verificarStatus?.();
        if (resultado?.status === 'recusado') {
          window.location.href = "../../pagamento e recusado/status-recusada.html";
          return;
        }
      }
    } catch {}
    window.location.href = "../../pagamento e recusado/status-aprovada.html";
  }

  verificarResultadoPagamento();
});
