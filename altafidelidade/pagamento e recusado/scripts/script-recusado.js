// ——— navegação do header
document.getElementById('btnBack')?.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('btnLogo')?.addEventListener('click', () => {
  window.location.href = '/altafidelidade/home/paginicial.html';
});

// ——— botões da página de recusa (sem geração de orderId)
document.getElementById('btnTentar')?.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('btnInicio')?.addEventListener('click', () => {
  window.location.href = '/altafidelidade/home/paginicial.html';
});
