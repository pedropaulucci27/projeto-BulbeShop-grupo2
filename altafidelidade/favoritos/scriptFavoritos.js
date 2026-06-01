/* ======================================================
   Bulbe • Favoritos — scriptFavoritos.js
   ====================================================== */

const LS_KEY_FAVS = "bulbe:favorites";

function getFavs() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_FAVS)) || []; }
  catch { return []; }
}

function saveFavs(arr) {
  localStorage.setItem(LS_KEY_FAVS, JSON.stringify(arr));
}

async function removerFavorito(id) {
  saveFavs(getFavs().filter(f => f.id !== id));
  if (window.api?.estaLogado()) {
    try { await window.api.favoritos.remover(id); } catch {}
  }
  renderFavoritos();
}

function renderFavoritos() {
  const container = document.getElementById("lista-favoritos");
  if (!container) return;

  const favs = getFavs();
  container.innerHTML = "";

  if (favs.length === 0) {
    container.innerHTML = `
      <div class="fav-empty">
        <p>Você ainda não favoritou nenhum produto.</p>
        <p>Toque no ❤ em qualquer produto para salvar aqui.</p>
      </div>`;
    return;
  }

  favs.forEach(fav => {
    // Card horizontal
    const card = document.createElement("div");
    card.className = "fav-card";
    card.innerHTML = `
      <img class="fav-card__img" src="${fav.img || ''}" alt="${fav.title || 'Produto'}"
           onerror="this.style.display='none'">
      <div class="fav-card__body">
        <p class="fav-card__nome">${fav.title || 'Produto'}</p>
        ${fav.priceOld ? `<p class="fav-card__antigo">De <span class="risco">${fav.priceOld}</span> por</p>` : ''}
        <p class="fav-card__preco">${fav.price || ''}</p>
      </div>
      <div class="fav-card__acoes">
        <button class="icon-btn heart active" data-fav-id="${fav.id}" aria-label="Remover dos favoritos">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.8 7.4 6.75 5.6 8.56c-1.82 1.82-1.78 4.72.1 6.6l5.83 5.83c.26.26.68.26.94 0l5.83-5.83c1.88-1.88 1.92-4.78.1-6.6-1.8-1.81-4.54-1.76-6.3.08z"
              fill="currentColor" stroke="currentColor" stroke-width="1.2" />
          </svg>
        </button>
        <button class="icon-btn cart" aria-label="Adicionar ao carrinho" data-add-id="${fav.id}">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M3 3h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" fill="none"
              stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="9" cy="20" r="1.6" fill="currentColor" />
            <circle cx="17" cy="20" r="1.6" fill="currentColor" />
          </svg>
        </button>
      </div>`;
    container.appendChild(card);

    // Faixa azul "Na Bulbe sai: X% OFF"
    const banner = document.createElement("div");
    banner.className = "bulbe-banner";
    banner.innerHTML = `<span>Na Bulbe sai: <strong>5% OFF</strong></span><span class="bulbe-banner__arrow">←</span>`;
    container.appendChild(banner);
  });

  // Remover favorito ao clicar no coração
  container.querySelectorAll(".icon-btn.heart[data-fav-id]").forEach(btn => {
    btn.addEventListener("click", () => removerFavorito(btn.dataset.favId));
  });

  // Adicionar ao carrinho
  container.querySelectorAll(".icon-btn.cart[data-add-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.addId;
      const fav = getFavs().find(f => f.id === id);
      if (!fav) return;

      const parsePrecoBR = (txt) => {
        if (!txt) return 0;
        return parseFloat(txt.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."));
      };

      const price = parsePrecoBR(fav.price);
      const cartId = `${(fav.title || '').toLowerCase()}|${price.toFixed(2)}`;

      let carrinho = [];
      try { carrinho = JSON.parse(localStorage.getItem("bulbe:cart")) || []; } catch {}

      const existente = carrinho.find(p => p.id === cartId);
      if (existente) existente.qty++;
      else carrinho.push({ id: cartId, title: fav.title, price, img: fav.img, alt: fav.title, qty: 1 });

      localStorage.setItem("bulbe:cart", JSON.stringify(carrinho));
      localStorage.setItem("bulbe:lastAddedId", cartId);
      window.location.href = "/altafidelidade/carrinhos/carrinho.html";
    });
  });
}

async function carregarFavoritosDoServidor() {
  if (!window.api?.estaLogado()) {
    renderFavoritos();
    return;
  }
  try {
    const resposta = await window.api.favoritos.listar();
    const lista = Array.isArray(resposta) ? resposta : (resposta.favoritos || []);
    const favs = lista.map(p => {
      const produto = p.produto || p;
      const preco = parseFloat(produto.preco || produto.price || 0);
      return {
        id:       String(p.produtoId || produto.id || p.id),
        title:    produto.nome || produto.name || produto.title || 'Produto',
        price:    `R$ ${preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        priceOld: "",
        img:      window.resolverImagemProduto
          ? window.resolverImagemProduto(produto.imagem || produto.image || "")
          : (produto.imagem || produto.image || ""),
      };
    });
    saveFavs(favs);
  } catch {}
  renderFavoritos();
}

document.addEventListener("DOMContentLoaded", carregarFavoritosDoServidor);
