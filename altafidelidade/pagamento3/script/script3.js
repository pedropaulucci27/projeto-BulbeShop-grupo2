/* ===== Helpers ===== */
const onlyDigits = (s = "") => s.replace(/\D/g, "");

/* DOM */
const elNumber  = document.getElementById("ccNumber");
const elExpiry  = document.getElementById("ccExpiry");
const elCVV     = document.getElementById("ccCVV");
const elGrid    = document.getElementById("parcelGrid");
const btnFinish = document.getElementById("btnFinish");

const STORAGE_KEY = "bulbe.checkout.card"; // chave única

/* Persistência */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveState(partial = {}) {
  const prev = loadState() || {};
  const next = { ...prev, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/* Validação básica */
function isCardValid() {
  if (!elNumber || !elExpiry || !elCVV) return false;

  const num = onlyDigits(elNumber.value);
  const cvv = onlyDigits(elCVV.value);

  const numberOK = num.length >= 13 && num.length <= 19;
  const cvvOK    = cvv.length === 3 || cvv.length === 4;
  const expOK    = elExpiry.selectedIndex > 0;

  return numberOK && cvvOK && expOK && hasInstallment();
}

/* Parcela selecionada */
function getSelectedInstallmentEl() {
  return elGrid?.querySelector(".parcel.is-selected") || null;
}
function hasInstallment() {
  return !!getSelectedInstallmentEl();
}
function getSelectedInstallmentText() {
  const el = getSelectedInstallmentEl();
  return el ? el.dataset.val || el.textContent.trim() : "";
}

/* Habilitar CTA */
function refreshCTA() {
  if (!btnFinish) return;
  btnFinish.disabled = !isCardValid();
}

/* Seleção de parcelas + persistência */
function wireInstallments() {
  if (!elGrid) return;
  elGrid.addEventListener("click", (ev) => {
    const card = ev.target.closest(".parcel");
    if (!card) return;

    elGrid.querySelectorAll(".parcel").forEach((p) => {
      p.classList.remove("is-selected");
      p.setAttribute("aria-checked", "false");
      p.tabIndex = -1;
    });

    card.classList.add("is-selected");
    card.setAttribute("aria-checked", "true");
    card.tabIndex = 0;

    // salva escolha
    saveState({ installment: getSelectedInstallmentText() });

    refreshCTA();
  });
}

/* Máscara leve de número + persistência */
elNumber?.addEventListener(
  "input",
  () => {
    const digits = onlyDigits(elNumber.value).slice(0, 19);
    const groups = digits.match(/.{1,4}/g) || [];
    elNumber.value = groups.join(" ");
    saveState({ number: elNumber.value });
    refreshCTA();
  },
  { passive: true }
);

/* Persistência dos outros campos */
elCVV?.addEventListener(
  "input",
  () => {
    saveState({ cvv: elCVV.value });
    refreshCTA();
  },
  { passive: true }
);

elExpiry?.addEventListener("change", () => {
  saveState({ expiry: elExpiry.value, expiryIndex: elExpiry.selectedIndex });
  refreshCTA();
});

/* Restaura estado ao abrir a página */
(function restoreFromStorage() {
  const state = loadState();
  if (!state) return;

  if (state.number && elNumber) elNumber.value = state.number;
  if (typeof state.expiryIndex === "number" && elExpiry) {
    elExpiry.selectedIndex = state.expiryIndex;
  }
  if (state.cvv && elCVV) elCVV.value = state.cvv;

  // marcar parcela salva
  if (state.installment && elGrid) {
    const btn = Array.from(elGrid.querySelectorAll(".parcel")).find(
      (b) => (b.dataset.val || b.textContent.trim()) === state.installment
    );
    if (btn) {
      btn.classList.add("is-selected");
      btn.setAttribute("aria-checked", "true");
    }
  }

  refreshCTA();
})();

/* Inicializa */
wireInstallments();
refreshCTA();

/* Concluir compra → envia pagamento via API e redireciona */
btnFinish?.addEventListener("click", async () => {
  if (btnFinish.disabled) return;

  saveState({
    number: elNumber?.value || "",
    expiry: elExpiry?.value || "",
    expiryIndex: elExpiry?.selectedIndex ?? 0,
    cvv: elCVV?.value || "",
    installment: getSelectedInstallmentText(),
  });

  const pedidoId = localStorage.getItem("bulbe:pedidoId");

  if (window.api?.estaLogado() && pedidoId) {
    btnFinish.disabled = true;
    try {
      const parcelas = parseInt(getSelectedInstallmentText()) || 1;
      await window.api.pedidos.pagarCartao(pedidoId, {
        numero:    onlyDigits(elNumber?.value || ""),
        validade:  elExpiry?.value || "",
        cvv:       onlyDigits(elCVV?.value || ""),
        parcelas,
      });
      localStorage.removeItem("bulbe:pedidoId");
      localStorage.removeItem("bulbe:cart");
      localStorage.removeItem("bulbe:checkoutItems");
      window.location.href = "/altafidelidade/processando compra/html/index.html";
    } catch {
      btnFinish.disabled = false;
      window.location.href = "/altafidelidade/pagamento e recusado/status-recusada.html";
    }
  } else {
    window.location.href = "/altafidelidade/processando compra/html/index.html";
  }
});
