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

/* Concluir compra → envia pagamento via API e redireciona APENAS se houver sucesso */
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

  // SE NÃO ESTIVER LOGADO OU FALTAR PEDIDO: Bloqueia a aprovação mágica!
  if (!window.api?.estaLogado() || !pedidoId) {
    alert("Erro: Você precisa estar logado e com pedido ativo para finalizar a compra.");
    window.location.href = "/altafidelidade/login/login.html"; 
    return; 
  }

  btnFinish.disabled = true;
  try {
    const parcelasStr = getSelectedInstallmentText() || "1x";
    const parcelas = parseInt(parcelasStr.split("x")[0]) || 1; // Ex: pega apenas o "3" do "3x"

    // Envia para a API real do backend
    await window.api.pedidos.pagarCartao(pedidoId, {
      numero:    onlyDigits(elNumber?.value || ""),
      validade:  elExpiry?.value || "",
      cvv:       onlyDigits(elCVV?.value || ""),
      parcelas,
    });
    
    // Apenas se a API não der erro -> Vai para o Processando (e sucesso)
    localStorage.removeItem("bulbe:pedidoId");
    localStorage.removeItem("bulbe:cart");
    localStorage.removeItem("bulbe:checkoutItems");
    window.location.href = "/altafidelidade/processando compra/html/index.html";

  } catch (erro) {
    // Se a API retornar erro/status falho -> Vai para a Recusada
    btnFinish.disabled = false;
    window.location.href = "/altafidelidade/pagamento e recusado/status-recusada.html";
  }
}
);

async function carregarDadosDinamicos() {
  // 1. O Endereço puxamos do localStorage (que é onde a tela de checkout salva os dados do cliente)
  const cliente = JSON.parse(localStorage.getItem('checkoutCustomer') || '{}');
  const elEndereco = document.getElementById("enderecoCobranca");
  
  if (elEndereco && cliente.rua) {
    elEndereco.innerHTML = `${cliente.rua}, ${cliente.numero || 'S/N'} ${cliente.compl ? ', ' + cliente.compl : ''}<br>${cliente.cep || ''} ${cliente.cidade || ''}, ${cliente.estado || ''}`;
  } else if (elEndereco) {
    elEndereco.innerHTML = "Endereço não encontrado.";
  }

  // 2. O Total nós puxamos direto do PEDIDO recém criado no Backend
  const elGrid = document.getElementById("parcelGrid");
  const pedidoId = localStorage.getItem("bulbe:pedidoId");

  // Só continua se tiver os elementos, estiver logado e houver um ID de pedido salvo
  if (!elGrid || !pedidoId || !window.api?.estaLogado()) return;

  try {
    // Bate no backend: GET /api/v1/pedidos/:id
    const pedido = await window.api.pedidos.buscar(pedidoId);
    const total = pedido.total; // Pega o total exato do banco de dados já com descontos

    if (total > 0) {
      elGrid.innerHTML = ""; // Limpa os botões mockados do HTML
      const maxParcelas = 6;
      
      for (let i = 1; i <= maxParcelas; i++) {
        // Regra simples: para as últimas parcelas (a partir de 4x) aplica juros
        let valorComJuros = total;
        if (i > 3) valorComJuros = total * (1 + (i * 0.02)); 

        const valorParcela = (valorComJuros / i).toFixed(2).replace(".", ",");
        const valorJurosStr = (valorComJuros - total).toFixed(2).replace(".", ",");
        
        const btn = document.createElement("button");
        btn.className = "parcel" + (i === 1 ? " is-selected" : "");
        btn.setAttribute("role", "radio");
        btn.setAttribute("aria-checked", i === 1 ? "true" : "false");
        btn.dataset.val = `${i}x ${valorParcela}`;
        
        let jurosTexto = i <= 3 ? "Sem taxa de juros" : `R$${valorJurosStr} de juros`;
        
        btn.innerHTML = `
          <strong>${i} x R$${valorParcela}</strong>
          <small>${jurosTexto}</small>
        `;
        elGrid.appendChild(btn);
      }
      wireInstallments(); // Reconecta o evento de clique aos novos botões
      refreshCTA();
    }
  } catch (error) {
    console.error("Erro ao buscar pedido do backend:", error);
  }
}

// Invoca a função
carregarDadosDinamicos();