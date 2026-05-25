/* =========================================================
   HOME — FILTRO
   ========================================================= */
const filterBtn = document.getElementById("filter-btn");
const filterMenu = document.getElementById("filter-menu");

if (filterBtn && filterMenu) {
  filterBtn.addEventListener("click", () => {
    filterMenu.style.display =
      filterMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
      filterMenu.style.display = "none";
    }
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
   BUSCA FUNCIONAL
   ========================================================= */
const searchInputEl = document.getElementById("search-input");
const searchBtnEl = document.querySelector(".search-btn");
const cards = document.querySelectorAll(".card");

function filtrarProdutos() {
  const termo = (searchInputEl?.value || "").trim().toLowerCase();

  cards.forEach((card) => {
    const titulo = card.querySelector(".title")?.textContent.toLowerCase() || "";
    const preco = card.querySelector(".price-now")?.textContent.toLowerCase() || "";
    const texto = `${titulo} ${preco}`;
    card.style.display = termo === "" || texto.includes(termo) ? "block" : "none";
  });
}

searchBtnEl?.addEventListener("click", filtrarProdutos);
searchInputEl?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") filtrarProdutos();
});

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
   CATEGORIAS
   ========================================================= */
document.querySelectorAll(".categoria").forEach((item) => {
  item.addEventListener("click", () => {
    const url = item.dataset.url;
    if (url) window.location.href = url;
  });
});

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
   CATÁLOGO — renderiza cards a partir de produtos.json
   ========================================================= */
const SVG_HEART = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.8 7.4 6.75 5.6 8.56c-1.82 1.82-1.78 4.72.1 6.6l5.83 5.83c.26.26.68.26.94 0l5.83-5.83c1.88-1.88 1.92-4.78.1-6.6-1.8-1.81-4.54-1.76-6.3.08z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
const SVG_CART  = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3 3h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="17" cy="20" r="1.6" fill="currentColor"/></svg>`;

function formatPriceBR(n) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildCard(p) {
  if (p.type === "banner") {
    return `<article class="card card-banner"><img src="${p.img}" alt="${p.alt}"></article>`;
  }

  const badge = p.badge
    ? `<span class="badge badge-${p.badge === "flash" ? "flash" : "cash"}">${p.badge === "flash" ? "oferta relâmpago" : "com cashback"}</span>`
    : "";

  const priceWas = p.priceOld
    ? `<div class="price-was">R$${formatPriceBR(p.priceOld)}</div>`
    : "";

  let promoHTML = "";
  if (p.promo) {
    if (p.promo.type === "pill-green") {
      promoHTML = `<span class="pill pill-green">${p.promo.text}</span>`;
    } else if (p.promo.type === "ship") {
      promoHTML = `<span class="ship-pill"><span>${p.promo.text}</span></span>`;
    }
    if (p.footnote) promoHTML += `<small class="footnote">${p.footnote}</small>`;
    promoHTML = `<div class="promo-row">${promoHTML}</div>`;
  }

  return `
    <article class="card">
      <div class="card-body">
        ${badge}
        <div class="media">
          <a href="${p.link}"><img src="${p.img}" alt="${p.alt}" onerror="this.onerror=null;this.src='/altafidelidade/home/img/ventiladorbritania.webp'"></a>
        </div>
        <div class="info">
          <a href="${p.link}"><h3 class="title">${p.title}</h3></a>
          <div class="pricebox">
            <div class="price-now" data-preco="${p.price}">R$${formatPriceBR(p.price)}</div>
            ${priceWas}
          </div>
          ${promoHTML}
        </div>
        <div class="actions">
          <button class="icon-btn heart" aria-label="Favoritar">${SVG_HEART}</button>
          <button class="icon-btn cart" aria-label="Adicionar ao carrinho">${SVG_CART}</button>
        </div>
      </div>
    </article>`;
}

function mapearProdutoApi(p) {
  return {
    id:       String(p.id),
    type:     "product",
    badge:    p.destaque ? "flash" : null,
    img:      resolverImagemProduto(p.image),
    alt:      p.title,
    title:    p.title,
    price:    parseFloat(p.price),
    priceOld: null,
    promo:    null,
    footnote: null,
    link:     `/altafidelidade/produto/produto.html?id=${p.id}`,
  };
}

async function renderProdutos() {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  try {
    const resposta = await window.api.produtos.listar();
    const lista = (resposta.data || resposta).map(mapearProdutoApi);
    grid.innerHTML = lista.map(buildCard).join("");
  } catch {
    try {
      const res  = await fetch("./produtos.json");
      const data = await res.json();
      grid.innerHTML = data.map(buildCard).join("");
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  }
}

renderProdutos();

/* =========================================================
   ÍCONES (favoritos + adicionar ao carrinho)
   — usa event delegation para funcionar com cards dinâmicos
   ========================================================= */

document.addEventListener("click", (event) => {
  const btn = event.target.closest(".icon-btn");
  if (!btn) return;

    // === FAVORITAR ===
    if (btn.classList.contains("heart")) {
      btn.classList.toggle("active");
      const card = btn.closest(".card, [data-produto], .produto") || null;
      if (!card) return;

      const imgEl   = card.querySelector("img");
      const titleEl = card.querySelector(".title, h3, h2");
      const priceEl = card.querySelector(".price-now, .price, [data-preco]");

      const parsePrecoBR = (txt) => {
        if (!txt) return 0;
        return parseFloat(txt.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."));
      };

      const title = titleEl?.textContent.trim() || "Produto";
      const price = priceEl?.dataset?.preco
        ? `R$ ${parseFloat(priceEl.dataset.preco).toFixed(2).replace('.', ',')}`
        : (priceEl?.textContent.trim() || '');
      const img = imgEl?.src || "";
      const id  = `home-${title.toLowerCase().slice(0, 40).replace(/\s+/g, '-')}`;

      let favs = [];
      try { favs = JSON.parse(localStorage.getItem("bulbe:favorites")) || []; } catch {}

      const jaFavoritado = favs.find(f => f.id === id);
      if (jaFavoritado) {
        favs = favs.filter(f => f.id !== id);
        btn.classList.remove("active");
      } else {
        favs.push({ id, title, price, priceOld: '', img });
        btn.classList.add("active");
      }
      try { localStorage.setItem("bulbe:favorites", JSON.stringify(favs)); } catch {}
      return;
    }

    // === ADICIONAR AO CARRINHO ===
    if (btn.classList.contains("cart")) {
      const card =
        btn.closest(".card, [data-produto], .produto") || null;

      if (!card) return;

      const imgEl = card.querySelector("img");
      const titleEl = card.querySelector(".title, h3, h2");
      const priceEl = card.querySelector(".price-now, [data-preco]");

      const parsePrecoBR = (txt) => {
        if (!txt) return 0;
        return parseFloat(txt.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."));
      };

      const title = titleEl?.textContent.trim() || "Produto";
      const price = priceEl?.dataset?.preco
        ? parseFloat(priceEl.dataset.preco)
        : parsePrecoBR(priceEl?.textContent || "0");
      const img = imgEl?.src || "";
      const alt = imgEl?.alt || title;

      const id = `${title.toLowerCase()}|${price.toFixed(2)}`;

      let carrinho = JSON.parse(localStorage.getItem("bulbe:cart")) || [];

      const existente = carrinho.find((p) => p.id === id);
      if (existente) existente.qty++;
      else carrinho.push({ id, title, price, img, alt, qty: 1 });

      localStorage.setItem("bulbe:cart", JSON.stringify(carrinho));
      localStorage.setItem("bulbe:lastAddedId", id);

      // Feedback visual breve — sem redirecionar
      btn.classList.add("active");
      setTimeout(() => btn.classList.remove("active"), 1000);
    }

  event.stopPropagation();
});

/* =========================================================
   BOTÃO DO CARRINHO NO HEADER
   ========================================================= */
const btnCarrinhoHeader = document.getElementById("btnCarrinho");

if (btnCarrinhoHeader) {
  btnCarrinhoHeader.addEventListener("click", () => {
    const carrinho = JSON.parse(localStorage.getItem("bulbe:cart")) || [];

    if (carrinho.length === 0) {
      window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
    } else {
      window.location.href = "/altafidelidade/carrinhos/carrinho.html";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // === CARROSSEL DE IMAGENS === //
  const slides = document.querySelectorAll(".banner-carousel .slide");
  const dots = document.querySelectorAll(".banner-carousel .dot");
  const prev = document.querySelector(".banner-carousel .carousel-btn.prev");
  const next = document.querySelector(".banner-carousel .carousel-btn.next");

  if (!slides.length) return; // se não achar slides, não faz nada

  let index = 0;
  let intervalId = null;

  function showSlide(i) {
    index = i;

    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides.forEach((s, n) => {
      s.classList.toggle("active", n === index);
    });

    dots.forEach((d, n) => {
      d.classList.toggle("active", n === index);
    });
  }

  function nextSlide() {
    showSlide(index + 1);
  }

  function prevSlideFunc() {
    showSlide(index - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    intervalId = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  if (next) {
    next.addEventListener("click", () => {
      nextSlide();
      startAutoPlay(); // reinicia o timer
    });
  }

  if (prev) {
    prev.addEventListener("click", () => {
      prevSlideFunc();
      startAutoPlay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const slideIndex = Number(dot.dataset.slide);
      showSlide(slideIndex);
      startAutoPlay();
    });
  });

  // inicia no primeiro slide
  showSlide(0);
  startAutoPlay();
});

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
  e.preventDefault(); // evita scroll pro topo por causa do href="#"
  abrirMenuCategorias();
});

fecharMenu?.addEventListener("click", fecharMenuCategorias);
overlay?.addEventListener("click", fecharMenuCategorias);