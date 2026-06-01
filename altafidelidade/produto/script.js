const IMG_BASE          = "/altafidelidade/produto/img/";
const IMG_HEART_OUTLINE = IMG_BASE + "heart-outline.png";
const IMG_HEART_FILLED  = IMG_BASE + "Exclude.png";

/* =========================================================
  Header condensado no scroll
  ========================================================= */
(() => {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  const THRESHOLD = 24;
  let ticking = false, active = false;
  const setCondensed = (on) => {
    if (active === on) return;
    active = on;
    header.classList.toggle("is-condensed", on);
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { setCondensed(window.scrollY > THRESHOLD); ticking = false; });
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* =========================================================
  Toast
  ========================================================= */
function showToast(msg) {
  const el = document.getElementById("snackbar");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-show");
  clearTimeout(showToast.__t);
  showToast.__t = setTimeout(() => el.classList.remove("is-show"), 2200);
}

/* =========================================================
  Galeria de imagens (dots)
  ========================================================= */
(() => {
  const img  = document.getElementById("gallery-img");
  const dots = document.querySelectorAll(".dots .dot");
  if (!img || !dots.length) return;
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      dots.forEach((d) => d.classList.remove("is-active"));
      dot.classList.add("is-active");
      img.src = dot.getAttribute("data-src");
    });
  });
})();

/* =========================================================
  Chips (cor / voltagem)
  ========================================================= */
document.querySelectorAll(".variations .choices").forEach((group) => {
  const chips = group.querySelectorAll(".chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
    })
  );
});

/* =========================================================
  Seletor de quantidade
  ========================================================= */
(() => {
  const sel = document.getElementById("qty-select");
  const lab = document.getElementById("qty-label");
  if (!sel || !lab) return;
  sel.addEventListener("change", () => (lab.textContent = sel.value));
})();

/* =========================================================
  Rating (estrelas — preenche a partir do data-rating)
  ========================================================= */
   Toast (snackbar)
   ========================================================= */
function showToast(msg) {
  const el = document.getElementById("snackbar");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-show");
  clearTimeout(showToast.__t);
  showToast.__t = setTimeout(() => el.classList.remove("is-show"), 2200);
}

/* =========================================================
   Likes (favoritos)
   ========================================================= */
const LS_KEY_LIKES = "bulbe_likes_v1";
const LS_KEY_FAVS  = "bulbe:favorites";

function getLikes() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY_LIKES)) || []); }
  catch { return new Set(); }
}
function setLikes(set) {
  localStorage.setItem(LS_KEY_LIKES, JSON.stringify(Array.from(set)));
}
function getFavs() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_FAVS)) || []; }
  catch { return []; }
}
function saveFavs(arr) {
  localStorage.setItem(LS_KEY_FAVS, JSON.stringify(arr));
}

function getProductDataForBtn(btn) {
  // Tenta ler dados do tile pai (prateleira)
  const tile = btn.closest('.tile');
  if (tile) {
    return {
      id:       btn.dataset.likeId || btn.id,
      title:    tile.querySelector('.title')?.textContent?.trim() || 'Produto',
      price:    tile.querySelector('.price')?.textContent?.trim() || '',
      priceOld: tile.querySelector('.price-old')?.textContent?.trim() || '',
      img:      tile.querySelector('img')?.getAttribute('src') || '',
    };
  }
  // Produto principal da página
  return {
    id:       btn.dataset.likeId || btn.id,
    title:    document.querySelector('.product-title')?.textContent?.trim() || 'Produto',
    price:    document.querySelector('.price-current')?.textContent?.trim() || '',
    priceOld: document.querySelector('.price-old')?.textContent?.trim() || '',
    img:      document.querySelector('#gallery-img')?.getAttribute('src') || '',
  };
}

function isLiked(id) { return getLikes().has(id); }

function paintHeart(btn, liked) {
  btn.src = liked ? IMG_HEART_FILLED : IMG_HEART_OUTLINE;
}

function toggleLike(btn) {
  const id  = btn.dataset.likeId || btn.id;
  const set = getLikes();
  const liked = !set.has(id);
  if (liked) set.add(id);
  else set.delete(id);
  setLikes(set);

  // Atualiza lista de favoritos completos
  const favs = getFavs();
  if (liked) {
    if (!favs.find(f => f.id === id)) favs.push(getProductDataForBtn(btn));
    saveFavs(favs);
  } else {
    saveFavs(favs.filter(f => f.id !== id));
  }

  paintHeart(btn, liked);
  showToast(liked ? "Adicionado aos Favoritos ❤️" : "Removido dos Favoritos");
}

function initLikes() {
  const all = document.querySelectorAll(".btn-fav");
  all.forEach((btn) => {
    paintHeart(btn, isLiked(btn.dataset.likeId || btn.id));
    btn.addEventListener("click", () => toggleLike(btn));
  });
}
initLikes();

/* =========================================================
   Rating (estrelas)
   ========================================================= */
(() => {
  document.querySelectorAll(".rating-inline").forEach((b) => {
    const rating = Math.max(0, Math.min(5, parseFloat(b.dataset.rating || "0")));
    const count  = parseInt(b.dataset.count || "0", 10);
    const stars  = b.querySelector(".rating-stars");
    const num    = b.querySelector(".rating-number");
    const cnt    = b.querySelector(".rating-count");
    if (stars) stars.style.setProperty("--percent", ((rating / 5) * 100).toFixed(1));
    if (num)   num.textContent = rating.toFixed(1).replace(".", ",");
    if (cnt)   cnt.textContent = `(${count})`;
  });
})();

/* =========================================================
  Ícone do carrinho no header
  ========================================================= */
document.getElementById("btnCarrinho")?.addEventListener("click", async () => {
  if (!window.api?.estaLogado()) {
    window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
    return;
  }
  try {
    const itens = await window.api.carrinho.listar();
    const lista = Array.isArray(itens) ? itens : (itens.itens || itens.items || []);
    window.location.href = lista.length
      ? "/altafidelidade/carrinhos/carrinho.html"
      : "/altafidelidade/carrinhovazio/carrinhovazio.html";
  } catch {
    window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
  }
});

/* =========================================================
  FAVORITO — botão #btn-fav da página de produto
  ========================================================= */
let _produtoId = null; // preenchido em carregarProduto()

async function iniciarFavorito(produtoId) {
  const btn = document.getElementById("btn-fav");
  if (!btn) return;

  // Pinta o estado inicial com base no backend (se logado)
  if (window.api?.estaLogado()) {
    try {
      const lista = await window.api.favoritos.listar();
      const jaFav = lista.some(f => String(f.produtoId) === String(produtoId));
      btn.src = jaFav ? IMG_HEART_FILLED : IMG_HEART_OUTLINE;
      btn.dataset.favoritado = jaFav ? "1" : "0";
    } catch {
      btn.src = IMG_HEART_OUTLINE;
      btn.dataset.favoritado = "0";
    }
  }

  btn.addEventListener("click", async () => {
    if (!window.api?.estaLogado()) {
      window.location.href = "/altafidelidade/login/login.html?next=" +
        encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }

    const jaFav = btn.dataset.favoritado === "1";
    // Optimistic update
    btn.src = jaFav ? IMG_HEART_OUTLINE : IMG_HEART_FILLED;
    btn.dataset.favoritado = jaFav ? "0" : "1";

    try {
      if (jaFav) {
        await window.api.favoritos.remover(Number(produtoId));
        showToast("Removido dos favoritos.");
      } else {
        await window.api.favoritos.adicionar(Number(produtoId));
        showToast("Adicionado aos favoritos ❤️");
      }
    } catch (err) {
      // Reverte se falhou
      btn.src = jaFav ? IMG_HEART_FILLED : IMG_HEART_OUTLINE;
      btn.dataset.favoritado = jaFav ? "1" : "0";
      showToast(err.message || "Erro ao atualizar favorito.");
    }
  });
}

/* =========================================================
  CARREGAR PRODUTO DA API
  — preenche título, preço, imagem, estoque, variações,
    rating e descrição a partir do banco de dados.
  ========================================================= */
let _produtoAtual = null;

function formatPriceBR(n) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function carregarProduto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id || !window.api) return;

  _produtoId = id;

  try {
    // 1. Busca o produto no banco de dados via API
    const p = await window.api.produtos.buscar(id);
    _produtoAtual = p;

    // 2. Título
    const titleEl = document.querySelector(".product-title");
    if (titleEl) titleEl.textContent = p.title;

    // 3. Preço atual
    const priceEl = document.querySelector(".price-current");
    if (priceEl) priceEl.textContent = `R$ ${formatPriceBR(p.price)}`;

    // 4. Preço antigo (price_was vem do banco)
    const priceOldEl = document.querySelector(".price-old");
    if (priceOldEl) {
      if (p.price_was) {
        priceOldEl.textContent = `R$ ${formatPriceBR(p.price_was)}`;
        priceOldEl.style.display = "";
      } else {
        priceOldEl.style.display = "none";
      }
    }

    // 5. Imagem principal (resolverImagemProduto vem do api.js)
    const imgEl = document.getElementById("gallery-img");
    if (imgEl) {
      imgEl.src = resolverImagemProduto(p.image);
      imgEl.alt = p.title;
    }

    // 6. Breadcrumb
    const breadcrumb = document.querySelector(".breadcrumbs");
    if (breadcrumb) {
      breadcrumb.innerHTML = `Você está em: <a href="/altafidelidade/home/paginicial.html">produtos</a> › ${p.title}`;
    }

    // 7. ESTOQUE — verifica direto no banco de dados
    //    stock = 0 → desabilita botões e mostra "Indisponível"
    const stockEl  = document.querySelector(".stock");
    const btnAdd   = document.getElementById("btn-add");
    const btnBuy   = document.getElementById("btn-buy");
    const qtyLabel = document.querySelector(".buy-card .select");

    if (p.stock <= 0) {
      if (stockEl)  stockEl.textContent    = "Produto indisponível";
      if (stockEl)  stockEl.style.color    = "#c00";
      if (btnAdd) { btnAdd.disabled = true; btnAdd.textContent = "Indisponível"; }
      if (btnBuy) { btnBuy.disabled = true; btnBuy.textContent = "Indisponível"; }
      if (qtyLabel) qtyLabel.style.opacity = "0.4";
    } else {
      if (stockEl)  stockEl.textContent  = `Em estoque (${p.stock} unidades)`;
      if (stockEl)  stockEl.style.color  = "#2e7d32";
    }

    // 8. Variações (chips)
    const variationsCard = document.querySelector(".card.variations");
    if (variationsCard) {
      const hasVariations = p.variations &&
        Array.isArray(p.variations) &&
        p.variations.length > 0;
      variationsCard.style.display = hasVariations ? "block" : "none";
    }

    // 9. Descrição
    const descEl = document.querySelector(".desc");
    if (descEl && p.description) descEl.textContent = p.description;

    // 10. Rating médio (vem do banco campo rating)
    if (p.rating) {
      document.querySelectorAll(".rating-inline").forEach(b => {
        b.dataset.rating = p.rating;
        const stars = b.querySelector(".rating-stars");
        const num   = b.querySelector(".rating-number");
        if (stars) stars.style.setProperty("--percent", ((p.rating / 5) * 100).toFixed(1));
        if (num)   num.textContent = Number(p.rating).toFixed(1).replace(".", ",");
      });
    }

    // 11. Inicializa o botão de favorito (consulta API para ver se já está favoritado)
    await iniciarFavorito(id);

  } catch (err) {
    console.error("Erro ao carregar produto:", err);
    showToast("Produto não encontrado.");
  }
}

/* =========================================================
  ADICIONAR AO CARRINHO / COMPRAR AGORA
  — verifica estoque no banco antes de adicionar
  ========================================================= */
async function adicionarItem(redirecionarPara) {
  if (!_produtoAtual) {
    showToast("Aguarde o produto carregar.");
    return;
  }

  // Exige login
  if (!window.api?.estaLogado()) {
    window.location.href = "/altafidelidade/login/login.html?next=" +
      encodeURIComponent(window.location.pathname + window.location.search);
    return;
  }

  // Verifica estoque atualizado no banco (nova consulta para garantir dado fresco)
  try {
    const produtoAtualizado = await window.api.produtos.buscar(_produtoAtual.id);
    if (produtoAtualizado.stock <= 0) {
      showToast("Produto sem estoque disponível.");
      const btnAdd = document.getElementById("btn-add");
      const btnBuy = document.getElementById("btn-buy");
      if (btnAdd) { btnAdd.disabled = true; btnAdd.textContent = "Indisponível"; }
      if (btnBuy) { btnBuy.disabled = true; btnBuy.textContent = "Indisponível"; }
      return;
    }
  } catch {
    showToast("Não foi possível verificar o estoque.");
    return;
  }

  const qty   = parseInt(document.getElementById("qty-select")?.value || "1", 10);
  const numId = Number(_produtoAtual.id);

  const btnAdd = document.getElementById("btn-add");
  const btnBuy = document.getElementById("btn-buy");
  if (btnAdd) btnAdd.disabled = true;
  if (btnBuy) btnBuy.disabled = true;

   CARREGAR PRODUTO DA API
   ========================================================= */
let _produtoAtual = null;

function formatPriceBR(n) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function carregarProduto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id || !window.api) return;

  try {
    const p = await window.api.produtos.buscar(id);
    _produtoAtual = p;

    const titleEl = document.querySelector(".product-title");
    if (titleEl) titleEl.textContent = p.title;

    const priceEl = document.querySelector(".price-current");
    if (priceEl) priceEl.textContent = `R$ ${formatPriceBR(p.price)}`;

    const priceOldEl = document.querySelector(".price-old");
    if (priceOldEl) priceOldEl.style.display = "none";

    const imgEl = document.getElementById("gallery-img");
    if (imgEl) {
      const imgUrl = resolverImagemProduto(p.image);
      imgEl.src = imgUrl;
      imgEl.alt = p.title;
    }

    const breadcrumb = document.querySelector(".breadcrumbs");
    if (breadcrumb) breadcrumb.innerHTML = `Você está em: <a href="/altafidelidade/home/paginicial.html">produtos</a> › ${p.title}`;

    const stockEl = document.querySelector(".stock");
    if (stockEl) stockEl.textContent = p.stock > 0 ? "Em estoque" : "Produto indisponível";

    const btnAdd = document.getElementById("btn-add");
    if (btnAdd && p.stock <= 0) {
      btnAdd.disabled = true;
      btnAdd.textContent = "Indisponível";
    }

    const variationsCard = document.querySelector(".card.variations");
    if (variationsCard) {
      if (!p.variations || p.variations === '[]' || p.variations === 'null') {
          variationsCard.style.display = "none";
      } else {
          variationsCard.style.display = "block";
      }
    }
  } catch {
    // mantém o conteúdo estático do HTML se a API não estiver disponível
  }
}

document.addEventListener("DOMContentLoaded", carregarProduto);

/* =========================================================
   ADICIONAR AO CARRINHO E COMPRAR
   ========================================================= */
async function adicionarItem(redirecionarPara) {
  // Produto deve estar carregado da API antes do clique
  if (!_produtoAtual) {
    showToast("Produto não carregado. Recarregue a página.");
    return;
  }

  // Usuário deve estar logado
  if (!window.api?.estaLogado()) {
    window.location.href =
      "/altafidelidade/login/login.html?next=" +
      encodeURIComponent(window.location.pathname);
    return;
  }

  const qty   = parseInt(document.getElementById("qty-select")?.value || "1", 10);
  const numId = Number(_produtoAtual.id);

  if (!numId || isNaN(numId)) {
    showToast("ID de produto inválido.");
    return;
  }

  try {
    await window.api.carrinho.adicionar(numId, qty);
    showToast("Adicionando...");
    setTimeout(() => { location.href = redirecionarPara; }, 600);
  } catch (e) {
    console.error("Erro ao adicionar ao carrinho:", e);
    showToast(e.message || "Não foi possível adicionar ao carrinho.");
    if (btnAdd) btnAdd.disabled = false;
    if (btnBuy) btnBuy.disabled = false;
  }
}

document.getElementById("btn-add")?.addEventListener("click", () =>
  adicionarItem("/altafidelidade/carrinhos/carrinho.html"));
document.getElementById("btn-buy")?.addEventListener("click", () =>
  adicionarItem("/altafidelidade/pagamento1/pagamento.html"));

/* =========================================================
  INICIALIZAÇÃO
  ========================================================= */
document.addEventListener("DOMContentLoaded", carregarProduto);
    console.error("Erro ao adicionar ao carrinho", e);
    showToast("Não foi possível adicionar ao carrinho. Tente novamente.");
  }
}

document.getElementById("btn-add")?.addEventListener("click", () => adicionarItem("/altafidelidade/carrinhos/carrinho.html"));
document.getElementById("btn-buy")?.addEventListener("click", () => adicionarItem("/altafidelidade/pagamento1/pagamento.html"));
