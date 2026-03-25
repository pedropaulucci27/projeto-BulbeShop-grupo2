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
   ÍCONES (favoritos + adicionar ao carrinho)
   ========================================================= */

document.querySelectorAll(".icon-btn").forEach((btn) => {
  btn.addEventListener("click", (event) => {

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