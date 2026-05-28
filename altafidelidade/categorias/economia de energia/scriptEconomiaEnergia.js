// === MENU DE FILTRO ===
const filterBtn = document.getElementById("filter-btn");
const filterMenu = document.getElementById("filter-menu");

if (filterBtn && filterMenu) {
    filterBtn.addEventListener("click", () => {
        filterMenu.style.display = filterMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
        if (!filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
            filterMenu.style.display = "none";
        }
    });
}

// === PLACEHOLDER ANIMADO ===
const searchInput = document.getElementById("search-input");
const text = "Busque por marcas, categorias ou produtos";
let index = 0;

function typeEffect() {
    if (!searchInput) return;
    if (index < text.length) {
        searchInput.setAttribute("placeholder", text.slice(0, index + 1));
        index++;
        setTimeout(typeEffect, 80);
    } else {
        setTimeout(() => {
            index = 0;
            searchInput.setAttribute("placeholder", "");
            typeEffect();
        }, 2000);
    }
}
typeEffect();

// === BUSCA FUNCIONAL ===
const searchInputEl = document.getElementById("search-input");
const searchBtnEl = document.querySelector(".search-btn");
const cards = document.querySelectorAll(".card");

function filtrarProdutos() {
    const termo = (searchInputEl?.value || "").trim().toLowerCase();
    if (termo === "") {
        cards.forEach((card) => (card.style.display = "block"));
        return;
    }
    cards.forEach((card) => {
        const titulo = card.querySelector(".title")?.textContent.toLowerCase() || "";
        const preco = card.querySelector(".price-now")?.textContent.toLowerCase() || "";
        const texto = `${titulo} ${preco}`;
        card.style.display = texto.includes(termo) ? "block" : "none";
    });
}
searchBtnEl?.addEventListener("click", filtrarProdutos);
searchInputEl?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") filtrarProdutos();
});

// === SCROLL DRAG NAV (se existir) ===
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
        const walk = (x - startX) * 2;
        navScroll.scrollLeft = scrollLeft - walk;
    });
}

// === CATEGORIAS (atalho) ===
document.querySelectorAll(".categoria").forEach((item) => {
    item.addEventListener("click", () => {
        const url = item.dataset.url;
        if (url) window.location.href = url;
    });
});

// ÍCONES
/* document.querySelectorAll(".icon-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
        btn.classList.toggle("active");

        // Ação de adicionar ao carrinho
        if (btn.classList.contains("cart")) {
            const card =
                btn.closest('.card, .produto, .card-body, [data-card="produto"], [data-produto]') || document;
            const imgEl = card.querySelector(".media img, .card-img img, picture img, img");
            const titleEl = card.querySelector(".title, .card-title, .nome, h3, h2");
            const priceEl = card.querySelector(".price-now, .price, .valor, .card-price, [data-preco]");

            const parsePrecoBR = (txt) => {
                if (!txt) return 0;
                const n = parseFloat(String(txt).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
                return Number.isFinite(n) ? n : 0;
            };

            const title = (titleEl?.textContent || "").replace(/\s+/g, " ").trim() || "Produto";
            const price = priceEl?.dataset?.preco
                ? parseFloat(priceEl.dataset.preco)
                : parsePrecoBR(priceEl?.textContent || "0");
            const img = imgEl?.getAttribute("src") || "";
            const alt = imgEl?.getAttribute("alt") || title;

            const payload = { title, price: Number(price || 0), img, alt, qty: 1, when: Date.now() };
            try { localStorage.setItem("bulbe:addToCart", JSON.stringify(payload)); } catch { }

            const p = location.pathname;
            const i = p.indexOf("/altafidelidade/");
            const cartUrl = i >= 0
                ? p.slice(0, i + "/altafidelidade/".length) + "carrinhos/carrinho.html"
                : "/altafidelidade/carrinhos/carrinho.html";
            try { window.location.href = cartUrl; } catch { }
        }

        event.stopPropagation();
    });
}); */  

// ADDON PERSISTÊNCIA
/* (() => {

    // Gera um ID simples e estável para o item
    function makeId(title, price) {
        const t = String(title || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 200);
        const p = Number(price || 0).toFixed(2);
        return `${t}|${p}`;
    }

    function loadCart() {
        try { return JSON.parse(localStorage.getItem('bulbe:cart')) || []; } catch { return []; }
    }
    function saveCart(arr) {
        try { localStorage.setItem('bulbe:cart', JSON.stringify(arr)); } catch { }
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.icon-btn.cart, .btn-cart, [data-action="add-to-cart"]');
        if (!btn) return;

        const card = btn.closest('.card, .produto, .card-body, [data-card="produto"], [data-produto]') || document;

        const imgEl = card.querySelector('.media img, .card-img img, picture img, img');
        const titleEl = card.querySelector('.title, .card-title, .nome, h3, h2');
        const priceEl = card.querySelector('.price-now, .price, .valor, .card-price, [data-preco]');

        const parsePrecoBR = (txt) => {
            if (!txt) return 0;
            const n = parseFloat(String(txt).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
            return Number.isFinite(n) ? n : 0;
        };

        const title = (titleEl?.textContent || '').replace(/\s+/g, ' ').trim() || 'Produto';
        const price = priceEl?.dataset?.preco ? parseFloat(priceEl.dataset.preco) : parsePrecoBR(priceEl?.textContent || '0');
        const img = imgEl?.getAttribute('src') || '';
        const alt = imgEl?.getAttribute('alt') || title;
        const id = makeId(title, price);

        const cart = loadCart();
        const ix = cart.findIndex(it => it.id === id);
        if (ix >= 0) {
            cart[ix].qty = Math.min(999, Number(cart[ix].qty || 0) + 1);
        } else {
            cart.push({ id, title, price: Number(price || 0), img, alt, qty: 1 });
        }
        saveCart(cart);

        // Guarda o último adicionado
        try { localStorage.setItem('bulbe:lastAddedId', id); } catch { }

        // Mantém o comportamento já existente
        try { localStorage.setItem('bulbe:addToCart', JSON.stringify({ title, price, img, alt, qty: 1, id })); } catch { }
    }, { capture: true });
})(); */

// === CATEGORIAS (atalho) ===
document.querySelectorAll(".categoria").forEach((item) => {
    item.addEventListener("click", () => {
        const url = item.dataset.url;
        if (url) window.location.href = url;
    });
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
document.addEventListener('DOMContentLoaded', () => renderProdutosCategoria('economia'));
