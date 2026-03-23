// ——— navegação do header
document.getElementById('btnBack')?.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('btnLogo')?.addEventListener('click', () => {
  // leve o usuário para sua “home”
  window.location.href = '/altafidelidade/home/paginicial.html';
});

// ——— carrega dados do pedido / cartão (salvos na etapa de pagamento)
(function hydrateFromStorage(){
  try{
    const data = JSON.parse(localStorage.getItem('bulbeCheckout') || '{}');

    // gera e mostra (se não existir) um nº de pedido simples
    if(!data.orderId){
      const rnd = Math.random().toString(36).slice(2,8).toUpperCase();
      data.orderId = `AP${Date.now().toString().slice(-6)}${rnd}`;
      localStorage.setItem('bulbeCheckout', JSON.stringify(data));
    }

    const el = document.getElementById('orderInfo');
    if(el){
      el.innerHTML = `Número do pedido: ${data.orderId}<br>Código de rastreio: (será atualizado em breve)`;
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
