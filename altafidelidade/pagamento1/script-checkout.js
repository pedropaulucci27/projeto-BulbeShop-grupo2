/* ======================================================
   Renderiza itens selecionados do carrinho na tela de checkout
   ====================================================== */
function renderCheckoutItems() {
  const cartSection = document.querySelector('.cart');
  if (!cartSection) return;

  let items = [];
  try { items = JSON.parse(localStorage.getItem('bulbe:checkoutItems')) || []; } catch {}

  if (!items.length) return; // mantém os itens hardcoded se não houver seleção

  cartSection.innerHTML = '';

  let total = 0;
  items.forEach(item => {
    total += (item.price || 0) * (item.qty || 1);
    const art = document.createElement('article');
    art.className = 'cart-card';
    art.innerHTML = `
      <img class="cart-card__thumb" src="${item.img || ''}" alt="${item.title || 'Produto'}"
           onerror="this.style.display='none'">
      <div class="cart-card__body">
        <h4 class="cart-card__title">${item.title || 'Produto'}</h4>
        <div class="cart-card__price-row">
          <div class="price">
            <span class="price__curr">R$</span>
            <span class="price__big">${(item.price || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="units">(${item.qty || 1} unidade${(item.qty || 1) > 1 ? 's' : ''})</div>
        </div>
      </div>`;
    cartSection.appendChild(art);
  });

  // Atualiza totais na revisão do pedido
  const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;
  const elTotal = document.querySelector('.review-row .value');
  const elPedido = document.querySelector('.review-total strong');
  if (elTotal) elTotal.textContent = totalFormatado;
  if (elPedido) elPedido.textContent = totalFormatado;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutItems();
  const box    = document.getElementById('paySelect');
  if (!box) return;

  const head   = box.querySelector('.selectbox__head');
  const list   = box.querySelector('.selectbox__list');
  const label  = box.querySelector('.selectbox__label');
  const btn    = document.querySelector('.cta__btn');

  const BLUE = '#08068D';

  function norm(s=''){ return s.trim().toLowerCase(); }
  function getMethod(){ return norm(label?.textContent || ''); }

  function refreshCTA(){
    if (!btn) return;
    // habilita somente quando NÃO for “Selecionado”
    const isDefault = getMethod() === 'selecionado' || getMethod() === '';
    btn.disabled = isDefault;
  }

  // Abre/fecha a lista
  head?.addEventListener('click', () => {
    const open = box.getAttribute('aria-expanded') === 'true';
    box.setAttribute('aria-expanded', String(!open));
  });

  // Clique nas opções
  list?.addEventListener('click', (ev) => {
    const opt = ev.target.closest('.selectbox__opt');
    if (!opt) return;

    // limpa estado anterior
    list.querySelectorAll('.selectbox__opt').forEach(li => {
      li.classList.remove('is-active');
      li.removeAttribute('aria-selected');
    });

    // aplica ativo e acessibilidade
    opt.classList.add('is-active');
    opt.setAttribute('aria-selected','true');

    // atualiza rótulo do cabeçalho
    const text = opt.textContent.trim();
    if (label) label.textContent = text;

    // fecha o dropdown e habilita CTA
    box.setAttribute('aria-expanded','false');
    refreshCTA();

    // salva método para o fluxo
    localStorage.setItem('payMethod', norm(text));
  });

  // Sincroniza rótulo com item ativo que possa vir no HTML
  (function syncOnLoad(){
    const active = list?.querySelector('.selectbox__opt.is-active');
    if (active && label) {
      label.textContent = active.textContent.trim();
      localStorage.setItem('payMethod', norm(active.textContent));
    }
    refreshCTA();
  })();

  // Fluxo do CTA
  btn?.addEventListener('click', () => {
    if (btn.disabled) return;

    const method = localStorage.getItem('payMethod') || '';
    // define a próxima página depois do cadastro
    let nextAfterCadastro = '';
    if (method === 'débito' || method === 'debito') {
      nextAfterCadastro = '/altafidelidade/cartao de debito/index.html';
    } else if (method === 'crédito' || method === 'credito') {
      nextAfterCadastro = '/altafidelidade/pagamento3/pagamento3.html';
    } else if (method === 'pix' || method === 'boleto bancário' || method === 'boleto bancario') {
      // se for implementar depois, já fica salvo
      nextAfterCadastro = method;
    }

    localStorage.setItem('nextAfterCadastro', nextAfterCadastro);

    // vai para o cadastro (pagamento2)
    window.location.href = '/altafidelidade/pagamento2/pagamento2.html';
  });
});

// header-nav.js
(function () {
  // ajuste para o caminho real da sua home:
  const HOME_URL = '/altafidelidade/home/paginicial.html';

  const backBtn = document.querySelector('.appbar__back');
  const logoImg = document.querySelector('.appbar__logo');

  // seta: sempre voltar para a página anterior
  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', () => window.history.back());
  }

  // logo: sempre ir para a home
  if (logoImg) {
    logoImg.style.cursor = 'pointer';
    logoImg.addEventListener('click', () => {
      const override = logoImg.getAttribute('data-home'); // opcional
      window.location.href = override || HOME_URL;
    });
  }
})();

