/* ======================================================
   CARRINHO (BulbeShop) — script.js
   Atualizações:
   - Tooltip moderno “Selecionado” (hover/focus) no botão Selecionar
   - “Selecionar tudo” opera APENAS sobre itens VISÍVEIS (e estado indeterminate correto)
   - Corrige bug: parafusadeira NÃO é adicionada junto via bulbe:addToCart
   - Mantém: carrinho vazio por padrão, toggle Selecionar/Selecionado, +/−,
             remoção ao ir para 0, limpar carrinho, persistência, compat com addToCart,
             resumo só dos selecionados e acessibilidade do botão
   - Sem criar/editar HTML/CSS externos: todo o CSS extra é injetado por JS
   ====================================================== */

/* ==== BOTÃO VOLTAR ==== */
document.getElementById("botaoVoltar")?.addEventListener("click", () => history.back());

/* ==== FORMATADORES ==== */
const formatoBR = (n) => (Number(n) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moedaBR = (n) => `R$${formatoBR(n)}`;

/* ==== ESTADO (títulos/preços base; quantidades serão ajustadas na inicialização) ==== */
const produtos = {
  lampada: { titulo: "Lâmpada de LED E27 Bulbo 9W 803lm Luz Branca Bivolt Black + Decker", preco: 4.59, quantidade: 5 },
  parafusadeira: { titulo: "Parafusadeira Philco Force PPF120 3 em 1 1500RPM", preco: 199.9, quantidade: 1 },
};

/* ==== SELEÇÃO (entram no RESUMO) ==== */
const selecionados = { lampada: false, parafusadeira: false };

/* ==== PERSISTÊNCIA ==== */
function loadCart() { try { return JSON.parse(localStorage.getItem("bulbe:cart")) || []; } catch { return []; } }
function saveCart(arr) { try { localStorage.setItem("bulbe:cart", JSON.stringify(arr)); } catch { } }
function getLastId() { try { return localStorage.getItem("bulbe:lastAddedId") || ""; } catch { return ""; } }
function setLastId(id) { try { localStorage.setItem("bulbe:lastAddedId", id || ""); } catch { } }
function resolverImgParaCarrinho(p) { if (!p) return "./assets/img/lamp.svg"; if (p.startsWith("./img/")) return "../home/" + p.slice(2); return p; }

/* ======================================================
   CSS DO BOTÃO “SELECIONAR/SELECIONADO” + TOOLTIP (injetado)
   ====================================================== */
function injectSelecionarStyles() {
  let style = document.getElementById("bulbeSelecionarStyles");
  const base = `
  .btn-selecao{
    cursor:pointer; user-select:none; pointer-events:auto;
    display:inline-flex; align-items:center; gap:.4rem;
    padding:.35rem .75rem; border-radius:9999px;
    border:1px solid rgba(8,6,141,.28); background:#fff;
    font-weight:600; line-height:1; font-size:.95rem;
    transition: box-shadow .15s ease, transform .05s ease, background .2s ease, border-color .2s ease, color .2s ease;
    position: relative; /* necessário pro tooltip */
  }
  .btn-selecao:hover{ box-shadow:0 2px 6px rgba(0,0,0,.08); background:#f7f8ff; border-color:#c9cdea; }
  .btn-selecao:active{ transform:translateY(1px); }
  .btn-selecao:focus-visible{ outline:2px solid #08068D; outline-offset:2px; }
  .cartao-produto.is-selecionado .btn-selecao{
    background:#08068D; border-color:#08068D; color:#fff;
  }
  .cartao-produto.is-selecionado .btn-selecao::before,
  .cartao-produto.is-selecionado .btn-selecao::after{ pointer-events:none; }

  /* Estado base do tooltip (invisível) para itens selecionados */
  .cartao-produto.is-selecionado .btn-selecao::after{
    content:"Selecionado";
    position:absolute; left:50%; bottom:calc(100% + 10px);
    transform: translateX(-50%) translateY(6px);
    opacity:0; white-space:nowrap; max-width:220px; text-overflow:ellipsis; overflow:hidden;
    padding:.4rem .6rem; border-radius:10px;
    color:#111; background:rgba(255,255,255,.7);
    border:1px solid rgba(8,6,141,.15);
    box-shadow:0 8px 20px rgba(0,0,0,.15);
    backdrop-filter: blur(6px);
    z-index:60;
    transition: opacity .18s ease, transform .18s ease;
  }
  .cartao-produto.is-selecionado .btn-selecao::before{
    content:"";
    position:absolute; left:50%; bottom:100%;
    transform: translateX(-50%) translateY(4px);
    opacity:0; z-index:59;
    border-width:6px; border-style:solid;
    border-color: transparent transparent rgba(255,255,255,.7) transparent;
    filter: drop-shadow(0 -1px 0 rgba(8,6,141,.15));
    transition: opacity .18s ease, transform .18s ease;
  }
  /* Exibe tooltip no hover/focus */
  .cartao-produto.is-selecionado .btn-selecao:hover::after,
  .cartao-produto.is-selecionado .btn-selecao:focus-visible::after{
    opacity:1; transform: translateX(-50%) translateY(0);
  }
  .cartao-produto.is-selecionado .btn-selecao:hover::before,
  .cartao-produto.is-selecionado .btn-selecao:focus-visible::before{
    opacity:1; transform: translateX(-50%) translateY(0);
  }
  `;
  if (!style) {
    style = document.createElement("style");
    style.id = "bulbeSelecionarStyles";
    document.head.appendChild(style);
    style.textContent = base;
  } else if (!style.textContent.includes(".btn-selecao")) {
    style.textContent += base;
  }
}

/* ======================================================
   UPGRADE DOS GATILHOS “Selecionar/Selecionado” → BOTÃO
   ====================================================== */
function enhanceSelecionarUI() {
  const known = document.querySelectorAll(
    '[data-action="selecionar"], .selecionar, .texto-selecionar, .btn-selecionar'
  );
  const fallbacks = Array.from(document.querySelectorAll('article.cartao-produto *')).filter(el => {
    if (!(el instanceof HTMLElement)) return false;
    if (el.matches('input,button,select,textarea,[role="button"],a')) return false;
    const t = (el.textContent || "").trim().toLowerCase();
    return t === "selecionar" || t === "selecionado";
  });
  const triggers = new Set([...known, ...fallbacks]);
  triggers.forEach((el) => {
    el.classList.add("btn-selecao");
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    const card = el.closest(".cartao-produto");
    const selected = !!card?.classList.contains("is-selecionado");
    el.setAttribute("aria-pressed", selected ? "true" : "false");
    el.setAttribute("aria-label", selected ? "Selecionado" : "Selecionar produto");
    try { el.textContent = selected ? "Selecionado" : "Selecionar"; } catch { }
  });
}

function updateTriggerLabel(card, selected) {
  card.querySelectorAll('[data-action="selecionar"], .selecionar, .texto-selecionar, .btn-selecionar, .btn-selecao')
    .forEach(el => { try { el.textContent = selected ? "Selecionado" : "Selecionar"; } catch { } });
}

function updateTriggerA11y(card, selected) {
  card.querySelectorAll('[data-action="selecionar"], .selecionar, .texto-selecionar, .btn-selecionar, .btn-selecao')
    .forEach(el => {
      el.setAttribute("aria-pressed", selected ? "true" : "false");
      el.setAttribute("aria-label", selected ? "Selecionado" : "Selecionar produto");
    });
  updateTriggerLabel(card, selected);
}

/* ======================================================
   HELPERS DE VISIBILIDADE (para “Selecionar tudo” e contagens)
   ====================================================== */
function isVisibleCard(card) {
  if (!card) return false;
  const cs = getComputedStyle(card);
  return card.offsetParent !== null && cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
}
function getVisibleCards() { return Array.from(document.querySelectorAll('article.cartao-produto')).filter(isVisibleCard); }
function getVisibleCheckboxes() { return getVisibleCards().map(c => c.querySelector('.selecao-individual')).filter(Boolean); }

/* ======================================================
   BLOCO DE ITENS NA BARRA DE RESUMO — mostrar/ocultar
   ====================================================== */
function getResumoItensNodes() {
  return document.querySelectorAll(
    "#resumoCarrinho .lista-resumo, #resumoCarrinho .itens-resumo, #resumoCarrinho .items, #resumoCarrinho .item-resumo"
  );
}
function mostrarItensResumo(mostrar) {
  getResumoItensNodes().forEach((n) => { n.style.display = mostrar ? "" : "none"; });
}

/* ======================================================
   “Selecionar tudo” — estado baseado SOMENTE em itens VISÍVEIS
   ====================================================== */
function atualizarSelecionarTudoEstado() {
  const selecionarTudo = document.getElementById("selecionarTudo");
  if (!selecionarTudo) return;
  const cbs = getVisibleCheckboxes();
  if (cbs.length === 0) {
    selecionarTudo.checked = false;
    selecionarTudo.indeterminate = false;
    return;
  }
  const all = cbs.every((x) => x.checked);
  const any = cbs.some((x) => x.checked);
  selecionarTudo.checked = all;
  selecionarTudo.indeterminate = !all && any;
}

/* ======================================================
   CONTADORES (+/−) — com remoção ao tentar ir para 0
   ====================================================== */
function ativarContadores() {
  document.querySelectorAll(".contador").forEach((contador) => {
    const produtoPai = contador.closest(".cartao-produto");
    const chaveBase = produtoPai?.dataset.produto || null;

    contador.addEventListener("click", (evento) => {
      const botao = evento.target.closest(".botao-quantidade");
      if (!botao) return;

      const acao = botao.dataset.acao; // "aumentar" | "diminuir"
      const chave = contador.dataset.produto === "resumo" ? "lampada" : chaveBase;
      if (!chave || !produtos[chave]) return;

      const span = contador.querySelector("[data-quantidade]") || contador.querySelector(".quantidade-atual");
      let n = parseInt(span?.textContent || "1", 10) || 1;

     // Remoção quando iria a 0
if (acao === "diminuir" && n === 1) {
  removerItemDoCarrinho(chave, produtoPai);
  return;
}


      if (acao === "aumentar") n++;
      if (acao === "diminuir") n = Math.max(1, n - 1);

      span.textContent = String(n);
      produtos[chave].quantidade = n;

      const textoUnidades = produtoPai?.querySelector(".texto-unidades");
      if (textoUnidades) textoUnidades.textContent = `(${n} unidade${n > 1 ? "s" : ""})`;

      if (chave === "lampada") syncLampadaToStorageFromUI();

      atualizarResumo();
      atualizarResumoSelecionados();
    });
  });
}

/* ======================================================
   REMOÇÃO DE ITEM DO CARRINHO
   ====================================================== */
function removerItemDoCarrinho(chave, card) {
  // 1) Estado interno
  if (produtos[chave]) produtos[chave].quantidade = 0;

  // 2) Seleção: desmarcar e limpar classes/ARIA/label
  const cb = card?.querySelector(".selecao-individual");
  if (cb) cb.checked = false;
  selecionados[chave] = false;
  card?.classList.remove("is-selecionado");
  updateTriggerA11y(card, false);

  // 3) Persistência: remover do bulbe:cart (se existir)
  // Usa data-cart-id (cards extras) ou reconstrói idGuess (cards hardcoded)
  let cartItemId = card?.dataset?.cartId || null;
  if (!cartItemId) {
    let title   = (card?.querySelector(".titulo-produto, .title, h3, h2")?.textContent || "").trim();
    let priceEl = card?.querySelector(".valor-produto, .price, [data-preco]");
    let unit    = 0;
    if (priceEl?.dataset?.preco) {
      unit = Number(priceEl.dataset.preco);
    } else {
      unit = Number(
        (priceEl?.textContent || "0")
          .replace(/[^\d,.-]/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
      );
    }
    cartItemId = `${String(title).toLowerCase().replace(/\s+/g, " ").slice(0, 200)}|${Number(unit || 0).toFixed(2)}`;
  }

  const cartArr = loadCart();
  const idx     = cartArr.findIndex((it) => it.id === cartItemId);

  if (idx >= 0) {
    cartArr.splice(idx, 1);
    saveCart(cartArr);
  }

  const last = getLastId();
  if (last && last === cartItemId) {
    setLastId("");
  }

  // 4) Remover o card do DOM
  if (card && typeof card.remove === "function") {
    card.remove();
  } else if (card && card.style) {
    card.style.display = "none";
  }

  // 5) Verificar se ainda existe ALGUM PRODUTO DE CARRINHO
  //    (ignora os cards do carrossel de recomendados)
  const aindaTemCardsCarrinho =
    document.querySelectorAll('article.cartao-produto[data-produto]').length > 0;

  const carrinhoAtual = loadCart();
  const aindaTemNoStorage =
    Array.isArray(carrinhoAtual) && carrinhoAtual.length > 0;

  // Se não sobrou NENHUM produto → carrinho vazio
  if (!aindaTemCardsCarrinho || !aindaTemNoStorage) {
    try { localStorage.removeItem("bulbe:cart"); } catch {}
    try { localStorage.removeItem("bulbe:lastAddedId"); } catch {}

    window.location.href = "../carrinhovazio/carrinhovazio.html";
    return; // não precisa atualizar mais nada
  }

  // 6) Se ainda tiver produto, só atualiza estados
  atualizarSelecionarTudoEstado();
  atualizarResumo();
  atualizarResumoSelecionados();
}




/* ======================================================
   TOTAL GERAL (fora da barra dos selecionados)
   ====================================================== */
function atualizarResumo() {
  const qtdLamp = produtos.lampada.quantidade;
  const valorLamp = produtos.lampada.preco * qtdLamp;
  document.querySelectorAll("#quantidadeResumoLampada").forEach((el) => (el.textContent = String(qtdLamp)));
  document.querySelectorAll("#precoResumoLampada").forEach((el) => (el.textContent = moedaBR(valorLamp)));

  const qtdParaf = produtos.parafusadeira.quantidade;
  const valorParaf = produtos.parafusadeira.preco * qtdParaf;
  document.querySelectorAll("#quantidadeResumoParafusadeira").forEach((el) => (el.textContent = String(qtdParaf)));
  document.querySelectorAll("#precoResumoParafusadeira").forEach((el) => (el.textContent = moedaBR(valorParaf)));
}

/* ======================================================
   RESUMO (BARRA INFERIOR) — APENAS SELECIONADOS
   ====================================================== */
function atualizarResumoSelecionados() {
  const resumo = document.getElementById("resumoCarrinho");
  if (!resumo) return;

  const tituloResumo = document.getElementById("tituloResumo");
  const imagemResumo = resumo.querySelector(".item-resumo img");
  const totalEl = document.getElementById("totalResumo");

  // Só exibe o resumo se houver pelo menos 1 produto selecionado
  const algumSelecionado = Object.values(selecionados).some(Boolean);
  if (!algumSelecionado) {
    resumo.style.display = "none";
    return;
  }

  resumo.style.display = "block";

  // Calcula total e captura primeiro item selecionado para exibição
  let total = 0;
  let firstItem = null;

  getVisibleCards().forEach(card => {
    const chave = card.dataset.produto;
    if (!chave || !selecionados[chave]) return;

    const priceEl = card.querySelector('.valor-produto, [data-preco]');
    const qtyEl   = card.querySelector('[data-quantidade], .quantidade-atual');

    const price = priceEl?.dataset?.preco
      ? Number(priceEl.dataset.preco)
      : (produtos[chave]?.preco || 0);
    const qty = parseInt(qtyEl?.textContent || '1', 10) || 1;

    total += price * qty;

    if (!firstItem) {
      const titleEl = card.querySelector('.titulo-produto, h3');
      const imgEl   = card.querySelector('.imagem-produto img, img');
      firstItem = {
        title: (titleEl?.textContent || '').trim().replace(/\s+/g, ' '),
        img:   imgEl?.src || ''
      };
    }
  });

  if (firstItem) {
    if (tituloResumo) tituloResumo.textContent = firstItem.title;
    if (imagemResumo) { imagemResumo.src = firstItem.img; imagemResumo.alt = firstItem.title; }
  }

  if (totalEl) totalEl.textContent = moedaBR(total);
  mostrarItensResumo(true);
}


/* ======================================================
   SALVAR ITENS SELECIONADOS PARA O CHECKOUT
   ====================================================== */
function saveSelectedForCheckout() {
  const items = [];
  getVisibleCards().forEach(card => {
    const chave = card.dataset.produto;
    if (!chave || !selecionados[chave]) return;
    const titleEl = card.querySelector('.titulo-produto, .title, h3, h2');
    const priceEl = card.querySelector('.valor-produto, .price, [data-preco]');
    const qtyEl   = card.querySelector('[data-quantidade], .qtd, .quantidade');
    const imgEl   = card.querySelector('.imagem-produto img, .img img, img');
    const title = (titleEl?.textContent || '').trim().replace(/\s+/g, ' ');
    const price = priceEl?.dataset?.preco
      ? Number(priceEl.dataset.preco)
      : Number((priceEl?.textContent || '0').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    const qty = Math.max(1, parseInt(qtyEl?.textContent || '1', 10) || 1);
    const img = imgEl?.getAttribute('src') || '';
    const alt = imgEl?.getAttribute('alt') || title;
    items.push({ title, price, qty, img, alt });
  });
  try { localStorage.setItem('bulbe:checkoutItems', JSON.stringify(items)); } catch {}
}

/* ======================================================
   CARROSSEL E CONTINUAR (fade+redirect)
   ====================================================== */
const trilha = document.getElementById("trilhaCarrossel");
document.querySelector(".seta-carrossel.esquerda")?.addEventListener("click", () => {
  trilha?.scrollBy({ left: -trilha.clientWidth * 0.9, behavior: "smooth" });
});
document.querySelector(".seta-carrossel.direita")?.addEventListener("click", () => {
  trilha?.scrollBy({ left: +trilha.clientWidth * 0.9, behavior: "smooth" });
});

document.addEventListener("DOMContentLoaded", function () {
  const botaoContinuar = document.getElementById("botaoContinuar");
  const resumoCarrinho = document.getElementById("resumoCarrinho");
  if (botaoContinuar && resumoCarrinho) {
    botaoContinuar.addEventListener("click", function () {
      const algumSelecionado = Object.values(selecionados).some(Boolean);
      if (!algumSelecionado) {
        alert("Selecione pelo menos um produto para continuar.");
        return;
      }
      saveSelectedForCheckout();
      resumoCarrinho.classList.add("fade-out");
      setTimeout(() => (window.location.href = "../pagamento1/pagamento.html"), 400);
    });
  }
});

/* ======================================================
   IMPORTAÇÃO E PERSISTÊNCIA (lâmpada como template)
   ====================================================== */
function aplicarLampadaDoCarrinho() {
  const cart = loadCart();
  const lastId = getLastId();
  const item = (lastId && cart.find((it) => it.id === lastId)) || cart[0];
  if (!item) return false;

  const lamp = document.querySelector('article.cartao-produto[data-produto="lampada"]');
  if (!lamp) return false;

  // Garante que o card apareça se estava oculto pelo "carrinho vazio"
  lamp.style.display = "";

  const imgEl = lamp.querySelector(".imagem-produto img, .img img, picture img, img");
  const titleEl = lamp.querySelector(".titulo-produto, .title, h3, h2");
  const priceEl = lamp.querySelector(".valor-produto, .price, [data-preco]");
  const qtdEl = lamp.querySelector("[data-quantidade], .qtd, .quantidade");
  const unidadesEl = lamp.querySelector(".texto-unidades, .units, .info-qtd");

  if (imgEl) { imgEl.src = resolverImgParaCarrinho(item.img); imgEl.alt = item.alt || item.title || "Produto"; }
  if (titleEl) { titleEl.innerHTML = (item.title || "Produto").replace(/\s{2,}/g, " "); }
  if (priceEl) {
    const unit = Number(item.price || 0);
    if (priceEl instanceof HTMLElement) priceEl.dataset.preco = String(unit.toFixed(2));
    priceEl.textContent = moedaBR(unit);
  }
  const q = Number(item.qty || 1);
  if (qtdEl) qtdEl.textContent = String(q);
  if (unidadesEl) unidadesEl.textContent = `(${q} unidade${q > 1 ? "s" : ""})`;

  if (produtos.lampada) {
    produtos.lampada.titulo = item.title || produtos.lampada.titulo;
    produtos.lampada.preco = Number(item.price || produtos.lampada.preco);
    produtos.lampada.quantidade = q;
  }

  setLastId(item.id || "");
  return true;
}

function syncLampadaToStorageFromUI() {
  const card = document.querySelector('article.cartao-produto[data-produto="lampada"]');
  if (!card) return;

  const title = (card.querySelector(".titulo-produto, .title, h3, h2")?.textContent || "").trim();
  const priceEl = card.querySelector(".valor-produto, .price, [data-preco]");
  const qtyEl = card.querySelector("[data-quantidade], .qtd, .quantidade");

  const unit = priceEl?.dataset?.preco
    ? Number(priceEl.dataset.preco)
    : Number((priceEl?.textContent || "0").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  const qty = Math.max(1, parseInt(qtyEl?.textContent || "1", 10) || 1);

  const id = `${String(title).toLowerCase().replace(/\s+/g, " ").slice(0, 200)}|${Number(unit || 0).toFixed(2)}`;

  const cart = loadCart();
  const ix = cart.findIndex((it) => it.id === id);

  const imgEl = card.querySelector(".imagem-produto img, .img img, picture img, img");
  const img = imgEl?.getAttribute("src") || "";
  const alt = imgEl?.getAttribute("alt") || title;

  if (ix >= 0) {
    cart[ix].qty = qty;
  } else {
    cart.push({ id, title, price: Number(unit || 0), img, alt, qty });
  }
  saveCart(cart);
  setLastId(id);
}

/* ======================================================
   CARRINHO VAZIO POR PADRÃO (se não houver storage nem payload)
   ====================================================== */
function inicializarCarrinhoVazioSeNecessario() {
  const cart = loadCart();
  const hasCart = Array.isArray(cart) && cart.length > 0;
  const hasPayload = !!localStorage.getItem("bulbe:addToCart");

  if (hasCart || hasPayload) return; // há itens → não esconder

  // Zera quantidades internas e oculta cards padrão
  const cLamp = document.querySelector('article.cartao-produto[data-produto="lampada"]');
  const cPar = document.querySelector('article.cartao-produto[data-produto="parafusadeira"]');

  produtos.lampada.quantidade = 0;
  produtos.parafusadeira.quantidade = 0;

  if (cLamp) { cLamp.style.display = "none"; cLamp.classList.remove("is-selecionado"); const cb = cLamp.querySelector(".selecao-individual"); if (cb) cb.checked = false; updateTriggerA11y(cLamp, false); }
  if (cPar) { cPar.style.display = "none"; cPar.classList.remove("is-selecionado"); const cb = cPar.querySelector(".selecao-individual"); if (cb) cb.checked = false; updateTriggerA11y(cPar, false); }

  selecionados.lampada = false;
  selecionados.parafusadeira = false;

  atualizarResumo();
  atualizarResumoSelecionados();
}

/* ======================================================
   GARANTE que PARAFUSADEIRA não aparece indevidamente
   ====================================================== */
function ensureParafusadeiraNaoAutoCarrega() {
  const cardPar = document.querySelector('article.cartao-produto[data-produto="parafusadeira"]');
  if (!cardPar) return;
  const cart = loadCart();
  const existsInCart = cart.some(it => (it.title || "").toLowerCase().includes("parafusadeira"));
  if (!existsInCart) {
    produtos.parafusadeira.quantidade = 0;
    const cb = cardPar.querySelector(".selecao-individual"); if (cb) cb.checked = false;
    cardPar.classList.remove("is-selecionado");
    updateTriggerA11y(cardPar, false);
    cardPar.style.display = "none";
  }
}
/* ======================================================
   REMOVE PARAFUSADEIRA DO RESUMO INFERIOR — DEFINITIVO
   ====================================================== */
function removerParafusadeiraResumo() {
  const itensResumo = document.querySelectorAll(".item-resumo");

  itensResumo.forEach(item => {
    const titulo = item.querySelector("strong")?.textContent?.toLowerCase() || "";

    if (titulo.includes("parafusadeira") || titulo.includes("ppf120")) {
      item.remove();
    }
  });
}

/* ======================================================
   IMPORTA DO LOCALSTORAGE / PAYLOAD (deve usar APENAS card “lampada” como template)
   ====================================================== */
function importarDoLocalStorage() {
  aplicarLampadaDoCarrinho(); // popula o template "lampada" se houver item salvo

  const raw = localStorage.getItem("bulbe:addToCart");
  if (raw) {
    try {
      const incoming = JSON.parse(raw);
      localStorage.removeItem("bulbe:addToCart");
      if (incoming && incoming.title) {
        const lamp = document.querySelector('article.cartao-produto[data-produto="lampada"]');
        if (lamp) {
          lamp.style.display = ""; // garantir visibilidade SÓ do lampada
          const imgEl = lamp.querySelector(".imagem-produto img, .img img, picture img, img");
          const titleEl = lamp.querySelector(".titulo-produto, .title, h3, h2");
          const priceEl = lamp.querySelector(".valor-produto, .price, [data-preco]");
          const qtdEl = lamp.querySelector("[data-quantidade], .qtd, .quantidade");
          const unidadesEl = lamp.querySelector(".texto-unidades, .units, .info-qtd");

          if (imgEl) { imgEl.src = resolverImgParaCarrinho(incoming.img); imgEl.alt = incoming.alt || incoming.title || "Produto"; }
          if (titleEl) { titleEl.innerHTML = (incoming.title || "Produto").replace(/\s{2,}/g, " "); }
          if (priceEl) {
            const unit = Number(incoming.price || 0);
            if (priceEl instanceof HTMLElement) priceEl.dataset.preco = String(unit.toFixed(2));
            priceEl.textContent = moedaBR(unit);
          }
          const q = Number(incoming.qty || 1);
          if (qtdEl) qtdEl.textContent = String(q);
          if (unidadesEl) unidadesEl.textContent = `(${q} unidade${q > 1 ? "s" : ""})`;

          produtos.lampada.titulo = incoming.title || produtos.lampada.titulo;
          produtos.lampada.preco = Number(incoming.price || produtos.lampada.preco);
          produtos.lampada.quantidade = Number(incoming.qty || 1);
          // --- ATUALIZA TODAS AS IMAGENS DO RESUMO INFERIOR ---
          document.querySelectorAll(".item-resumo img").forEach(img => {
            img.src = resolverImgParaCarrinho(incoming.img);
            img.alt = incoming.title || "Produto";
          });


          const id = `${String(produtos.lampada.titulo).toLowerCase().replace(/\s+/g, " ").slice(0, 200)}|${Number(produtos.lampada.preco || 0).toFixed(2)}`;
          const img = resolverImgParaCarrinho(incoming.img || "");
          const alt = incoming.alt || incoming.title || produtos.lampada.titulo;

          const cart = loadCart();
          const ix = cart.findIndex((it) => it.id === id);
          if (ix >= 0) cart[ix].qty = Number(incoming.qty || 1);
          else cart.push({ id, title: produtos.lampada.titulo, price: produtos.lampada.preco, img, alt, qty: Number(incoming.qty || 1) });

          saveCart(cart);
          setLastId(id);
        }
      }
    } catch { }
  }

  renderExtraCartItems();
  atualizarResumo();
  atualizarResumoSelecionados();
}

/* ======================================================
   RENDERIZA ITENS EXTRAS DO CARRINHO (além do "lampada")
   ====================================================== */
function renderExtraCartItems() {
  const cart   = loadCart();
  const lastId = getLastId();
  // ID do item já exibido no slot "lampada"
  const mainId = (lastId && cart.find(it => it.id === lastId)?.id) || cart[0]?.id;

  // Remove cards extras gerados anteriormente para evitar duplicatas
  document.querySelectorAll('article.cartao-produto[data-produto^="extra-"]').forEach(c => c.remove());

  const extras = cart.filter(it => it.id !== mainId);
  if (!extras.length) return;

  const lampadaCard = document.querySelector('article.cartao-produto[data-produto="lampada"]');
  if (!lampadaCard) return;

  extras.forEach(item => {
    const key = 'extra-' + item.id.replace(/[^a-z0-9]/gi, '-').slice(0, 30);

    // Registra no estado interno
    if (!produtos[key]) {
      produtos[key]    = { titulo: item.title, preco: Number(item.price || 0), quantidade: Number(item.qty || 1) };
      selecionados[key] = false;
    } else {
      produtos[key].titulo     = item.title;
      produtos[key].preco      = Number(item.price || 0);
      produtos[key].quantidade = Number(item.qty || 1);
    }

    const qty = Number(item.qty || 1);
    const img = resolverImgParaCarrinho(item.img || '');

    const card = document.createElement('article');
    card.className         = 'cartao-produto';
    card.dataset.produto   = key;
    card.dataset.cartId    = item.id; // ID real no bulbe:cart para remoção correta
    card.innerHTML = `
      <label class="checkbox-produto">
        <input type="checkbox" class="selecao-individual">
        <span class="texto-checkbox">Selecionar</span>
      </label>
      <div class="imagem-produto">
        <img src="${img}" alt="${item.alt || item.title || 'Produto'}">
      </div>
      <div class="informacoes-produto">
        <h3 class="titulo-produto">${item.title || 'Produto'}</h3>
        <div class="preco-produto">
          <span class="simbolo-reais">R$</span>
          <span class="valor-produto" data-preco="${Number(item.price || 0).toFixed(2)}">${Number(item.price || 0).toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="controle-quantidade">
          <div class="contador" data-produto="${key}">
            <button class="botao-quantidade" data-acao="diminuir">–</button>
            <span class="quantidade-atual" data-quantidade>${qty}</span>
            <button class="botao-quantidade" data-acao="aumentar">+</button>
          </div>
          <div class="texto-unidades">(${qty} unidade${qty > 1 ? 's' : ''})</div>
        </div>
      </div>`;

    lampadaCard.insertAdjacentElement('afterend', card);
  });
}

/* ======================================================
   LIMPAR CARRINHO
   ====================================================== */
document.getElementById("botaoLimpar")?.addEventListener("click", limparCarrinho);
function limparCarrinho() {
  // Zera o storage REAL
  try { localStorage.removeItem("bulbe:cart"); } catch { }
  try { localStorage.removeItem("bulbe:lastAddedId"); } catch { }

  // Redireciona para o carrinho vazio
  window.location.href = "../carrinhovazio/carrinhovazio.html";
}


/* ======================================================
   EVENTOS: “Selecionar/Selecionado” com TOGGLE
   ====================================================== */
function onClickSelecionar(e) {
  let trigger = e.target.closest('[data-action="selecionar"], .selecionar, .texto-selecionar, .btn-selecionar, .btn-selecao');
  if (!trigger && (e.target?.textContent || "").trim().toLowerCase() === "selecionar") {
    trigger = e.target;
  }
  if (!trigger) return;

  e.preventDefault();

  const card = trigger.closest("article.cartao-produto");
  const chave = card?.dataset.produto;
  if (!chave || !(chave in produtos)) return;

  const novoEstado = !selecionados[chave];
  selecionados[chave] = novoEstado;

  const cb = card.querySelector(".selecao-individual");
  if (cb) cb.checked = novoEstado;

  card.classList.toggle("is-selecionado", novoEstado);
  updateTriggerA11y(card, novoEstado);
  atualizarSelecionarTudoEstado();
  atualizarResumoSelecionados();
}

function onKeydownSelecionar(e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  const trigger = document.activeElement?.closest?.('[data-action="selecionar"], .selecionar, .texto-selecionar, .btn-selecionar, .btn-selecao');
  if (!trigger) return;
  e.preventDefault();
  trigger.click();
}

/* ======================================================
   CHECKBOXES: individuais e “Selecionar tudo” (somente visíveis)
   ====================================================== */
function bindCheckboxesSelecao() {
  const selecionarTudo = document.getElementById("selecionarTudo");

  selecionarTudo?.addEventListener("change", () => {
    const cbs = getVisibleCheckboxes();
    cbs.forEach((c) => {
      const card = c.closest("article.cartao-produto");
      const chave = card?.dataset.produto;
      if (!chave || !(chave in produtos)) return;
      c.checked = selecionarTudo.checked;
      selecionados[chave] = c.checked;
      card.classList.toggle("is-selecionado", c.checked);
      updateTriggerA11y(card, c.checked);
    });
    atualizarResumoSelecionados();
  });

  // listeners individuais (nos que existem inicialmente)
  document.querySelectorAll(".selecao-individual").forEach((c) => {
    c.addEventListener("change", () => {
      const card = c.closest("article.cartao-produto");
      const chave = card?.dataset.produto;
      if (!chave || !(chave in produtos)) return;
      const on = !!c.checked;
      selecionados[chave] = on;
      card.classList.toggle("is-selecionado", on);
      updateTriggerA11y(card, on);
      atualizarSelecionarTudoEstado();
      atualizarResumoSelecionados();
    });
  });
}

function syncSelectionFromCheckboxes() {
  // Sincroniza somente visíveis para o estado do "selecionar tudo"
  getVisibleCards().forEach((card) => {
    const k = card.dataset.produto;
    if (!k || !(k in produtos)) return;
    const cb = card.querySelector(".selecao-individual");
    const isOn = cb ? !!cb.checked : false;
    selecionados[k] = isOn;
    card.classList.toggle("is-selecionado", isOn);
    updateTriggerA11y(card, isOn);
  });
  atualizarSelecionarTudoEstado();
  atualizarResumoSelecionados();
}
/* ======================================================
   INICIALIZAÇÃO (com proteção contra listeners duplicados)
   ====================================================== */
function init() {
  if (window.__bulbeCartInit) return;
  window.__bulbeCartInit = true;

  injectSelecionarStyles();

  // Estado inicial: SEM selecionados
  document.querySelectorAll(".selecao-individual").forEach((cb) => (cb.checked = false));
  selecionados.lampada = false;
  selecionados.parafusadeira = false;
  const selecionarTudo = document.getElementById("selecionarTudo");
  if (selecionarTudo) { selecionarTudo.checked = false; selecionarTudo.indeterminate = false; }

  inicializarCarrinhoVazioSeNecessario();
  ensureParafusadeiraNaoAutoCarrega();
  importarDoLocalStorage(); // renderExtraCartItems() é chamado aqui dentro
  enhanceSelecionarUI();    // roda DEPOIS de criar os cards extras, garantindo uniformidade
  removerParafusadeiraResumo();
  bindCheckboxesSelecao();
  ativarContadores();

  // Delegação única
  document.addEventListener("click", onClickSelecionar);
  document.addEventListener("keydown", onKeydownSelecionar);

  atualizarResumo();
  atualizarResumoSelecionados();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

// Reexecuta quando voltar via bfcache
window.addEventListener("pageshow", (ev) => {
  if (ev.persisted) {
    enhanceSelecionarUI();
    atualizarSelecionarTudoEstado();
    atualizarResumo();
    atualizarResumoSelecionados();
  }
});
// 
const cart = JSON.parse(localStorage.getItem("bulbe:cart")) || [];

// if (cart.length === 0) {
//   window.location.href = "../carrinhovazio/carrinhovazio.html";
// }
