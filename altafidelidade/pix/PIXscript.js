// COPIAR CÓDIGO PIX
const btnCopiar = document.getElementById("btnCopiar");
const pixCode = document.getElementById("pixCode");

btnCopiar?.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(pixCode.value);

        // troca a imagem ao copiar com sucesso
        const img = btnCopiar.querySelector("img");
        img.src = "img/check.png";   // sucesso

        setTimeout(() => {
            img.src = "img/Icon (1).png"; // volta ao ícone normal de copiar
        }, 1500);

    } catch (e) {
        alert("Não foi possível copiar o código Pix.");
    }
});

// REDIRECIONAR AO CONCLUIR COMPRA
const btnConcluir = document.getElementById("btnConcluir");

btnConcluir?.addEventListener("click", async () => {
  const pedidoId = localStorage.getItem("bulbe:pedidoId");

  if (window.api?.estaLogado() && pedidoId) {
    btnConcluir.disabled = true;
    try {
      const resp = await window.api.pedidos.pagarPix(pedidoId);
      const chave = resp.pagamento?.chavePix || resp.pagamento?.qrCode || "";
      if (chave) {
        const pixCodeEl = document.getElementById("pixCode");
        if (pixCodeEl) pixCodeEl.value = chave;
      }
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

// (Opcional) clique em "PIX Automático programado"
const btnPixAuto = document.getElementById("btnPixAuto");
btnPixAuto?.addEventListener("click", () => {
    alert("Aqui você pode abrir outro modal ou página com as regras do Pix automático.");
});