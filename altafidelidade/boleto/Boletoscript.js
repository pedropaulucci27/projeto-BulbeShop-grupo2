

// Abrir modal ao clicar em "Não recebi o boleto"
const btnNaoRecebi = document.getElementById("btnNaoRecebi");
const modal = document.getElementById("modalBoleto");
const btnFecharModal = document.getElementById("btnFecharModal");
const btnTentarNovamente = document.getElementById("btnTentarNovamente");

function abrirModal() {
    if (!modal) return;
    modal.hidden = false;
}

function fecharModal() {
    if (!modal) return;
    modal.hidden = true;
}

btnNaoRecebi?.addEventListener("click", abrirModal);
btnFecharModal?.addEventListener("click", fecharModal);
btnTentarNovamente?.addEventListener("click", fecharModal);

// fechar clicando fora da caixa
modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
        fecharModal();
    }
});

// fechar com ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
        fecharModal();
    }
});

// Botão "Concluir compra" -> registra boleto na API e segue
const btnConcluir = document.getElementById("btnConcluir");

btnConcluir?.addEventListener("click", async () => {
  const pedidoId = localStorage.getItem("bulbe:pedidoId");

  if (window.api?.estaLogado() && pedidoId) {
    btnConcluir.disabled = true;
    try {
      await window.api.pedidos.pagarBoleto(pedidoId);
      localStorage.removeItem("bulbe:pedidoId");
      localStorage.removeItem("bulbe:cart");
      localStorage.removeItem("bulbe:checkoutItems");
      window.location.href = "/altafidelidade/processando compra/html/index.html";
    } catch {
      btnConcluir.disabled = false;
      window.location.href = "/altafidelidade/pagamento e recusado/status-recusada.html";
    }
  } else {
    window.location.href = "/altafidelidade/processando compra/html/index.html";
  }
});
