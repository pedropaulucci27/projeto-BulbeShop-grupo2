// MENU DE FILTRO
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

// PLACEHOLDER ANIMADO
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

// BUSCA FUNCIONAL
const searchInputEl = document.getElementById("search-input");
const searchBtnEl = document.querySelector(".search-btn");

async function filtrarProdutos() {
    const termo = (searchInputEl?.value || "").trim().toLowerCase();
    if (termo === "") {
        renderProdutosCategoria("Educação");
        return;
    }

    const grid = document.querySelector(".grid");
    if (!grid) return;
    try {
        const resposta = await window.api.produtos.listar(`?busca=${encodeURIComponent(termo)}`);
        const lista = resposta.data || resposta;
        grid.innerHTML = lista.length
            ? lista.map(buildCardCategoria).join("")
            : '<p style="padding:2rem;text-align:center">Nenhum produto encontrado.</p>';
    } catch {
        console.error("Erro na busca");
    }
}

searchBtnEl?.addEventListener("click", filtrarProdutos);
searchInputEl?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") filtrarProdutos();
});

// SCROLL
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

// CATEGORIAS
document.querySelectorAll(".categoria").forEach((item) => {
    item.addEventListener("click", () => {
        const url = item.dataset.url;
        if (url) window.location.href = url;
    });
});

// MENU OCULTO DE CATEGORIAS
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

document.addEventListener('DOMContentLoaded', () => renderProdutosCategoria('Educação'));