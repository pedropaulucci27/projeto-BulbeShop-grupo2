// Rolagem suave dos carrosséis
const carrosseis = document.querySelectorAll(".produtos");
carrosseis.forEach(carrossel => {
  carrossel.addEventListener("wheel", (e) => {
    e.preventDefault();
    carrossel.scrollLeft += e.deltaY;
  });
});

// === PLACEHOLDER ANIMADO ===
const searchInput = document.getElementById("input-pesquisa");
const text = "Clique aqui para buscar produtos";
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

// === ÍCONES (coração / carrinho) via event delegation ===
document.addEventListener('click', (event) => {
    const btn = event.target.closest('.icon-btn');
    if (!btn) return;

    event.stopPropagation();
    btn.classList.toggle('active');

    const card = btn.closest('.card, [data-produto], .produto') || null;
    if (!card) return;

    const imgEl   = card.querySelector('img');
    const titleEl = card.querySelector('.titulo-produto, .title, h3, h2');
    const priceEl = card.querySelector('.preco-atual, .price-now, .price, [data-preco]');

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
    const prodId = card.dataset.produto || `${title.toLowerCase()}|${price.toFixed(2)}`;

    // === FAVORITAR ===
    if (btn.classList.contains('heart')) {
        const id = `araujo-${title.toLowerCase().slice(0, 40).replace(/\s+/g, '-')}`;
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
        const id = prodId;

        // NOVO: Sincroniza com API do Backend para não dar erro no checkout
        if (window.api && window.api.estaLogado()) {
            try {
                let numId = Number(id);
                if(isNaN(numId)) numId = 1;
                window.api.carrinho.adicionar(numId, 1);
            } catch(e) { console.error("Erro ao adicionar no back-end:", e) }
        }

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

// === INTEGRAÇÃO COM API (LOJA ESPECÍFICA) ===
document.addEventListener("DOMContentLoaded", async () => {
    // Tarefa 2 - Correção 1: Captura de ID
    const urlParams = new URLSearchParams(window.location.search);
    const lojaId = urlParams.get('id');

    if (lojaId) {
        try {
            // Correção 2: Cabeçalho da Loja
            const resLoja = await fetch(`http://localhost:3000/api/v1/lojas-parceiras/${lojaId}`);
            if (resLoja.ok) {
                const lojaData = await resLoja.json();
                
                // Atualiza DOM
                const nomeEl = document.querySelector('.nome-loja') || document.querySelector('h1');
                const enderecoEl = document.querySelector('.endereco-loja') || document.querySelector('.address') || document.querySelector('.loja-info p:nth-child(2)');
                const horarioEl = document.querySelector('.horario-loja') || document.querySelector('.hours') || document.querySelector('.loja-info p:nth-child(3)');
                
                if (nomeEl) nomeEl.textContent = lojaData.nome;
                if (enderecoEl) enderecoEl.textContent = lojaData.endereco;
                if (horarioEl) horarioEl.textContent = lojaData.horario || lojaData.horario_funcionamento || 'Horário não informado';
            }

            // Correção 3: Produtos da Loja
            const resProdutos = await fetch(`http://localhost:3000/api/v1/lojas-parceiras/${lojaId}/produtos`);
            if (resProdutos.ok) {
                const produtosData = await resProdutos.json();
                
                // IMPORTANTE: Ajustei o seletor para pegar a section .grid, que é a que realmente existe no seu HTML
                const vitrine = document.querySelector('.grid') || document.querySelector('.produtos') || document.querySelector('.vitrine');
                
                if (vitrine) {
                    vitrine.innerHTML = ''; // Limpa os hardcoded
                    
                    produtosData.forEach(produto => {
                        const preco = parseFloat(produto.preco || produto.price || 0);
                        const img = produto.image || produto.imagem || '/altafidelidade/home/img/produto_placeholder.webp';
                        const titulo = produto.title || produto.nome || 'Produto Sem Nome';
                        const produtoHTML = `
                            <article class="produto card" data-produto="${produto.id}" onclick="window.location.href='/altafidelidade/produto/produto.html?id=${produto.id}'" style="cursor: pointer;">
                                <div class="card-body">
                                    <div class="media">
                                        <img src="${img}" alt="${titulo}" onerror="this.onerror=null;this.src='/altafidelidade/home/img/produto_placeholder.webp'">
                                    </div>
                                    <div class="info">
                                        <h3 class="titulo-produto">${titulo}</h3>
                                        <div class="preco-atual" data-preco="${preco}">R$ ${preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                                    </div>
                                    <div class="actions">
                                        <button class="icon-btn heart" aria-label="Favoritar">
                                            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12.1 8.64l-.1.1-.1-.1C10.14 6.8 7.4 6.75 5.6 8.56c-1.82 1.82-1.78 4.72.1 6.6l5.83 5.83c.26.26.68.26.94 0l5.83-5.83c1.88-1.88 1.92-4.78.1-6.6-1.8-1.81-4.54-1.76-6.3.08z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
                                        </button>
                                        <button class="icon-btn cart" aria-label="Adicionar ao carrinho">
                                            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M3 3h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="17" cy="20" r="1.6" fill="currentColor"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </article>`;
                        vitrine.innerHTML += produtoHTML;
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dados da loja:", error);
        }
    }
});
