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
   DADOS POR PRODUTO
   ========================================================= */
const PRODUTO_FALLBACK = {
  "1": { title: "Lâmpada LED 9W",              img: "/altafidelidade/home/img/luz.png",                  price: "49,90"  },
  "2": { title: "Liquidificador Mondial 1000W", img: "/altafidelidade/home/img/blender.jpg",              price: "183,00" },
  "3": { title: "Garrafa de Água Tupperware",   img: "/altafidelidade/home/img/tupperware.jpg",           price: "53,00"  },
  "4": { title: "Ventilador de Mesa Britânia",  img: "/altafidelidade/home/img/ventiladorbritania.webp",  price: "179,90" },
  "5": { title: "Energia: Fique por Dentro",    img: "/altafidelidade/home/img/livro.jpg",                price: "49,00"  },
};

const DESCRICOES_PRODUTOS = {
  "1": "A Lâmpada LED 9W Bulbe é a solução ideal para iluminar sua casa com economia e durabilidade. Consome até 80% menos energia que lâmpadas incandescentes e tem vida útil superior a 25.000 horas. Disponível em luz branca e amarela, perfeita para ambientes residenciais e comerciais. Bocal E27, não aquece e não pisca.",
  "2": "O Liquidificador Mondial 1000W é potente e versátil para o dia a dia na cozinha. Motor de alta performance processa frutas, legumes e gelo com facilidade. Copo de 2 litros com escala graduada, lâminas de aço inoxidável e 3 velocidades com função turbo. Tampa com trava de segurança e base antiderrapante.",
  "3": "A Garrafa de Água Tupperware é sinônimo de qualidade e praticidade. Fabricada com material atóxico livre de BPA, mantém bebidas frescas por horas. Design ergonômico com tampa antivazamento e capacidade de 1 litro. Leve e resistente, ideal para academia, trabalho e passeios ao ar livre.",
  "4": "Uma opção prática, portátil e econômica para combater o calor. O Ventilador de Mesa Britânia BVT301 possui 3 velocidades, 6 pás de 30 cm e grade de proteção. Silencioso e eficiente, consome pouca energia. Ideal para uso em quartos, escritórios e salas de estar. Disponível nas cores preto, branco e cinza.",
  "5": "O livro 'Energia: Fique por Dentro' é o guia completo sobre eficiência energética e sustentabilidade. Aborda desde conceitos básicos até estratégias avançadas para reduzir o consumo em casa e no trabalho. Linguagem acessível, com dicas práticas e informações sobre fontes renováveis. Leitura essencial para quem quer economizar.",
};

const RATINGS_BASE = {
  "1": { score: 4.8, count: 127 },
  "2": { score: 4.9, count: 203 },
  "3": { score: 4.7, count: 89  },
  "4": { score: 4.7, count: 347 },
  "5": { score: 4.6, count: 54  },
};

const REVIEWS_SEED = {
  "1": [
    { nome: "Carlos M.",   estrelas: 5, variacao: "9W | Luz Branca",  texto: "Lâmpada excelente! Ilumina muito bem e o consumo é mínimo. Já comprei 5 para casa toda e vou comprar mais." },
    { nome: "Priscila A.", estrelas: 4, variacao: "9W | Luz Amarela", texto: "Boa lâmpada, chegou rápido e bem embalada. Poderia ser um pouco mais brilhante, mas no geral satisfaz muito." },
  ],
  "2": [
    { nome: "Fernanda L.", estrelas: 5, variacao: "1000W | 110V", texto: "Incrível! Bateu gelo sem nenhum problema. Super potente, fácil de lavar e com design moderno. Adorei!" },
    { nome: "Rafael S.",   estrelas: 5, variacao: "1000W | 220V", texto: "Comprei para substituir o antigo e não me arrependo. Silencioso, potente e muito fácil de usar no dia a dia." },
  ],
  "3": [
    { nome: "Juliana T.", estrelas: 5, variacao: "1L | Azul",  texto: "Perfeita para academia! Não vaza de jeito nenhum, é leve e bonita. Recomendo muito a todos!" },
    { nome: "Diego R.",   estrelas: 4, variacao: "1L | Verde", texto: "Boa qualidade e material resistente. Uso há 6 meses sem problema algum. Vale cada centavo." },
  ],
  "4": [
    { nome: "Jeferson", estrelas: 5, variacao: "Preto | 220V", texto: "Ele ventila super bem, é bem forte e nesse calor com certeza ajuda muito!" },
    { nome: "Amanda",   estrelas: 5, variacao: "Preto | 220V", texto: "Ótimo produto, barato. Pequeno mas venta bastante e possui um design muito bonito!" },
  ],
  "5": [
    { nome: "Beatriz K.", estrelas: 5, variacao: "Edição 2024", texto: "Conteúdo riquíssimo! Aprendi muito sobre eficiência energética de forma leve e prática. Recomendo a todos." },
    { nome: "Paulo N.",   estrelas: 4, variacao: "Edição 2024", texto: "Excelente referência sobre energia e sustentabilidade. Ideal para quem quer economizar na conta de luz." },
  ],
};

const ALSO_VIEWED = {
  "1": ["4", "2", "3", "5"],
  "2": ["1", "3", "4", "5"],
  "3": ["1", "2", "5", "4"],
  "4": ["1", "2", "3", "5"],
  "5": ["1", "2", "3", "4"],
};

const SHELF_INFO = {
  "1": { title: "Lâmpada LED 9W Bulbe",              img: "/altafidelidade/home/img/luz.png",                  price: "49,90",  priceOld: "79,90"  },
  "2": { title: "Liquidificador Mondial 1000W",       img: "/altafidelidade/home/img/blender.jpg",              price: "183,00", priceOld: "249,90" },
  "3": { title: "Garrafa de Água Tupperware 1L",      img: "/altafidelidade/home/img/tupperware.jpg",           price: "53,00",  priceOld: "89,90"  },
  "4": { title: "Ventilador de Mesa Britânia BVT301", img: "/altafidelidade/home/img/ventiladorbritania.webp",  price: "179,90", priceOld: "219,90" },
  "5": { title: "Energia: Fique por Dentro",          img: "/altafidelidade/home/img/livro.jpg",                price: "49,00",  priceOld: "79,90"  },
};

/* =========================================================
   AVALIAÇÕES POR PRODUTO (localStorage)
   ========================================================= */
function getReviewsStorage(id) {
  try { return JSON.parse(localStorage.getItem(`bulbe:reviews:${id}`)) || []; } catch { return []; }
}

function saveReviewStorage(id, review) {
  const list = getReviewsStorage(id);
  list.unshift(review);
  try { localStorage.setItem(`bulbe:reviews:${id}`, JSON.stringify(list)); } catch {}
}

function starsStr(n) {
  return "★".repeat(Math.max(1, Math.min(5, n)));
}

async function renderizarAvaliacoes(id) {
  let avaliacoesAPI  = [];
  let mediaAPI       = null;
  let totalAPI       = null;

  // Tenta buscar da API
  if (window.api) {
    try {
      const resp = await window.api.avaliacoes.listar(id);
      // resp = { produto: { media }, total, avaliacoes: [...] }
      avaliacoesAPI = (resp.avaliacoes || []).map(a => ({
        nome:     a.autor,
        estrelas: a.nota,
        variacao: "",
        texto:    a.comentario || "",
      }));
      mediaAPI = resp.produto?.media;
      totalAPI = resp.total;
    } catch (e) {
      console.warn("API de avaliações indisponível, usando dados locais.", e);
    }
  }

  // Se a API não retornou nada, usa os seeds locais
  const seed = REVIEWS_SEED[id] || [];
  const user = getReviewsStorage(id); // avaliações salvas localmente (visitantes não logados)

  // Mescla: API tem prioridade, senão usa seed + localStorage
  const all = avaliacoesAPI.length > 0
    ? [...user, ...avaliacoesAPI]   // comentários locais pendentes + API
    : [...user, ...seed];

  // Calcula scores
  const base       = RATINGS_BASE[id] || { score: 5.0, count: 0 };
  const userSum    = user.reduce((s, r) => s + r.estrelas, 0);
  const totalCount = totalAPI !== null
    ? totalAPI + user.length
    : base.count + user.length;
  const scoreNum   = mediaAPI !== null
    ? (user.length ? (mediaAPI * (totalAPI || 1) + userSum) / (totalCount) : mediaAPI)
    : (user.length ? (base.score * base.count + userSum) / (base.count + user.length) : base.score);

  // Atualiza cabeçalho de avaliações
  const scoreEl = document.getElementById("score-big-val");
  if (scoreEl) scoreEl.textContent = scoreNum.toFixed(1);

  const subEl = document.getElementById("ratings-sub-val");
  if (subEl) subEl.innerHTML =
    `<div><strong>${totalCount}</strong> avaliações</div>` +
    `<div><strong>${all.length}</strong> comentários</div>`;

  // Barras de distribuição
  const dist = [0, 0, 0, 0];
  all.forEach(r => { if (r.estrelas >= 2 && r.estrelas <= 5) dist[5 - r.estrelas]++; });
  const maxD = Math.max(...dist, 1);
  document.querySelectorAll(".dist-fill").forEach((fill, i) => {
    fill.style.width = `${Math.round((dist[i] / maxD) * 100)}%`;
  });

  // Atualiza rating-inline do topo da página
  const inlineEl = document.querySelector(".rating-inline");
  if (inlineEl) {
    const numEl   = inlineEl.querySelector(".rating-number");
    const cntEl   = inlineEl.querySelector(".rating-count");
    const starsEl = inlineEl.querySelector(".rating-stars");
    if (numEl) numEl.textContent = scoreNum.toFixed(1).replace(".", ",");
    if (cntEl) cntEl.textContent = `(${totalCount})`;
    if (starsEl) starsEl.style.setProperty("--percent", ((scoreNum / 5) * 100).toFixed(1));
  }

  // Renderiza os blocos de comentário
  const container = document.getElementById("reviews-list");
  if (!container) return;
  container.innerHTML = all.map(r => `
    <article class="review-block">
      <header class="review-header">
        <img class="review-avatar" src="/altafidelidade/produto/img/User-avatar.png" alt="${r.nome}">
        <div class="review-meta">
          <div class="review-name">${r.nome} <span class="review-stars">${starsStr(r.estrelas)}</span></div>
          <div class="review-sub">${r.variacao || ""}</div>
        </div>
      </header>
      <p class="review-text">${r.texto}</p>
    </article>
  `).join("");
}

function wireReviewForm(id) {
  const form = document.getElementById("review-form");
  if (!form) return;

  let selectedStars = 0;
  const starOpts = form.querySelectorAll(".star-opt");

  starOpts.forEach(s => {
    const val = parseInt(s.dataset.val);
    s.addEventListener("mouseover", () =>
      starOpts.forEach(o => o.classList.toggle("active", parseInt(o.dataset.val) <= val)));
    s.addEventListener("mouseout",  () =>
      starOpts.forEach(o => o.classList.toggle("active", parseInt(o.dataset.val) <= selectedStars)));
    s.addEventListener("click", () => {
      selectedStars = val;
      starOpts.forEach(o => o.classList.toggle("active", parseInt(o.dataset.val) <= selectedStars));
    });
  });

  document.getElementById("btn-submit-review")?.addEventListener("click", async () => {
    const nome  = document.getElementById("review-name")?.value?.trim();
    const texto = document.getElementById("review-text")?.value?.trim();
    if (!nome)          { showToast("Informe seu nome.");      return; }
    if (!selectedStars) { showToast("Selecione uma nota.");    return; }
    if (!texto)         { showToast("Escreva um comentário."); return; }

    // Se o usuário está logado, tenta enviar para a API
    if (window.api?.estaLogado()) {
      try {
        await window.api.avaliacoes.enviar(id, selectedStars, texto);
        showToast("Avaliação enviada! Obrigado.");
        document.getElementById("review-name").value  = "";
        document.getElementById("review-text").value  = "";
        selectedStars = 0;
        starOpts.forEach(o => o.classList.remove("active"));
        renderizarAvaliacoes(id); // atualiza a listagem
        return;
      } catch (e) {
        // Se a API recusar (403 = não comprou), salva localmente como fallback
        console.warn("API recusou avaliação, salvando localmente:", e.message);
      }
    }

    // Fallback: salva no localStorage (visitantes ou offline)
    const prod = SHELF_INFO[id];
    saveReviewStorage(id, {
      nome,
      estrelas: selectedStars,
      variacao: prod ? prod.title.split(" ").slice(0, 3).join(" ") : "",
      texto,
    });
    document.getElementById("review-name").value  = "";
    document.getElementById("review-text").value  = "";
    selectedStars = 0;
    starOpts.forEach(o => o.classList.remove("active"));
    showToast("Avaliação enviada! Obrigado.");
    renderizarAvaliacoes(id);
  });
}

/* =========================================================
   PRATELEIRA "QUEM VIU TAMBÉM VIU"
   ========================================================= */
function carregarPrateleira(idAtual) {
  const ids  = ALSO_VIEWED[idAtual] || Object.keys(SHELF_INFO).filter(k => k !== idAtual);
  const grid = document.getElementById("shelf-grid");
  if (!grid) return;

  const likeIds = ["tile-a", "tile-b", "tile-c", "tile-d"];
  grid.innerHTML = ids.slice(0, 4).map((prodId, i) => {
    const p = SHELF_INFO[prodId];
    if (!p) return "";
    return `
      <a class="tile" href="/altafidelidade/produto/produto.html?id=${prodId}">
        <span class="label">Oferta relampago</span>
        <img src="${p.img}" alt="${p.title}">
        <div class="title">${p.title}</div>
        <div class="tile-prices">
          <div class="price">R$${p.price}</div>
          <div class="price-old">R$${p.priceOld}</div>
        </div>
        <div class="tile-actions">
          <img src="/altafidelidade/produto/img/heart-outline.png" alt="Curtir" class="btn-fav"
            data-like-id="${likeIds[i]}" role="button" tabindex="0" aria-pressed="false">
          <svg class="icon-cart" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14h9.45c.75 0 1.4-.41 1.73-1.03l3.24-6.16A1 1 0 0 0 20.7 5H6.21L5.27 3H2v2h2l3.6 7.59-1.35 2.44C5.52 16.37 6.48 18 8 18h12v-2H8l1.16-2z"/>
          </svg>
        </div>
      </a>`;
  }).join("");

  initLikes();
}

/* =========================================================
   CARREGAR PRODUTO DA API
   ========================================================= */
let _produtoAtual = null;

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

  // Descrição, avaliações e prateleira por produto (independente da API)
  const descEl = document.getElementById("product-desc");
  if (descEl && DESCRICOES_PRODUTOS[id]) descEl.textContent = DESCRICOES_PRODUTOS[id];
  renderizarAvaliacoes(id);
  carregarPrateleira(id);
  wireReviewForm(id);

  if (!window.api) return;

  try {
    const p = await window.api.produtos.buscar(id);
    _produtoAtual = p;

    document.title = `${p.title} • Bulbe`;

    const titleEl = document.querySelector(".product-title");
    if (titleEl) titleEl.textContent = p.title;

    const priceEl = document.querySelector(".price-current");
    if (priceEl) priceEl.textContent = `R$ ${formatPriceBR(p.price)}`;

    const priceOldEl = document.querySelector(".price-old");
    if (priceOldEl) priceOldEl.style.display = "none";

    const imgEl = document.getElementById("gallery-img");
    if (imgEl) {
      let imgUrl = resolverImagemProduto(p.image);
      if (imgUrl.includes("ventiladorbritania") && id !== "4" && PRODUTO_FALLBACK[id]) {
        imgUrl = PRODUTO_FALLBACK[id].img;
      }
      imgEl.src = imgUrl;
      imgEl.alt = p.title;
      document.querySelectorAll(".dots .dot").forEach((dot, i) => {
        dot.dataset.src = imgUrl;
        if (i === 0) dot.classList.add("is-active");
        else dot.classList.remove("is-active");
      });
    }

    const breadcrumb = document.querySelector(".breadcrumbs");
    if (breadcrumb) breadcrumb.innerHTML =
      `Você está em: <a href="/altafidelidade/home/paginicial.html">produtos</a> › ${p.title}`;

    const stockEl = document.querySelector(".stock");
    if (stockEl) stockEl.textContent = p.stock > 0 ? "Em estoque" : "Produto indisponível";

    const btnAdd = document.getElementById("btn-add");
    if (btnAdd && p.stock <= 0) { btnAdd.disabled = true; btnAdd.textContent = "Indisponível"; }

    const variationsCard = document.querySelector(".card.variations");
    if (variationsCard) {
      variationsCard.style.display =
        (!p.variations || p.variations === "[]" || p.variations === "null") ? "none" : "block";
    }

    // Descrição da API tem prioridade sobre a local
    if (p.description && descEl) descEl.textContent = p.description;

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
      if (breadcrumb) breadcrumb.innerHTML =
        `Você está em: <a href="/altafidelidade/home/paginicial.html">produtos</a> › ${fallback.title}`;
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
