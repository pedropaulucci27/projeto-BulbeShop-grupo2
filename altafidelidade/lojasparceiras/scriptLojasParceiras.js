
// === MENU DE FILTRO ===
const filterBtn = document.getElementById("filter-btn");
const filterMenu = document.getElementById("filter-menu");

filterBtn.addEventListener("click", () => {
    filterMenu.style.display =
        filterMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
    if (!filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
        filterMenu.style.display = "none";
    }
});

// === PLACEHOLDER ANIMADO ===
const searchInput = document.getElementById("search-input");
const text = "Busque por marcas, categorias ou produtos";
let index = 0;

function typeEffect() {
    if (index < text.length) {
        searchInput.setAttribute("placeholder", text.slice(0, index + 1));
        index++;
        setTimeout(typeEffect, 80);
    } else {
        // Espera e reinicia
        setTimeout(() => {
            index = 0;
            searchInput.setAttribute("placeholder", "");
            typeEffect();
        }, 2000);
    }
}

typeEffect();

// Rolagem suave com clique e arraste (melhor usabilidade mobile)
const navScroll = document.querySelector(".nav-scroll");
let isDown = false;
let startX;
let scrollLeft;

navScroll.addEventListener("mousedown", (e) => {
    isDown = true;
    navScroll.classList.add("active");
    startX = e.pageX - navScroll.offsetLeft;
    scrollLeft = navScroll.scrollLeft;
});

navScroll.addEventListener("mouseleave", () => {
    isDown = false;
});

navScroll.addEventListener("mouseup", () => {
    isDown = false;
});

navScroll.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - navScroll.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do arrasto
    navScroll.scrollLeft = scrollLeft - walk;
});

//menu categoria
document.addEventListener("DOMContentLoaded", function() {
    const btnCategorias = document.getElementById("btn-categorias");
    const menuCategorias = document.getElementById("menu-categorias");
    const fecharMenu = document.getElementById("fechar-menu");

    btnCategorias.addEventListener("click", function(e) {
        e.preventDefault();
        menuCategorias.classList.add("active");
    });

    fecharMenu.addEventListener("click", function() {
        menuCategorias.classList.remove("active");
    });

    // Fecha o menu ao clicar fora do conteúdo
    menuCategorias.addEventListener("click", function(e) {
        if (e.target === menuCategorias) {
            menuCategorias.classList.remove("active");
        }
    });
});

// === ÍCONES (coração / carrinho) ===
document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.stopPropagation();
        btn.classList.toggle('active');

        const card = btn.closest('.card, [data-produto], .produto') || null;
        if (!card) return;

        const imgEl   = card.querySelector('img');
        const titleEl = card.querySelector('.title, h3, h2');
        const priceEl = card.querySelector('.price-now, .price, [data-preco]');

        const parsePrecoBR = (txt) => {
            if (!txt) return 0;
            return parseFloat(String(txt).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        };

        const title = (titleEl?.textContent || '').trim() || 'Produto';
        const price = priceEl?.dataset?.preco
            ? parseFloat(priceEl.dataset.preco)
            : parsePrecoBR(priceEl?.textContent || '0');
        const img = imgEl?.src || '';
        const alt = imgEl?.alt || title;

        // === FAVORITAR ===
        if (btn.classList.contains('heart')) {
            const id = `loja-${title.toLowerCase().slice(0, 40).replace(/\s+/g, '-')}`;
            let favs = [];
            try { favs = JSON.parse(localStorage.getItem('bulbe:favorites')) || []; } catch {}
            const jaFav = favs.find(f => f.id === id);
            if (jaFav) {
                favs = favs.filter(f => f.id !== id);
                btn.classList.remove('active');
            } else {
                favs.push({ id, title, price: `R$ ${price.toFixed(2).replace('.', ',')}`, priceOld: '', img });
                btn.classList.add('active');
            }
            try { localStorage.setItem('bulbe:favorites', JSON.stringify(favs)); } catch {}
            return;
        }

        // === ADICIONAR AO CARRINHO ===
        if (btn.classList.contains('cart')) {
            const id = `${title.toLowerCase()}|${price.toFixed(2)}`;
            let carrinho = [];
            try { carrinho = JSON.parse(localStorage.getItem('bulbe:cart')) || []; } catch {}
            const existente = carrinho.find(p => p.id === id);
            if (existente) existente.qty++;
            else carrinho.push({ id, title, price, img, alt, qty: 1 });
            localStorage.setItem('bulbe:cart', JSON.stringify(carrinho));
            localStorage.setItem('bulbe:lastAddedId', id);
            window.location.href = '/altafidelidade/carrinhos/carrinho.html';
        }
    });
});

// === BOTÃO DO CARRINHO NO HEADER ===
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
   LOJAS PARCEIRAS — carrega da API
   ========================================================= */
const SVG_HEART_LOJA = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.8 7.4 6.75 5.6 8.56c-1.82 1.82-1.78 4.72.1 6.6l5.83 5.83c.26.26.68.26.94 0l5.83-5.83c1.88-1.88 1.92-4.78.1-6.6-1.8-1.81-4.54-1.76-6.3.08z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
const SVG_CART_LOJA  = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3 3h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="17" cy="20" r="1.6" fill="currentColor"/></svg>`;

function buildCardLoja(p) {
  const preco = parseFloat(p.price);
  const link  = `/altafidelidade/produto/produto.html?id=${p.id}`;
  const img   = resolverImagemProduto(p.image);
  return `
    <article class="card">
      <div class="card-body">
        <div class="media"><a href="${link}"><img src="${img}" alt="${p.title}" onerror="this.onerror=null;this.src='/altafidelidade/home/img/ventiladorbritania.webp'"></a></div>
        <div class="info">
          <a href="${link}"><h3 class="title">${p.title}</h3></a>
          <div class="pricebox">
            <div class="price-now" data-preco="${preco}">R$${preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
        <div class="actions">
          <button class="icon-btn heart" aria-label="Favoritar">${SVG_HEART_LOJA}</button>
          <button class="icon-btn cart"  aria-label="Adicionar ao carrinho">${SVG_CART_LOJA}</button>
        </div>
      </div>
    </article>`;
}

async function carregarLojasParceiras() {
  const grid = document.querySelector(".grid");
  if (!grid || !window.api) return;

  try {
    const lojas = await window.api.lojas.listar();
    const lista = Array.isArray(lojas) ? lojas : (lojas.lojas || []);

    if (lista.length === 0) return;

    const todosProdutos = await Promise.all(
      lista.map(l => window.api.lojas.produtos(l.id).catch(() => []))
    );

    const produtos = todosProdutos.flat();
    if (produtos.length > 0) grid.innerHTML = produtos.map(buildCardLoja).join("");
  } catch {
    // mantém cards hardcoded se API indisponível
  }
}

document.addEventListener("DOMContentLoaded", carregarLojasParceiras);
