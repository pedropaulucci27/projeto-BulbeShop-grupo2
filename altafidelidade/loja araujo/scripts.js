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

// === ÍCONES (coração / carrinho) ===
document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
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
