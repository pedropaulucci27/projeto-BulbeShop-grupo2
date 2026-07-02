const CHAVE_CUPONS_RESGATADOS = "bulbe:cupons:resgatados";

function getCuponsResgatados() {
  try { return JSON.parse(localStorage.getItem(CHAVE_CUPONS_RESGATADOS) || "[]"); }
  catch { return []; }
}

function descreverCupom(cupom) {
  const desconto = cupom.tipo === "%" ? `${cupom.desconto}% OFF` : `R$${cupom.desconto} OFF`;
  return `${cupom.codigo} — ${desconto}`;
}

function calcularDescontoCupom(cupom, total) {
  if (!cupom) return 0;
  const valor = Number(cupom.desconto || 0);
  const bruto = cupom.tipo === "%" ? (total * valor) / 100 : valor;
  return Math.min(bruto, total);
}

// Preenche o seletor de cupons com os resgatados na página /cupons e liga o evento de escolha
function montarSeletorCupom(total) {
  const box = document.getElementById('cupomSelect');
  if (!box) return;

  const head  = box.querySelector('.selectbox__head');
  const list  = box.querySelector('.selectbox__list');
  const label = box.querySelector('.selectbox__label');
  const cupons = getCuponsResgatados();
  const codigoAtivo = localStorage.getItem('bulbe:cupom') || '';

  if (!cupons.length) {
    label.textContent = 'Nenhum cupom disponível';
    list.innerHTML = '';
    head.disabled = true;
    return;
  }

  head.disabled = false;
  list.innerHTML = '<li class="selectbox__opt" data-codigo="" role="option">Nenhum cupom</li>' +
    cupons.map(c => `<li class="selectbox__opt" data-codigo="${c.codigo}" role="option">${descreverCupom(c)}</li>`).join('');

  const ativo = cupons.find(c => c.codigo === codigoAtivo);
  label.textContent = ativo ? descreverCupom(ativo) : 'Selecionar cupom';

  list.querySelectorAll('.selectbox__opt').forEach(li => {
    const isAtivo = li.dataset.codigo === codigoAtivo;
    li.classList.toggle('is-active', isAtivo);
    if (isAtivo) li.setAttribute('aria-selected', 'true');
  });

  if (!head.dataset.bound) {
    head.dataset.bound = '1';
    head.addEventListener('click', () => {
      const open = box.getAttribute('aria-expanded') === 'true';
      box.setAttribute('aria-expanded', String(!open));
    });
  }

  if (!list.dataset.bound) {
    list.dataset.bound = '1';
    list.addEventListener('click', (ev) => {
      const opt = ev.target.closest('.selectbox__opt');
      if (!opt) return;

      list.querySelectorAll('.selectbox__opt').forEach(li => {
        li.classList.remove('is-active');
        li.removeAttribute('aria-selected');
      });
      opt.classList.add('is-active');
      opt.setAttribute('aria-selected', 'true');

      const codigo = opt.dataset.codigo;
      if (codigo) {
        localStorage.setItem('bulbe:cupom', codigo);
      } else {
        localStorage.removeItem('bulbe:cupom');
      }
      label.textContent = opt.textContent.trim();
      box.setAttribute('aria-expanded', 'false');

      atualizarResumoCupom(total);
    });
  }
}

// Atualiza o desconto exibido e o total final com base no cupom escolhido
function atualizarResumoCupom(total) {
  const cupons = getCuponsResgatados();
  const codigoAtivo = localStorage.getItem('bulbe:cupom') || '';
  const cupom = cupons.find(c => c.codigo === codigoAtivo);
  const desconto = calcularDescontoCupom(cupom, total);

  const fmt = (n) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;
  const elCupom = document.getElementById('review-cupom');
  const elTotalFinal = document.getElementById('review-total-final');

  if (elCupom) elCupom.textContent = desconto > 0 ? `-${fmt(desconto)}` : '-R$ 0,00';
  if (elTotalFinal) elTotalFinal.textContent = fmt(total - desconto);
}

async function renderCheckoutItems() {
  const cartSection = document.querySelector('.cart');
  if (!cartSection) return;

  if(!window.api.estaLogado()) {
    window.location.href = '/altafidelidade/login/login.html';
    return;
  }

  try {
    const resposta = await window.api.carrinho.listar();
    const items = Array.isArray(resposta) ? resposta : (resposta.itens || resposta.data || []);

    if(!items.length) {
      window.location.href = '/altafidelidade/carrinhovazio/carrinhovazio.html';
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

        const fmt = (n) => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;

    const elTotalBruto = document.getElementById('review-total-bruto');
    const elSubtotal = document.querySelector('.value--muted');
    const elTotalFinal = document.getElementById('review-total-final');
    const elFrete = document.getElementById('review-frete');

    if (elTotalBruto)  elTotalBruto.textContent  = fmt(total);
    if (elSubtotal) elSubtotal.textContent = fmt(total);
    if (elTotalFinal) elTotalFinal.textContent = fmt(total);

    const cliente = JSON.parse(localStorage.getItem('checkoutCustomer') || '{}');
    if (elFrete && cliente.frete) {
      const precoFrete = cliente.frete.split('|')[1]?.trim() || 'GRÁTIS';
      elFrete.textContent = precoFrete;
      elFrete.className = 'value';
    }

    montarSeletorCupom(total);
    atualizarResumoCupom(total);

  } catch (err) {
    console.error('Erro ao carregar carrinho:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutItems();

  if (window.api.estaLogado()) {
    window.api.usuario.pontos()
      .then(dados => {
        const saldo = dados.saldo || dados.pontos || 0;
        const elPontos = document.querySelector('.value--link');
        if (elPontos) elPontos.textContent = `${saldo} pontos disponíveis >`;
      })
      .catch(() => {});
  }

  const cliente = JSON.parse(localStorage.getItem('checkoutCustomer') || '{}');
  const elNome = document.querySelector('.address-card__title');
  const elEnd  = document.querySelector('.address-card__sub');
  if (elNome && cliente.nome) elNome.textContent = cliente.nome;
  if (elEnd  && cliente.rua) {
    elEnd.innerHTML =
      `${cliente.rua}, ${cliente.numero || 'S/N'}${cliente.compl ? ', ' + cliente.compl : ''}<br>`
      + `${cliente.cep} ${cliente.cidade}, ${cliente.estado}`;
  }

  const box    = document.getElementById('paySelect');
  if (!box) return;

  const head   = box.querySelector('.selectbox__head');
  const list   = box.querySelector('.selectbox__list');
  const label  = box.querySelector('.selectbox__label');
  const btn    = document.querySelector('.cta__btn');

  function norm(s=''){ return s.trim().toLowerCase(); }
  function getMethod(){ return norm(label?.textContent || ''); }

  function refreshCTA(){
    if (!btn) return;
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
        window.location.href = '/altafidelidade/pagamento2/pagamento2.html';
      } catch (err) {
        alert("Erro ao criar pedido: " + (err.message || "Carrinho vazio ou estoque insuficiente."));
      } finally {
        btn.disabled = false;
        btn.textContent = 'Continuar';
      }
    } else {
        window.location.href = '/altafidelidade/pagamento2/pagamento2.html';
    }
  });
});

(function () {
  const HOME_URL = '/altafidelidade/home/paginicial.html';

  const backBtn = document.querySelector('.appbar__back');
  const logoImg = document.querySelector('.appbar__logo');

  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', () => {
      window.location.href = '/altafidelidade/carrinhos/carrinho.html';
    });
  }

  if (logoImg) {
    logoImg.style.cursor = 'pointer';
    logoImg.addEventListener('click', () => {
      const override = logoImg.getAttribute('data-home');
      window.location.href = override || HOME_URL;
    });
  }
})();