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
  try {
    // Busca o ID real que guardamos durante a compra
    const pedidoIdReal = localStorage.getItem('bulbe:pedidoId') || 'Pendente';

    // Insere direto na tela, sem gerar código falso
    const el = document.getElementById('orderInfo');
    if(el){
      el.innerHTML = `Número do pedido: ${pedidoIdReal}<br>Código de rastreio: (será atualizado em breve)`;
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
