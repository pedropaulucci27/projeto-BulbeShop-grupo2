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
  try {
    const pedidoIdReal = localStorage.getItem('bulbe:pedidoId') || '';
    const el = document.getElementById('orderInfo');
    if(el){
      el.innerHTML = pedidoIdReal ? `Número do pedido: ${pedidoIdReal}` : 'Número do pedido: aguardando confirmação';
    }
    const trackingCode = localStorage.getItem('bulbe:trackingCode');
    if(trackingCode){
      const trackingEl = document.getElementById('trackingInfo');
      const codeEl = document.getElementById('trackingCode');
      if(trackingEl && codeEl){
        codeEl.textContent = trackingCode;
        trackingEl.hidden = false;
      }
    }
  } catch(e) {}
})();

// ——— botões da página
document.getElementById('btnResumo')?.addEventListener('click', () => {
  window.location.href = '/altafidelidade/pagamento1/pagamento.html';
});

document.getElementById('btnInicio')?.addEventListener('click', () => {
  window.location.href = '/altafidelidade/home/paginicial.html';
});
