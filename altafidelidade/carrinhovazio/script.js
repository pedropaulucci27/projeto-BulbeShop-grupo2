/* Ao abrir, consulta a API. Se houver itens reais, redireciona para o carrinho. */
async function init() {
  if (!window.api) return;

  if (!window.api.estaLogado()) {
    // Deslogado → redireciona para login seguindo o padrão das páginas privadas
    window.location.href = "/altafidelidade/login/login.html?next=" +
      encodeURIComponent("/altafidelidade/carrinhos/carrinho.html");
    return;
  }

  try {
    const resp = await window.api.carrinho.listar();

    // Aceita os mesmos formatos que o carrinho principal
    const lista =
      resp?.itens ??
      resp?.items ??
      resp?.carrinho?.itens ??
      resp?.carrinho?.items ??
      (Array.isArray(resp?.carrinho) ? resp.carrinho : null) ??
      (Array.isArray(resp) ? resp : []);

    if (Array.isArray(lista) && lista.length > 0) {
      window.location.href = "../carrinhos/carrinho.html";
    }
    // Se lista vazia → permanece na tela de carrinho vazio
  } catch {
    // Erro na API → permanece na tela vazia
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
