/* =========================================================
  HOME — FILTRO
  ========================================================= */
const filterBtn  = document.getElementById("filter-btn");
const filterMenu = document.getElementById("filter-menu");

// Mapeia o texto do item do filtro para o valor de categoria da API
const MAP_FILTRO_CATEGORIA = {
  "Eletrônicos":                "eletrônicos",
  "Economia de Energia":        "economia de energia",
  "Casa, Conforto e Bem-Estar": "conforto",
  "Eletrodomésticos":           "eletrônicos",
  "Família e Educação":         "educação",
};

let categoriaAtiva = ""; // controla qual filtro está aplicado

if (filterBtn && filterMenu) {
  // Abre/fecha o menu ao clicar no botão de filtro.
  // Se já há um filtro ativo e o usuário clica no botão, limpa o filtro.
  filterBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // Se há filtro ativo, o clique no botão limpa o filtro
    if (categoriaAtiva) {
      categoriaAtiva = "";
      renderProdutos("");
      filterMenu.style.display = "none";
      return;
    }

    filterMenu.style.display =
      filterMenu.style.display === "block" ? "none" : "block";
  });

  // Fecha o menu ao clicar fora
  document.addEventListener("click", (e) => {
    if (!filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
      filterMenu.style.display = "none";
    }
  });

  // Ao clicar em um item do filtro: filtra os produtos pela categoria
  filterMenu.querySelectorAll("li").forEach((li) => {
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      const categoria = MAP_FILTRO_CATEGORIA[li.textContent.trim()];
      filterMenu.style.display = "none";

      if (!categoria) return;

      // Se clicar na mesma categoria, limpa o filtro (toggle)
      if (categoriaAtiva === categoria) {
        categoriaAtiva = "";
        renderProdutos("");
      } else {
        categoriaAtiva = categoria;
        renderProdutos(categoria);
      }
    });
  });
}

/* =========================================================
  PLACEHOLDER ANIMADO
  ========================================================= */
const searchInput = document.getElementById("search-input");
const text = "Busque por marcas, categorias ou produtos";
let index = 0;

function typeEffect() {
  if (!searchInput) return;
  if (index < text.length) {
    searchInput.placeholder = text.slice(0, index + 1);
    index++;
    setTimeout(typeEffect, 80);
  } else {
    setTimeout(() => {
      index = 0;
      searchInput.placeholder = "";
      typeEffect();
    }, 2000);
  }
}
typeEffect();

/* =========================================================
  SCROLL DRAG NAV
  ========================================================= */
const navScroll = document.querySelector(".nav-scroll");
if (navScroll) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  navScroll.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - navScroll.offsetLeft;
    scrollLeft = navScroll.scrollLeft;
  });
  navScroll.addEventListener("mouseleave", () => (isDown = false));
  navScroll.addEventListener("mouseup", () => (isDown = false));
  navScroll.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - navScroll.offsetLeft;
    navScroll.scrollLeft = scrollLeft - (x - startX) * 2;
  });
}

/* =========================================================
  MODAL "SAIBA MAIS"
  ========================================================= */
const openBtn = document.getElementById("saibaMaisBtn");
const modal = document.getElementById("modalCashback");
const toClose = document.querySelectorAll("[data-close]");
let lastFocused = null;

function openModal() {
  if (!modal) return;
  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  lastFocused?.focus?.();
}
openBtn?.addEventListener("click", openModal);
toClose.forEach((el) => el.addEventListener("click", closeModal));

/* =========================================================
  MENU OCULTO - CATEGORIAS
  ========================================================= */
const btnCategorias = document.getElementById("btn-categorias");
const menuCategorias = document.getElementById("menu-categorias");
const fecharMenu = document.getElementById("fechar-menu");
const overlay = document.getElementById("overlay");

function abrirMenuCategorias() {
  if (!menuCategorias) return;
  menuCategorias.classList.add("aberto");
  overlay?.classList.add("ativo");
}
function fecharMenuCategorias() {
  if (!menuCategorias) return;
  menuCategorias.classList.remove("aberto");
  overlay?.classList.remove("ativo");
}
btnCategorias?.addEventListener("click", (e) => {
  e.preventDefault();
  abrirMenuCategorias();
});
fecharMenu?.addEventListener("click", fecharMenuCategorias);
overlay?.addEventListener("click", fecharMenuCategorias);

/* =========================================================
  CARROSSEL DE BANNERS
  ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".banner-carousel .slide");
  const dots   = document.querySelectorAll(".banner-carousel .dot");
  const prev   = document.querySelector(".banner-carousel .carousel-btn.prev");
  const next   = document.querySelector(".banner-carousel .carousel-btn.next");

  if (!slides.length) return;

  let currentIndex = 0;
  let intervalId = null;

  function showSlide(i) {
    currentIndex = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("active", n === currentIndex));
    dots.forEach((d, n)   => d.classList.toggle("active", n === currentIndex));
  }

  function startAutoPlay() {
    stopAutoPlay();
    intervalId = setInterval(() => showSlide(currentIndex + 1), 5000);
  }
  function stopAutoPlay() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  next?.addEventListener("click", () => { showSlide(currentIndex + 1); startAutoPlay(); });
  prev?.addEventListener("click", () => { showSlide(currentIndex - 1); startAutoPlay(); });
  dots.forEach(dot => dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.slide));
    startAutoPlay();
  }));

  showSlide(0);
  startAutoPlay();
});

/* =========================================================
  CATÁLOGO — SVGs e helpers
  ========================================================= */
const SVG_HEART = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.8 7.4 6.75 5.6 8.56c-1.82 1.82-1.78 4.72.1 6.6l5.83 5.83c.26.26.68.26.94 0l5.83-5.83c1.88-1.88 1.92-4.78.1-6.6-1.8-1.81-4.54-1.76-6.3.08z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
const SVG_HEART_FILLED = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.8 7.4 6.75 5.6 8.56c-1.82 1.82-1.78 4.72.1 6.6l5.83 5.83c.26.26.68.26.94 0l5.83-5.83c1.88-1.88 1.92-4.78.1-6.6-1.8-1.81-4.54-1.76-6.3.08z" fill="currentColor" stroke="currentColor" stroke-width="1.7"/></svg>`;
const SVG_CART  = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3 3h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="17" cy="20" r="1.6" fill="currentColor"/></svg>`;

function formatPriceBR(n) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* =========================================================
  buildCard — gera o HTML de cada card de produto
  ========================================================= */
function buildCard(p) {
  if (p.type === "banner") {
    return `<article class="card card-banner"><img src="${p.img}" alt="${p.alt}"></article>`;
  }

  const stockAttr  = p.stock <= 0 ? 'data-sem-estoque="true"' : '';
  const stockBadge = p.stock <= 0
    ? `<span class="badge badge-indisponivel">Indisponível</span>`
    : (p.badge
        ? `<span class="badge badge-${p.badge === "flash" ? "flash" : "cash"}">${p.badge === "flash" ? "oferta relâmpago" : "com cashback"}</span>`
        : "");

  const priceWas    = p.priceOld
    ? `<div class="price-was">R$${formatPriceBR(p.priceOld)}</div>`
    : "";

  const cartDisabled = p.stock <= 0 ? 'disabled title="Produto indisponível"' : '';

  return `
    <article class="card" data-produto-id="${p.id}" ${stockAttr}>
      <div class="card-body">
        ${stockBadge}
        <div class="media">
          <a href="${p.link}">
            <img src="${p.img}" alt="${p.alt}"
                onerror="this.onerror=null;this.src='/altafidelidade/home/img/ventiladorbritania.webp'">
          </a>
        </div>
        <div class="info">
          <a href="${p.link}"><h3 class="title">${p.title}</h3></a>
          <div class="pricebox">
            <div class="price-now" data-preco="${p.price}">R$${formatPriceBR(p.price)}</div>
            ${priceWas}
          </div>
        </div>
        <div class="actions">
          <button class="icon-btn heart" data-produto-id="${p.id}" aria-label="Favoritar">${SVG_HEART}</button>
          <button class="icon-btn cart"  data-produto-id="${p.id}" aria-label="Adicionar ao carrinho" ${cartDisabled}>${SVG_CART}</button>
        </div>
      </div>
    </article>`;
}

/* =========================================================
  mapearProdutoApi — normaliza objeto da API para buildCard()
  ========================================================= */
function mapearProdutoApi(p) {
  return {
    id:       String(p.id),
    badge:    p.destaque ? "flash" : null,
    img:      resolverImagemProdutoCompleta(p),
    alt:      p.title,
    title:    p.title,
    price:    parseFloat(p.price),
    priceOld: p.price_was ? parseFloat(p.price_was) : null,
    stock:    Number(p.stock ?? 999),
    link:     `/altafidelidade/produto/produto.html?id=${p.id}`,
    categoria: (p.category || "").toLowerCase().trim(),
  };
}

/* =========================================================
  renderProdutos — busca produtos do backend e injeta no DOM
  ========================================================= */
async function renderProdutos(categoriaFiltro = "") {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  grid.innerHTML = `<p style="padding:2rem;text-align:center;color:#888">Carregando produtos...</p>`;

  // Atualiza label do botão de filtro para indicar categoria ativa
  const filterLabel = document.getElementById("filter-btn");
  if (filterLabel) {
    filterLabel.innerHTML = categoriaFiltro
      ? `<img src="./img/filtoicon.png" alt="Filtro"> ${categoriaFiltro} <span style="font-size:.75em;opacity:.7">✕</span>`
      : `<img src="./img/filtoicon.png" alt="Filtro"> filtro`;
  }

  // Carrega banners do produtos.json
  let banners = [];
  try {
    const res = await fetch("./produtos.json");
    const data = await res.json();
    banners = data.filter(p => p.type === "banner");
  } catch {}

  try {
    const params = categoriaFiltro
      ? `?categoria=${encodeURIComponent(categoriaFiltro)}`
      : "";
    const resposta = await window.api.produtos.listar(params);
    const lista = (resposta.data || resposta).map(mapearProdutoApi);

    if (lista.length === 0 && banners.length === 0) {
      grid.innerHTML = `<p style="padding:2rem;text-align:center">Nenhum produto encontrado.</p>`;
      return;
    }

    grid.innerHTML = [...lista, ...banners].map(buildCard).join("");
    sincronizarFavoritosVisuais();

  } catch (err) {
    console.error("Backend offline ou erro ao carregar produtos:", err);
    grid.innerHTML = `<p style="padding:2rem;text-align:center;color:#c00">
      Não foi possível carregar os produtos. Verifique se o servidor está rodando.
    </p>`;
  }
}

/* =========================================================
  BUSCA — filtra os cards já renderizados no DOM
  ========================================================= */
const searchInputEl = document.getElementById("search-input");
const searchBtnEl   = document.querySelector(".search-btn");

function filtrarProdutos() {
  const termo = (searchInputEl?.value || "").trim().toLowerCase();
  document.querySelectorAll(".card[data-produto-id]").forEach((card) => {
    const titulo = card.querySelector(".title")?.textContent.toLowerCase() || "";
    card.style.display = termo === "" || titulo.includes(termo) ? "" : "none";
  });
}

searchBtnEl?.addEventListener("click", filtrarProdutos);
searchInputEl?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") filtrarProdutos();
});

/* =========================================================
  FAVORITOS — sincronia visual e ação via API
  ========================================================= */
let _favoritosIds = new Set();

async function carregarFavoritosUsuario() {
  if (!window.api?.estaLogado()) return;
  try {
    const lista = await window.api.favoritos.listar();
    _favoritosIds = new Set(lista.map(f => String(f.produtoId)));
  } catch {
    _favoritosIds = new Set();
  }
}

function sincronizarFavoritosVisuais() {
  document.querySelectorAll(".icon-btn.heart[data-produto-id]").forEach(btn => {
    const id = btn.dataset.produtoId;
    const ativo = _favoritosIds.has(id);
    btn.classList.toggle("active", ativo);
    btn.innerHTML = ativo ? SVG_HEART_FILLED : SVG_HEART;
  });
}

async function toggleFavorito(btn) {
  if (!window.api?.estaLogado()) {
    window.location.href = "/altafidelidade/login/login.html?next=" +
      encodeURIComponent(window.location.pathname);
    return;
  }

  const produtoId = btn.dataset.produtoId ||
    btn.closest("[data-produto-id]")?.dataset?.produtoId;
  if (!produtoId) return;

  const jaFavoritado = _favoritosIds.has(produtoId);

  btn.disabled = true;
  if (jaFavoritado) {
    _favoritosIds.delete(produtoId);
    btn.classList.remove("active");
    btn.innerHTML = SVG_HEART;
  } else {
    _favoritosIds.add(produtoId);
    btn.classList.add("active");
    btn.innerHTML = SVG_HEART_FILLED;
  }

  try {
    if (jaFavoritado) {
      await window.api.favoritos.remover(Number(produtoId));
    } else {
      await window.api.favoritos.adicionar(Number(produtoId));
    }
  } catch (err) {
    if (jaFavoritado) {
      _favoritosIds.add(produtoId);
      btn.classList.add("active");
      btn.innerHTML = SVG_HEART_FILLED;
    } else {
      _favoritosIds.delete(produtoId);
      btn.classList.remove("active");
      btn.innerHTML = SVG_HEART;
    }
    console.error("Erro ao atualizar favorito:", err);
  } finally {
    btn.disabled = false;
  }
}

/* =========================================================
  CARRINHO — adicionar via API
  ========================================================= */
async function adicionarAoCarrinho(btn) {
  if (!window.api?.estaLogado()) {
    window.location.href = "/altafidelidade/login/login.html?next=" +
      encodeURIComponent(window.location.pathname);
    return;
  }

  const produtoId = btn.dataset.produtoId ||
    btn.closest("[data-produto-id]")?.dataset?.produtoId;
  if (!produtoId) return;

  try {
    const produto = await window.api.produtos.buscar(produtoId);
    if (produto.stock <= 0) {
      mostrarToast("Produto sem estoque disponível.");
      return;
    }
  } catch {
    mostrarToast("Não foi possível verificar o estoque.");
    return;
  }

  btn.disabled = true;
  try {
    await window.api.carrinho.adicionar(Number(produtoId), 1);
    btn.classList.add("active");
    mostrarToast("Produto adicionado ao carrinho!");
    setTimeout(() => {
      btn.classList.remove("active");
      btn.disabled = false;
    }, 1500);
  } catch (err) {
    console.error("Erro ao adicionar ao carrinho:", err);
    mostrarToast(err.message || "Não foi possível adicionar ao carrinho.");
    btn.disabled = false;
  }
}

/* =========================================================
  TOAST — feedback visual leve
  ========================================================= */
function mostrarToast(msg) {
  let toast = document.getElementById("bulbe-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "bulbe-toast";
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#1a1a2e;color:#fff;padding:10px 20px;border-radius:8px;
      font-family:Poppins,sans-serif;font-size:.85rem;z-index:9999;
      opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}

/* =========================================================
  BOTÃO DO CARRINHO NO HEADER
  ========================================================= */
const btnCarrinhoHeader = document.getElementById("btnCarrinho");
if (btnCarrinhoHeader) {
  btnCarrinhoHeader.style.cursor = "pointer";
  btnCarrinhoHeader.addEventListener("click", async () => {
    if (!window.api?.estaLogado()) {
      window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
      return;
    }
    try {
      const itens = await window.api.carrinho.listar();
      const lista = Array.isArray(itens) ? itens : (itens.itens || itens.items || []);
      window.location.href = lista.length > 0
        ? "/altafidelidade/carrinhos/carrinho.html"
        : "/altafidelidade/carrinhovazio/carrinhovazio.html";
    } catch {
      window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
    }
  });
}

/* =========================================================
  EVENT DELEGATION — coração e carrinho (dinâmicos + estáticos)
  ========================================================= */
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".icon-btn");
  if (!btn) return;

  const card = btn.closest(".card, [data-produto-id]");
  if (!card) return;

  if (btn.classList.contains("heart")) {
    event.stopPropagation();
    toggleFavorito(btn);
  } else if (btn.classList.contains("cart") && !btn.disabled) {
    event.stopPropagation();
    adicionarAoCarrinho(btn);
  }
});

/* =========================================================
  INICIALIZAÇÃO
  ========================================================= */
async function init() {
  await renderProdutos();          // ← carrega os produtos ao abrir a página
  await carregarFavoritosUsuario();
  sincronizarFavoritosVisuais();
}

init();
