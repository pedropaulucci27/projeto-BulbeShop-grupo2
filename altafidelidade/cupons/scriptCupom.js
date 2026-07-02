// ===== TOAST =====
const wrap     = document.getElementById("toastWrap");
const toast    = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const msg      = document.getElementById("toastMsg");
const sub      = document.getElementById("toastSub");
const closeBtn = document.getElementById("toastClose");
let autoHide   = null;

function showToast(kind, head, message, hint) {
    toast.className = "toast " + kind;
    toastTitle.textContent = head;
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
if (wrap) wrap.addEventListener("click", (e) => { if (e.target === wrap) hideToast(); });

// ===== RENDERIZA CARDS DE CUPOM =====
function renderCupons(cupons) {
    const list    = document.getElementById("couponList");
    const loading = document.getElementById("cuponsLoading");
    if (loading) loading.remove();
    if (!list) return;

    list.innerHTML = "";

    if (!cupons.length) {
        list.innerHTML = '<p class="cupons-vazio">Nenhum cupom disponível no momento.</p>';
        return;
    }

    cupons.forEach(cupom => {
        const codigo   = cupom.codigo || cupom.code || "";
        const validade = cupom.validade || cupom.expiry || "";
        const valido   = cupom.ativo !== false && cupom.ativo !== 0 && cupom.valid !== false;
        const loja     = cupom.loja || cupom.merchant || "";

        // Constrói descrição a partir dos campos reais da API
        const tipo     = cupom.tipo || "%";
        const valorDesc = cupom.desconto ?? cupom.discount ?? 0;
        const descontoStr = tipo === "%" ? `${valorDesc}% OFF` : `R$${valorDesc} OFF`;
        const descricao = cupom.descricao || cupom.description ||
            (loja ? `${descontoStr} em ${loja}` : `Cupom ${codigo}: ${descontoStr}`);

        const dataExp = validade ? new Date(validade) : null;
        const expirado = dataExp ? dataExp < new Date() : !valido;

        const badgeClass = loja.toLowerCase().includes("araujo") ? "merchant--araujo"
            : loja.toLowerCase().includes("ponto") ? "merchant--ponto"
            : "merchant--phil";

        const dataFmt = dataExp
            ? dataExp.toLocaleDateString("pt-BR")
            : (validade || "");

        const article = document.createElement("article");
        article.className = `card${expirado ? " card--expirado" : ""}`;
        article.dataset.coupon = codigo;
        article.innerHTML = `
            <span class="badge ${badgeClass}">${codigo}</span>
            <h3 class="h">${descricao}</h3>
            ${dataFmt ? `<div class="muted">${expirado ? "Expirado em" : "Expira em"} ${dataFmt}</div>` : ""}
            <div class="links-row">
                <button class="terms-link" data-terms>Termos de uso</button>
            </div>
            <div class="cta">
                <button class="btn redeem-btn${expirado ? " btn--expirado" : ""}"
                    data-code="${codigo}" data-merchant="${loja || codigo}" data-discount="${descontoStr}"
                    data-tipo="${tipo}" data-valor="${valorDesc}" data-descricao="${descricao}"
                    ${expirado ? "disabled aria-disabled='true'" : ""}>
                    ${expirado ? "Cupom expirado" : "Resgatar cupom"}
                </button>
            </div>
            <div class="terms-panel" data-terms-panel>
                <button class="panel-close" title="Fechar" aria-label="Fechar">↩</button>
                <div class="panel-row"><span class="badge ${badgeClass}">${codigo}</span></div>
                <h4 class="panel-title">${descricao}</h4>
                ${dataFmt ? `<div class="panel-expire">${expirado ? "Expirado em" : "Expira em"} ${dataFmt}</div>` : ""}
                <div class="panel-info"><span class="i">i</span><span>${cupom.termos || "Consulte as condições de uso."}</span></div>
                <button class="btn redeem-btn${expirado ? " btn--expirado" : ""}"
                    data-code="${codigo}" data-merchant="${loja || codigo}" data-discount="${descontoStr}"
                    data-tipo="${tipo}" data-valor="${valorDesc}" data-descricao="${descricao}"
                    ${expirado ? "disabled aria-disabled='true'" : ""}>
                    ${expirado ? "Cupom expirado" : "Resgatar cupom"}
                </button>
            </div>`;
        list.appendChild(article);
    });

    bindEventos();
}

// ===== FALLBACK: cupons fixos caso a API não retorne nada =====
const CUPONS_FALLBACK = [
    { codigo: "ARA6",    descricao: "6% OFF em compras acima de R$50 na Araujo",          desconto: 6,  loja: "Drogaria Araujo", validade: "2026-12-31", ativo: true,  termos: "Cupom não válido para compra de medicamentos." },
    { codigo: "PHILCO10",descricao: "10% OFF em compras de dois produtos ou mais",         desconto: 10, loja: "Philco",          validade: "2026-12-31", ativo: true,  termos: "Válido na compra mínima de 2 itens participantes." },
    { codigo: "PONTO10", descricao: "10% OFF em compras de utensílios de cozinha",         desconto: 10, loja: "Ponto",           validade: "2026-06-30", ativo: true,  termos: "Promoção limitada ao estoque. Um uso por CPF." },
    { codigo: "PHILCO5", descricao: "5% OFF em compras de itens lançamento",               desconto: 5,  loja: "Philco",          validade: "2026-09-30", ativo: true,  termos: "Não cumulativo com outras promoções." },
];

// ===== CUPONS RESGATADOS (disponíveis para uso no checkout) =====
const CHAVE_CUPONS_RESGATADOS = "bulbe:cupons:resgatados";

function salvarCupomResgatado(cupom) {
    let lista = [];
    try { lista = JSON.parse(localStorage.getItem(CHAVE_CUPONS_RESGATADOS) || "[]"); } catch {}
    lista = lista.filter(c => c.codigo !== cupom.codigo);
    lista.push(cupom);
    localStorage.setItem(CHAVE_CUPONS_RESGATADOS, JSON.stringify(lista));
}

// ===== CARREGA CUPONS DA API =====
async function carregarCupons() {
    try {
        if (window.api) {
            const resposta = await window.api.cupons.listar();
            const lista = Array.isArray(resposta) ? resposta : (resposta.cupons || resposta.data || []);
            if (lista.length) { renderCupons(lista); return; }
        }
    } catch (err) {
        console.warn("Erro ao carregar cupons da API, usando fallback:", err);
    }
    renderCupons(CUPONS_FALLBACK);
}

// ===== BIND DE EVENTOS (reexecutado após renderizar) =====
function bindEventos() {
    const list = document.getElementById("couponList");
    if (!list) return;

    // Busca filtra os cards renderizados
    const searchInput = document.getElementById("search");
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = "1";
        searchInput.addEventListener("input", (e) => {
            const q = e.target.value.toLowerCase();
            list.querySelectorAll(".card").forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(q) ? "" : "none";
            });
        });
    }

    // Abrir / fechar termos
    list.querySelectorAll("[data-terms]").forEach(btn => {
        btn.addEventListener("click", () => {
            const card  = btn.closest(".card");
            const panel = card.querySelector("[data-terms-panel]");
            list.querySelectorAll(".card.terms-open").forEach(open => {
                if (open !== card) open.classList.remove("terms-open");
            });
            card.classList.toggle("terms-open");
            if (panel) panel.setAttribute("aria-expanded", card.classList.contains("terms-open") ? "true" : "false");
        });
    });

    list.querySelectorAll(".panel-close").forEach(b => {
        b.addEventListener("click", () => b.closest(".card").classList.remove("terms-open"));
    });

    // Resgatar cupom
    list.querySelectorAll(".redeem-btn:not([disabled])").forEach(btn => {
        btn.addEventListener("click", async () => {
            const code     = btn.dataset.code;
            const merchant = btn.dataset.merchant;
            const discount = btn.dataset.discount;
            const tipo     = btn.dataset.tipo || "%";
            const valor    = Number(btn.dataset.valor || 0);
            const descricao = btn.dataset.descricao || "";

            btn.disabled = true;
            try {
                if (window.api) await window.api.cupons.buscar(code);
                localStorage.setItem("bulbe:cupom", code);
                salvarCupomResgatado({ codigo: code, tipo, desconto: valor, loja: merchant, descricao });
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
}

// ===== BOTÃO VOLTAR =====
document.querySelector(".back-btn")?.addEventListener("click", () => window.history.back());

// ===== INIT =====
document.addEventListener("DOMContentLoaded", carregarCupons);
