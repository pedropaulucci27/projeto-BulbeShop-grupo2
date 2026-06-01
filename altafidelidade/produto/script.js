/* =========================================================
   Bulbe • Produto — script.js
   ========================================================= */

/* --------- Caminhos de imagens --------- */
const IMG_BASE           = "/altafidelidade/produto/img/";
const IMG_HEART_OUTLINE  = IMG_BASE + "heart-outline.png";
const IMG_HEART_FILLED   = IMG_BASE + "Exclude.png";

/* =========================================================
   Header condensado no scroll
   ========================================================= */
(() => {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const THRESHOLD = 24;
  let ticking = false;
  let active  = false;

  const setCondensed = (on) => {
    if (active === on) return;
    active = on;
    header.classList.toggle("is-condensed", on);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setCondensed(window.scrollY > THRESHOLD);
      ticking = false;
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* =========================================================
   Busca
   ========================================================= */
function wireSearch(form) {
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = form.querySelector('input[type="search"]')?.value?.trim();
    if (q) alert(`Busca por: ${q}`);
  });
}
wireSearch(document.querySelector(".search"));
wireSearch(document.querySelector(".search--condensed"));

/* =========================================================
   Galeria de imagens
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
   Quantidade
   ========================================================= */
(() => {
  const sel = document.getElementById("qty-select");
  const lab = document.getElementById("qty-label");
  if (!sel || !lab) return;

  sel.addEventListener("change", () => (lab.textContent = sel.value));
})();

/* =========================================================
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

function getLikes() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY_LIKES)) || []);
  } catch {
    return new Set();
  }
}
function setLikes(set) {
  localStorage.setItem(LS_KEY_LIKES, JSON.stringify(Array.from(set)));
}
function isLiked(id) {
  return getLikes().has(id);
}
function paintHeart(btn, liked) {
  btn.src = liked ? IMG_HEART_FILLED : IMG_HEART_OUTLINE;
}
function toggleLike(btn) {
  const id = btn.dataset.likeId || btn.id;
  const set = getLikes();
  const liked = !set.has(id);
  if (liked) set.add(id);
  else set.delete(id);

  setLikes(set);
  paintHeart(btn, liked);
  showToast(liked ? "Adicionado aos Curtidos" : "Removido dos Curtidos");
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

    if (stars) {
      stars.style.setProperty("--percent", ((rating / 5) * 100).toFixed(1));
    }
    if (num) num.textContent = rating.toFixed(1).replace(".", ",");
    if (cnt) cnt.textContent = `(${count})`;
  });
})();

/* =========================================================
   Ícone do carrinho no header
   ========================================================= */
const botaoCarrinho = document.getElementById("btnCarrinho");

if (botaoCarrinho) {
  botaoCarrinho.addEventListener("click", () => {
    const carrinho = JSON.parse(localStorage.getItem("bulbe:cart")) || [];

    if (carrinho.length === 0) {
      window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
    } else {
      window.location.href = "/altafidelidade/carrinhos/carrinho.html";
    }
  });
}

/* =========================================================
   ADICIONAR AO CARRINHO — SISTEMA REAL
   ========================================================= */
const PRODUTO_ID = "ventilador-bvt301";

document.getElementById("btn-add")?.addEventListener("click", () => {
  let carrinho = JSON.parse(localStorage.getItem("bulbe:cart")) || [];

  const novo = {
    id: PRODUTO_ID,
    title: "Ventilador Britânia BVT301",
    price: 179.90,
    qty: parseInt(document.getElementById("qty-select").value, 10),
    cor: document.querySelector('[data-variation="color"] .chip.is-active')?.textContent.trim(),
    voltagem: document.querySelector('[data-variation="voltage"] .chip.is-active')?.textContent.trim(),
    img: "./assets/img/image 1.png",
    alt: "Ventilador Britânia BVT301"
  };

  const existente = carrinho.find(p => p.id === PRODUTO_ID);
  if (existente) existente.qty += novo.qty;
  else carrinho.push(novo);

  localStorage.setItem("bulbe:cart", JSON.stringify(carrinho));
  localStorage.setItem("bulbe:lastAddedId", PRODUTO_ID);

  showToast("Produto adicionado ao carrinho!");

  setTimeout(() => {
    location.href = "/altafidelidade/carrinhos/carrinho.html";
  }, 600);
});
async function carregarProduto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");            // pega o ?id= da URL
  if (!id || !window.api) return;

  const p = await window.api.produtos.buscar(id);
  // que faz: GET http://localhost:3000/api/v1/produtos/1

  // Preenche os elementos do HTML com os dados da API:
  document.querySelector(".product-title").textContent = p.title;
  document.querySelector(".price-current").textContent = `R$ ${formatPriceBR(p.price)}`;
  document.getElementById("gallery-img").src = resolverImagemProduto(p.image);
  // etc.
}