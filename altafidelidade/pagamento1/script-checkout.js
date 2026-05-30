async function renderCheckoutItems() {
  const cartSection = document.querySelector('.cart');
  if (!cartSection) return;

  if(!window.api.estaLogado()) {
    window.location.href = '/altafidelidade/login/login.html';
    return;
  }

  try {
    const resposta = await window.api.carrinho.listar();
    const items = resposta.itens || resposta.data || resposta || [];

    if(!items.length) {
      window.location.href = '/altafidelidade/carrinho/carrinho.html';
      return;
    }

    cartSection.innerHTML = '';
    let total = 0;

    items.forEach(item => {
      const preco = parseFloat(item.preco || item.price || 0);
      const qty   = item.quantidade || item.qty || 1;
      total += preco * qty;

      const art = document.createElement('article');
      art.className = 'cart-card';
      art.innerHTML = `
        <img class="cart-card__thumb"
          src="${resolverImagemProduto(item.image || item.imagem || '')}"
            alt="${item.title || item.nome || 'Produto'}"
          onerror="this.style.display='none'">
        <div class="cart-card__body">
          <h4 class="cart-card__title">${item.title || item.nome || 'Produto'}</h4>
          <div class="cart-card__price-row">
            <div class="price">
              <span class="price__curr">R$</span>
              <span class="price__big">${preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="units">(${qty} unidade${qty > 1 ? 's' : ''})</div>
          </div>
        </div>`;
      cartSection.appendChild(art);
    });

    const fmt = `R$ ${total.toFixed(2).replace('.', ',')}`;
    const elTotal  = document.querySelector('.review-row .value');
    const elPedido = document.querySelector('.review-total strong');
    if (elTotal)  elTotal.textContent  = fmt;
    if (elPedido) elPedido.textContent = fmt;

    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
    }

  /* let items = [];
  try { items = JSON.parse(localStorage.getItem('bulbe:checkoutItems')) || []; } catch {}

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

  head?.addEventListener('click', () => {
    const open = box.getAttribute('aria-expanded') === 'true';
    box.setAttribute('aria-expanded', String(!open));
  });

  list?.addEventListener('click', (ev) => {
    const opt = ev.target.closest('.selectbox__opt');
    if (!opt) return;

    list.querySelectorAll('.selectbox__opt').forEach(li => {
      li.classList.remove('is-active');
      li.removeAttribute('aria-selected');
    });

    opt.classList.add('is-active');
    opt.setAttribute('aria-selected','true');

    const text = opt.textContent.trim();
    if (label) label.textContent = text;

    box.setAttribute('aria-expanded','false');
    refreshCTA();

    localStorage.setItem('payMethod', norm(text));
  });

  (function syncOnLoad(){
    const active = list?.querySelector('.selectbox__opt.is-active');
    if (active && label) {
      label.textContent = active.textContent.trim();
      localStorage.setItem('payMethod', norm(active.textContent));
    }
    refreshCTA();
  })();

  btn?.addEventListener('click', async () => {
    if (btn.disabled) return;

    const method = localStorage.getItem('payMethod') || '';
    let nextAfterCadastro = '';
    if (method === 'débito' || method === 'debito') {
      nextAfterCadastro = '/altafidelidade/cartao de debito/index.html';
    } else if (method === 'crédito' || method === 'credito') {
      nextAfterCadastro = '/altafidelidade/pagamento3/pagamento3.html';
    } else if (method === 'pix') {
      nextAfterCadastro = '/altafidelidade/pix/pix.html';
    } else if (method === 'boleto bancário' || method === 'boleto bancario') {
      nextAfterCadastro = '/altafidelidade/boleto/boleto.html';
    }

    localStorage.setItem('nextAfterCadastro', nextAfterCadastro);

    if (window.api?.estaLogado()) {
      btn.disabled = true;
      btn.textContent = 'Processando…';
      try {
        const cupom = localStorage.getItem('bulbe:cupom') || undefined;
        const pedido = await window.api.pedidos.criar(cupom);
        localStorage.setItem('bulbe:pedidoId', String(pedido.id || pedido.pedido?.id || ''));
      } catch {
        // segue sem pedido registrado se API falhar
      } finally {
        btn.disabled = false;
        btn.textContent = 'Continuar';
      }
    }

    window.location.href = '/altafidelidade/pagamento2/pagamento2.html';
  });
});

(function () {
  const HOME_URL = '/altafidelidade/home/paginicial.html';

  const backBtn = document.querySelector('.appbar__back');
  const logoImg = document.querySelector('.appbar__logo');

  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', () => window.history.back());
  }
\
  if (logoImg) {
    logoImg.style.cursor = 'pointer';
    logoImg.addEventListener('click', () => {
      const override = logoImg.getAttribute('data-home'); // opcional
      window.location.href = override || HOME_URL;
    });
  }
})(); */
}