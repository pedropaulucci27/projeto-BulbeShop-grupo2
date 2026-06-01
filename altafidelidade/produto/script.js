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
   Busca — redireciona para home com ?busca=
   ========================================================= */
function wireSearch(form) {
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = form.querySelector('input[type="search"]')?.value?.trim();
    if (q) window.location.href = `/altafidelidade/home/paginicial.html?busca=${encodeURIComponent(q)}`;
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
   Favoritos — via API
   ========================================================= */
function paintHeart(btn, liked) {
  btn.src = liked ? IMG_HEART_FILLED : IMG_HEART_OUTLINE;
}

function initLikes() {
  document.querySelectorAll(".btn-fav").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!window.api?.estaLogado()) {
        window.location.href = "/altafidelidade/login/login.html?next=" +
          encodeURIComponent(window.location.pathname + window.location.search);
        return;
      }
      const produtoId = Number(_produtoAtual?.id);
      if (!produtoId) return;
      const jaLiked = btn.src.includes("Exclude");
      paintHeart(btn, !jaLiked);
      try {
        if (jaLiked) {
          await window.api.favoritos.remover(produtoId);
          showToast("Removido dos Favoritos");
        } else {
          await window.api.favoritos.adicionar(produtoId);
          showToast("Adicionado aos Favoritos");
        }
      } catch {
        paintHeart(btn, jaLiked); // reverte se API falhar
        showToast("Erro ao atualizar favoritos.");
      }
    });
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
   Ícone do carrinho no header — via API
   ========================================================= */
const botaoCarrinho = document.getElementById("btnCarrinho");

if (botaoCarrinho) {
  botaoCarrinho.addEventListener("click", async () => {
    if (!window.api?.estaLogado()) {
      window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
      return;
    }
    try {
      const resp  = await window.api.carrinho.listar();
      const itens = Array.isArray(resp) ? resp : (resp?.itens ?? []);
      window.location.href = itens.length > 0
        ? "/altafidelidade/carrinhos/carrinho.html"
        : "/altafidelidade/carrinhovazio/carrinhovazio.html";
    } catch {
      window.location.href = "/altafidelidade/carrinhovazio/carrinhovazio.html";
    }
  });
}

/* =========================================================
   CARREGAR PRODUTO DA API
   ========================================================= */
let _produtoAtual = null;

const PRODUTO_FALLBACK = {
  "1": { title: "Lâmpada LED 9W",              img: "/altafidelidade/home/img/luz.png",                  price: "149,90" },
  "2": { title: "Liquidificador Mondial 1000W", img: "/altafidelidade/home/img/blender.jpg",              price: "183,00" },
  "3": { title: "Garrafa de Água Tupperware",   img: "/altafidelidade/home/img/tupperware.jpg",           price: "53,00"  },
  "4": { title: "Ventilador de Mesa Britânia",  img: "/altafidelidade/home/img/ventiladorbritania.webp",  price: "279,00" },
  "5": { title: "Energia: Fique por Dentro",    img: "/altafidelidade/home/img/livro.jpg",                price: "49,00"  },
};

function formatPriceBR(n) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function carregarProduto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.querySelector(".product-title").textContent = "Produto não encontrado";
    document.querySelector(".container").innerHTML =
      `<p style="padding:24px;text-align:center;color:#666">
         Nenhum produto foi informado. <a href="/altafidelidade/home/paginicial.html">Voltar para a loja</a>
       </p>`;
    return;
  }

  if (!window.api) return;

  try {
    const p = await window.api.produtos.buscar(id);
    _produtoAtual = p;

    // Atualiza title da aba com nome real do produto
    document.title = `${p.title} • Bulbe`;

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

    // Carrega descrição real da API
    const descEl = document.querySelector(".product-description, .description, [data-description]");
    if (descEl && p.description) descEl.textContent = p.description;

  } catch (err) {
    console.error("Erro ao carregar produto:", err);

    const fallback = PRODUTO_FALLBACK[id];
    if (fallback) {
      document.title = `${fallback.title} • Bulbe`;
      const titleEl = document.querySelector(".product-title");
      if (titleEl) titleEl.textContent = fallback.title;
      const imgEl = document.getElementById("gallery-img");
      if (imgEl) { imgEl.src = fallback.img; imgEl.alt = fallback.title; }
      const priceEl = document.querySelector(".price-current");
      if (priceEl) priceEl.textContent = `R$ ${fallback.price}`;
      const breadcrumb = document.querySelector(".breadcrumbs");
      if (breadcrumb) breadcrumb.innerHTML = `Você está em: <a href="/altafidelidade/home/paginicial.html">produtos</a> › ${fallback.title}`;
    } else {
      const titleEl = document.querySelector(".product-title");
      if (titleEl) titleEl.textContent = "Produto não encontrado";
    }

    showToast("Servidor offline. Exibindo informações básicas do produto.");
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
    console.error("Erro ao adicionar ao carrinho", e);
    showToast("Não foi possível adicionar ao carrinho. Tente novamente.");
  }
}

document.getElementById("btn-add")?.addEventListener("click", () => adicionarItem("/altafidelidade/carrinhos/carrinho.html"));
document.getElementById("btn-buy")?.addEventListener("click", () => adicionarItem("/altafidelidade/pagamento1/pagamento.html"));
