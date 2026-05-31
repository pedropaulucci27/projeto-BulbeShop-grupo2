// ——— navegação do header
document.getElementById('btnBack')?.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('btnLogo')?.addEventListener('click', () => {
  // leve o usuário para sua “home”
  window.location.href = '/altafidelidade/home/paginicial.html';
});

// ——— carrega dados do pedido vindos da API (salvos após confirmação do pagamento)
(function hydrateFromStorage(){
  try{
    const data = JSON.parse(localStorage.getItem('bulbeCheckout') || '{}');
    const el = document.getElementById('orderInfo');
    if(el){
      const pedido = data.orderId ? `Número do pedido: ${data.orderId}` : 'Número do pedido: aguardando confirmação';
      el.innerHTML = pedido;
    }
    if(data.trackingCode){
      const trackingEl = document.getElementById('trackingInfo');
      const codeEl = document.getElementById('trackingCode');
      if(trackingEl && codeEl){
        codeEl.textContent = data.trackingCode;
        trackingEl.hidden = false;
      }
    }
  }catch(e){}
})();

// ——— botões da página
document.getElementById('btnResumo')?.addEventListener('click', () => {
  window.location.href = '/altafidelidade/pagamento1/pagamento.html';
});

document.getElementById('btnInicio')?.addEventListener('click', () => {
  window.location.href = '/altafidelidade/home/paginicial.html';
});
