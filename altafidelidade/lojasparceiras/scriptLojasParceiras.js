
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

async function carregarLojasParceiras() {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  try {
    const res = await fetch("http://localhost:3000/api/v1/lojas-parceiras");
    if (!res.ok) throw new Error("Falha na requisição");
    
    const lojas = await res.json();
    
    if (lojas.length === 0) {
      console.warn("A API não retornou lojas. Mantendo os cards estáticos de fallback.");
      return; // Se a API não tiver lojas, preservamos o HTML fixo para não ficar em branco
    }

    // Limpar o container principal apenas se tivermos dados
    grid.innerHTML = "";
    
    // Iterar e criar cards dinamicamente para cada loja
    lojas.forEach(loja => {
      const link = `../loja araujo/paginaaraujo.html?id=${loja.id}`;
      
      // Dicionário de imagens baseado no ID das lojas (já que a API não possui coluna de imagem para lojas)
      const imagensLojas = {
        1: './img/logo_drogaria-araujo.png',
        2: './img/logopontofrio.jpeg'
      };
      
      const img = loja.imagem || imagensLojas[loja.id] || '/altafidelidade/home/img/bulbelogo2.png';
      
      const cardHTML = `
        <article class="card">
          <div class="card-body">
            <div class="media">
              <a href="${link}"><img src="${img}" alt="${loja.nome}" onerror="this.onerror=null;this.src='/altafidelidade/home/img/bulbelogo2.png'"></a>
            </div>
            <div class="info">
              <a href="${link}"><h3 class="title">${loja.nome}</h3></a>
              <p style="margin-top: 5px; font-size: 0.9em; color: #555;">${loja.endereco || ''}</p>
            </div>
            <div class="actions" style="margin-top: 15px; width: 100%;">
              <a href="${link}" style="display: block; width: 100%; text-align: center; background-color: var(--primary-color, #ff4c00); color: #fff; padding: 10px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid var(--primary-color, #ff4c00); cursor: pointer;">Ver Loja</a>
            </div>
          </div>
        </article>`;
        
      grid.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Erro ao buscar lojas:", error);
    // Em caso de erro, a grid permanecerá vazia ou com placeholders (se estivessem na string vazia)
  }
}

document.addEventListener("DOMContentLoaded", carregarLojasParceiras);
