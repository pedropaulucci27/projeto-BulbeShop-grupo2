/* ============================================================
   Carrinho — script.js
   Fonte de dados: exclusivamente api.carrinho.*
   ============================================================ */

const moedaBR = (n) =>
  `R$${(Number(n) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* Injeta CSS para o estado selecionado do botão (mesmo comportamento do script original) */
(function injetarEstilosSelecao() {
  if (document.getElementById("bulbe-selecao-css")) return;
  const style = document.createElement("style");
  style.id = "bulbe-selecao-css";
  style.textContent = `
    .btn-selecao {
      cursor: pointer; user-select: none;
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .35rem .75rem; border-radius: 9999px;
      border: 1px solid rgba(8,6,141,.28); background: #fff;
      font-weight: 600; line-height: 1; font-size: .95rem;
    }
    .cartao-produto.is-selecionado .btn-selecao {
      background: #08068D;
      border-color: #08068D;
      color: #fff;
    }
  `;
  document.head.appendChild(style);
})();

/* Estado interno */
let itensCarrinho = []; // array normalizado [{id, produtoId, quantidade, produto:{title,price,image}}]
const selecionados = new Set(); // Set de itemId (string)

/* Resolve imagem usando função global do api.js */
function resolverImg(filename) {
  if (typeof resolverImagemProduto === "function") return resolverImagemProduto(filename);
  return filename || "/altafidelidade/home/img/ventiladorbritania.webp";
}

/* Resolve imagem para os mini cards usando o fallback por id/título do api.js */
function resolverImgMini(p) {
  if (typeof resolverImagemProdutoCompleta === "function") return resolverImagemProdutoCompleta(p);
  return resolverImg(p.image);
}

/* Redireciona para login se não autenticado */
function verificarLogin() {
  if (!window.api?.estaLogado()) {
    window.location.href =
      "/altafidelidade/login/login.html?next=" +
      encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}

/* Normaliza a resposta da API para um array consistente,
   independentemente do formato retornado pelo backend */
function normalizarItens(resp) {
  let lista =
    resp?.itens ??
    resp?.items ??
    resp?.carrinho?.itens ??
    resp?.carrinho?.items ??
    (Array.isArray(resp?.carrinho) ? resp.carrinho : null) ??
    (Array.isArray(resp) ? resp : null) ??
    [];

  if (!Array.isArray(lista)) lista = [];

  return lista.map((item) => ({
    id: String(item.id),
    produtoId: String(
      item.produtoId ?? item.produto_id ?? item.produto?.id ?? ""
    ),
    quantidade: Number(item.quantidade ?? item.quantity ?? item.qty ?? 1),
    produto: {
      title: item.produto?.title ?? item.title ?? "Produto",
      price: Number(item.produto?.price ?? item.price ?? 0),
      image: item.produto?.image ?? item.image ?? "",
    },
  }));
}

/* Gera o HTML de um card de produto, usando as mesmas classes do layout original */
function buildCard(item) {
  const img = resolverImgMini({ id: item.produtoId, title: item.produto.title, image: item.produto.image });
  const preco = item.produto.price;
  const qty = item.quantidade;

  return `
    <article class="cartao-produto" data-item-id="${item.id}">
      <label class="checkbox-produto">
        <input type="checkbox" class="selecao-individual">
        <span class="texto-checkbox btn-selecao">Selecionar</span>
      </label>
      <button class="btn-remover-item" aria-label="Remover item" title="Remover do carrinho"
        style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;font-size:1.2rem;color:#999;line-height:1;">✕</button>
      <div class="imagem-produto">
        <img src="${img}" alt="${item.produto.title}"
             onerror="this.onerror=null;this.src='/altafidelidade/home/img/ventiladorbritania.webp'">
      </div>
      <div class="informacoes-produto">
        <h3 class="titulo-produto">${item.produto.title}</h3>
        <div class="preco-produto">
          <span class="simbolo-reais">R$</span>
          <span class="valor-produto" data-preco="${preco.toFixed(2)}">
            ${preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div class="controle-quantidade">
          <div class="contador">
            <button class="botao-quantidade" data-acao="diminuir">–</button>
            <span class="quantidade-atual" data-quantidade>${qty}</span>
            <button class="botao-quantidade" data-acao="aumentar">+</button>
          </div>
          <div class="texto-unidades">(${qty} unidade${qty > 1 ? "s" : ""})</div>
        </div>
      </div>
    </article>`;
}

/* Remove os cards existentes (hardcoded ou renderizados anteriormente)
   e injeta os cards da API, mantendo o layout original */
function renderItens() {
  document.querySelectorAll("article.cartao-produto").forEach((el) => el.remove());

  if (itensCarrinho.length === 0) {
    window.location.href = "../carrinhovazio/carrinhovazio.html";
    return;
  }

  const html = itensCarrinho.map(buildCard).join("");
  const ancora = document.querySelector(".secao-adicionar-itens");
  if (ancora) {
    ancora.insertAdjacentHTML("beforebegin", html);
  } else {
    document.querySelector(".cabecalho-carrinho").insertAdjacentHTML("afterend", html);
  }

  /* Vincula eventos a cada card recém-criado */
  document.querySelectorAll("article.cartao-produto").forEach((card) => {
    const itemId = card.dataset.itemId;
    const cb = card.querySelector(".selecao-individual");

    cb?.addEventListener("change", () => {
      if (cb.checked) selecionados.add(itemId);
      else selecionados.delete(itemId);
      card.classList.toggle("is-selecionado", cb.checked);
      const span = card.querySelector(".btn-selecao");
      if (span) span.textContent = cb.checked ? "Selecionado" : "Selecionar";
      atualizarSelecionarTudo();
      atualizarResumo();
    });

    card
      .querySelector('[data-acao="aumentar"]')
      ?.addEventListener("click", () => alterarQuantidade(itemId, 1, card));

    card
      .querySelector('[data-acao="diminuir"]')
      ?.addEventListener("click", () => alterarQuantidade(itemId, -1, card));

    card
      .querySelector(".btn-remover-item")
      ?.addEventListener("click", () => removerItem(itemId, card));

  });

  atualizarResumo();
}

/* Altera quantidade de um item via API */
async function alterarQuantidade(itemId, delta, card) {
  const item = itensCarrinho.find((i) => i.id === itemId);
  if (!item) return;

  const novaQtd = item.quantidade + delta;
  if (novaQtd <= 0) {
    await removerItem(itemId, card);
    return;
  }

  try {
    await window.api.carrinho.atualizar(Number(itemId), novaQtd);
    item.quantidade = novaQtd;

    const spanQtd = card.querySelector("[data-quantidade]");
    const spanUn = card.querySelector(".texto-unidades");
    if (spanQtd) spanQtd.textContent = novaQtd;
    if (spanUn)
      spanUn.textContent = `(${novaQtd} unidade${novaQtd > 1 ? "s" : ""})`;

    if (selecionados.has(itemId)) atualizarResumo();
  } catch {
    alert("Não foi possível atualizar a quantidade. Tente novamente.");
  }
}

/* Remove um item via API */
async function removerItem(itemId, card) {
  try {
    await window.api.carrinho.remover(Number(itemId));
    itensCarrinho = itensCarrinho.filter((i) => i.id !== itemId);
    selecionados.delete(itemId);
    card.remove();
    atualizarSelecionarTudo();
    atualizarResumo();
    if (itensCarrinho.length === 0) {
      window.location.href = "../carrinhovazio/carrinhovazio.html";
    }
  } catch {
    alert("Não foi possível remover o item. Tente novamente.");
  }
}

/* Sincroniza o estado do checkbox "Selecionar tudo" */
function atualizarSelecionarTudo() {
  const cbTudo = document.getElementById("selecionarTudo");
  if (!cbTudo) return;
  const todos = [...document.querySelectorAll(".selecao-individual")];
  const marcados = todos.filter((c) => c.checked);
  if (todos.length === 0) {
    cbTudo.checked = false;
    cbTudo.indeterminate = false;
  } else {
    cbTudo.checked = todos.length === marcados.length;
    cbTudo.indeterminate = marcados.length > 0 && marcados.length < todos.length;
  }
}

/* Atualiza o resumo lateral com base nos itens selecionados */
function atualizarResumo() {
  const resumo = document.getElementById("resumoCarrinho");
  if (!resumo) return;

  const sel = itensCarrinho.filter((i) => selecionados.has(i.id));

  if (sel.length === 0) {
    resumo.style.display = "none";
    return;
  }
  resumo.style.display = "block";

  const total = sel.reduce((acc, i) => acc + i.produto.price * i.quantidade, 0);
  const primeiro = sel[0];

  const totalEl = document.getElementById("totalResumo");
  const tituloEl = document.getElementById("tituloResumo");
  const imgEl = resumo.querySelector(".item-resumo img");
  const qtdEl = document.getElementById("quantidadeResumoLampada");
  const precoEl = document.getElementById("precoResumoLampada");

  if (totalEl) totalEl.textContent = moedaBR(total);
  if (tituloEl) tituloEl.textContent = primeiro.produto.title;
  if (imgEl) {
    imgEl.src = resolverImgMini({ id: primeiro.produtoId, title: primeiro.produto.title, image: primeiro.produto.image });
    imgEl.alt = primeiro.produto.title;
  }
  if (qtdEl) qtdEl.textContent = primeiro.quantidade;
  if (precoEl)
    precoEl.textContent = moedaBR(primeiro.produto.price * primeiro.quantidade);
}

/* Preenche o carrossel "Adicionar mais itens" com produtos reais da API */
async function carregarMaisItens() {
  const trilha = document.getElementById("trilhaCarrossel");
  if (!trilha) return;

  try {
    const resp = await window.api.produtos.listar();
    const produtos = Array.isArray(resp) ? resp : resp?.data ?? [];
    if (!produtos.length) return;

    trilha.innerHTML = produtos
      .slice(0, 6)
      .map(
        (p) => `
        <article class="cartao-mini" data-produto-id="${p.id}">
          <div class="miniatura-produto">
            <img src="${resolverImgMini(p)}" alt="${p.title}"
                 onerror="this.onerror=null;this.src='/altafidelidade/home/img/ventiladorbritania.webp'">
          </div>
          <h4 class="titulo-mini">${p.title}</h4>
          <div class="preco-mini"><strong>${moedaBR(p.price)}</strong></div>
          <div class="acoes-mini">
            <button class="botao-icone btn-fav-mini" aria-label="Favoritar">
              <img src="./assets/img/Exclude (1).svg" alt="">
            </button>
            <button class="botao-icone btn-cart-mini" aria-label="Adicionar ao carrinho">
              <img src="./assets/img/Exclude (2).svg" alt="">
            </button>
          </div>
        </article>`
      )
      .join("");

    trilha.querySelectorAll(".cartao-mini").forEach((card) => {
      const pid = card.dataset.produtoId;
      card.querySelector(".btn-cart-mini")?.addEventListener("click", async () => {
        try {
          await window.api.carrinho.adicionar(Number(pid), 1);
          await carregarCarrinho(); // recarrega para refletir o item adicionado
        } catch {
          alert("Não foi possível adicionar ao carrinho.");
        }
      });
      card.querySelector(".btn-fav-mini")?.addEventListener("click", async () => {
        try { await window.api.favoritos.adicionar(Number(pid)); } catch {}
      });
    });
  } catch {
    /* mantém os cards hardcoded se a API falhar */
  }
}

/* Carrega o carrinho da API e renderiza */
async function carregarCarrinho() {
  try {
    const resp = await window.api.carrinho.listar();
    itensCarrinho = normalizarItens(resp);
    renderItens();
  } catch {
    if (!window.api.estaLogado()) {
      window.location.href =
        "/altafidelidade/login/login.html?next=" +
        encodeURIComponent(window.location.pathname);
    } else {
      window.location.href = "../carrinhovazio/carrinhovazio.html";
    }
  }
}

/* ============================================================
   EVENTOS GLOBAIS (elementos que já existem no HTML)
   ============================================================ */

/* Carrossel */
const trilha = document.getElementById("trilhaCarrossel");
document.querySelector(".seta-carrossel.esquerda")?.addEventListener("click", () => {
  trilha?.scrollBy({ left: -trilha.clientWidth * 0.9, behavior: "smooth" });
});
document.querySelector(".seta-carrossel.direita")?.addEventListener("click", () => {
  trilha?.scrollBy({ left: +trilha.clientWidth * 0.9, behavior: "smooth" });
});

/* Selecionar tudo */
document.getElementById("selecionarTudo")?.addEventListener("change", (e) => {
  const marcar = e.target.checked;
  document.querySelectorAll("article.cartao-produto").forEach((card) => {
    const cb = card.querySelector(".selecao-individual");
    const id = card.dataset.itemId;
    if (!cb || !id) return;
    cb.checked = marcar;
    card.classList.toggle("is-selecionado", marcar);
    const span = card.querySelector(".btn-selecao");
    if (span) span.textContent = marcar ? "Selecionado" : "Selecionar";
    if (marcar) selecionados.add(id);
    else selecionados.delete(id);
  });
  atualizarResumo();
});

/* Botões +/- dentro do resumo lateral */
document.querySelector("#resumoCarrinho .contador")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".botao-quantidade");
  if (!btn) return;
  const sel = itensCarrinho.filter((i) => selecionados.has(i.id));
  if (!sel.length) return;
  const primeiro = sel[0];
  const card = document.querySelector(`[data-item-id="${primeiro.id}"]`);
  if (card)
    alterarQuantidade(
      primeiro.id,
      btn.dataset.acao === "aumentar" ? 1 : -1,
      card
    );
});

/* Limpar carrinho */
document.getElementById("botaoLimpar")?.addEventListener("click", async () => {
  if (!confirm("Deseja limpar o carrinho?")) return;
  try {
    await Promise.all(itensCarrinho.map((i) => window.api.carrinho.remover(i.id)));
    window.location.href = "../carrinhovazio/carrinhovazio.html";
  } catch {
    alert("Erro ao limpar o carrinho. Tente novamente.");
  }
});

/* Finalizar compra — só avança se houver itens selecionados na API */
document.getElementById("botaoContinuar")?.addEventListener("click", () => {
  if (selecionados.size === 0) {
    alert("Selecione pelo menos um produto para continuar.");
    return;
  }
  document.getElementById("resumoCarrinho")?.classList.add("fade-out");
  setTimeout(() => (window.location.href = "../pagamento1/pagamento.html"), 400);
});

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
async function init() {
  if (!verificarLogin()) return;
  await carregarCarrinho();
  await carregarMaisItens();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
