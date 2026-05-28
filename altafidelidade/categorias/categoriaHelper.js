const SVG_HEART = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.8 7.4 6.75 5.6 8.56c-1.82 1.82-1.78 4.72.1 6.6l5.83 5.83c.26.26.68.26.94 0l5.83-5.83c1.88-1.88 1.92-4.78.1-6.6-1.8-1.81-4.54-1.76-6.3.08z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
const SVG_CART  = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3 3h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="17" cy="20" r="1.6" fill="currentColor"/></svg>`;

function formatPriceBR(n) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildCardCategoria(p) {
  const badge = p.destaque
    ? `<span class="badge badge-flash">oferta relâmpago</span>`
    : "";

  const priceWas = "";
  const promo    = "";

  const link  = `/altafidelidade/produto/produto.html?id=${p.id}`;
  const img   = resolverImagemProduto(p.image);
  const preco = parseFloat(p.price);

  return `
    <article class="card">
      <div class="card-body">
        ${badge}
        <div class="media">
          <a href="${link}"><img src="${img}" alt="${p.title}" onerror="this.onerror=null;this.src='/altafidelidade/home/img/ventiladorbritania.webp'"></a>
        </div>
        <div class="info">
          <a href="${link}"><h3 class="title">${p.title}</h3></a>
          <div class="pricebox">
            <div class="price-now" data-preco="${preco}">R$${formatPriceBR(preco)}</div>
            ${priceWas}
          </div>
          ${promo}
        </div>
        <div class="actions">
          <button class="icon-btn heart" data-id="${p.id}" aria-label="Favoritar">${SVG_HEART}</button>
          <button class="icon-btn cart" data-id="${p.id}" aria-label="Adicionar ao carrinho">${SVG_CART}</button>
        </div>
      </div>
    </article>`;
}

async function renderProdutosCategoria(categoriaSlug) {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  try {
    const resposta = await window.api.produtos.listar(`?categoria=${categoriaSlug}`);
    const lista = resposta.data || resposta;
    if (lista.length === 0) {
      grid.innerHTML = `<p style="padding:2rem;text-align:center">Nenhum produto encontrado nesta categoria.</p>`;
      return;
    }
    grid.innerHTML = lista.map(buildCardCategoria).join("");
  } catch {

 grid.querySelectorAll('.icon-btn.cart').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!id) return;

        if (!window.api.estaLogado()) {
            window.location.href = '/altafidelidade/login/login.html';
            return;
        }

        try {
            btn.disabled = true;
            await window.api.carrinho.adicionar(Number(id), 1);
            btn.classList.add('active');
        } catch (err) {
            console.error('Erro ao adicionar ao carrinho:', err);
        } finally {
            btn.disabled = false;
        }
    });
 });

 grid.querySelectorAll('.icon-btn.heart').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!id) return;

        if (!window.api.estaLogado()) {
            window.location.href = '/altafidelidade/login/login.html';
            return;
        }

        try {
            btn.disabled = true;
            if (btn.classList.contains('active')) {
                await window.api.favoritos.remover(Number(id));
                btn.classList.remove('active');
            } else {
                await window.api.favoritos.adicionar(Number(id));
                btn.classList.add('active');
            }
        } catch (err) {
            console.error('Erro ao atualizar favorito:', err);
        } finally {
            btn.disabled = false;
        }
     });
   });
   
  }
}

window.renderProdutosCategoria = renderProdutosCategoria;