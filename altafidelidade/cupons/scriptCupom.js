const searchInput = document.getElementById("search");
const cards = document.querySelectorAll(".card");

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase();
        cards.forEach((card) => {
            card.style.display = card.innerText.toLowerCase().includes(q) ? "" : "none";
        });
    });
}

// ===== TOAST =====
const wrap = document.getElementById("toastWrap");
const toast = document.getElementById("toast");
const title = document.getElementById("toastTitle");
const msg = document.getElementById("toastMsg");
const sub = document.getElementById("toastSub");
const closeBtn = document.getElementById("toastClose");
let autoHide = null;

function showToast(kind, head, message, hint) {
    toast.className = "toast " + kind; // success | error
    title.textContent = head;
    msg.textContent = message;
    sub.innerHTML = hint;
    wrap.classList.add("show");
    clearTimeout(autoHide);
    autoHide = setTimeout(() => wrap.classList.remove("show"), 4200);
}
function hideToast() {
    wrap.classList.remove("show");
    clearTimeout(autoHide);
}
if (closeBtn) closeBtn.addEventListener("click", hideToast);
if (wrap) {
    wrap.addEventListener("click", (e) => {
        if (e.target === wrap) hideToast();
    });
}

// ===== ABRIR / FECHAR TERMOS =====
document.querySelectorAll("[data-terms]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".card");
        const panel = card.querySelector("[data-terms-panel]");

        // fecha outros
        document.querySelectorAll(".card.terms-open").forEach((open) => {
            if (open !== card) open.classList.remove("terms-open");
        });

        // alterna atual
        card.classList.toggle("terms-open");
        if (panel) panel.setAttribute("aria-expanded", card.classList.contains("terms-open") ? "true" : "false");
    });
});

// botão “voltar/fechar” dentro do painel
document.querySelectorAll(".panel-close").forEach((b) => {
    b.addEventListener("click", () => {
        const card = b.closest(".card");
        card.classList.remove("terms-open");
    });
});

// ===== RESGATAR CUPOM — valida na API =====
document.querySelectorAll(".redeem-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const code     = btn.dataset.code;
        let merchant   = btn.dataset.merchant;
        const discount = btn.dataset.discount;

        if (merchant && merchant.toLowerCase().includes("phil")) merchant = "Philco";

        btn.disabled = true;
        try {
            if (window.api) {
                await window.api.cupons.buscar(code);
            }
            localStorage.setItem("bulbe:cupom", code);
            showToast(
                "success",
                "Cupom resgatado com sucesso",
                `Você ganhou ${discount} em ${merchant}.`,
                `<small>Código aplicado: <strong>${code}</strong>. Aproveite sua compra!</small>`
            );
        } catch {
            showToast(
                "error",
                "Resgate de cupom inválido",
                "Não foi possível resgatar o cupom.",
                `<small>Houve erro ao utilizar o cupom <strong>${code}</strong>. Tente novamente ou escolha outro cupom.</small>`
            );
        } finally {
            btn.disabled = false;
        }
    });
});

// ===== BOTÃO VOLTAR DO HEADER =====
const backBtn = document.querySelector(".back-btn");
if (backBtn) {
    backBtn.addEventListener("click", () => window.history.back());
}