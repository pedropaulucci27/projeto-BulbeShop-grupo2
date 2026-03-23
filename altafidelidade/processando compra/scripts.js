document.addEventListener("DOMContentLoaded", () => {
  // Voltar para a página de pagamento (NÃO limpa o storage)
  const backBtn = document.querySelector(".appbar__back");
  backBtn?.addEventListener("click", (ev) => {
    ev.preventDefault();
    const method = (localStorage.getItem('payMethod') || '').toLowerCase();
    if (method.includes('débito') || method.includes('debito')) {
      window.location.href = '/altafidelidade/cartao de debito/index.html';
    } else if (method.includes('pix')) {
      window.location.href = '/altafidelidade/pix/pix.html';
    } else if (method.includes('boleto')) {
      window.location.href = '/altafidelidade/boleto/boleto.html';
    } else {
      window.location.href = '/altafidelidade/pagamento3/pagamento3.html';
    }
  });

  // (opcional) Fechar o toast se existir um botão de fechar com data-close
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const toast = btn.closest(".toast-img-wrap, .toast");
      toast?.parentElement?.removeChild(toast);
    });
  });

  // ===== NÃO APAGAR DADOS DO USUÁRIO =====
  // Nada de localStorage.removeItem(...) aqui.
  // Os dados salvos em pagamento3 permanecem intactos.

  // ===== REDIRECIONAR APÓS 7 SEGUNDOS =====
  // Use um caminho RELATIVO para evitar problemas com espaços no nome de pasta.
  // Estamos em: /altafidelidade/processando compra/html/index.html
  // Destino:     /altafidelidade/pagamento e recusado/status-aprovada.html
  const destino = "../../pagamento e recusado/status-aprovada.html";

  // Se quiser exibir um countdown visual, você pode atualizar algum elemento aqui.
  const timeoutMs = 7000;
  setTimeout(() => {
    window.location.href = destino;
  }, timeoutMs);
});
