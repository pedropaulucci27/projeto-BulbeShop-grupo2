/* Validação simples para habilitar o botão “Concluir compra”
   Requisitos: número (16 dígitos), expiração selecionada, CVV (3–4 dígitos) */

const elNumber = document.getElementById('debitNumber');
const elExpiry = document.getElementById('debitExpiry');
const elCVV    = document.getElementById('debitCVV');
const btn      = document.getElementById('btnFinish');
const hint     = document.getElementById('ctaHint');

// máscara rápida do cartão (0000 0000 0000 0000)
elNumber.addEventListener('input', () => {
  let v = elNumber.value.replace(/\D/g, '').slice(0,16);
  v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
  elNumber.value = v;
  validate();
});

elCVV.addEventListener('input', () => {
  elCVV.value = elCVV.value.replace(/\D/g, '').slice(0,4);
  validate();
});
elExpiry.addEventListener('change', validate);

function validate(){
  // limpa estados
  clearInvalid(elNumber); clearInvalid(elCVV); clearInvalid(elExpiry.closest('.select-inline'));

  const digits = elNumber.value.replace(/\s/g,'');
  const okNumber = /^\d{16}$/.test(digits);
  const okExpiry = !!elExpiry.value;
  const okCVV    = /^\d{3,4}$/.test(elCVV.value);

  // marca inválidos (visual leve)
  if(!okNumber && elNumber.value.length) markInvalid(elNumber);
  if(!okExpiry) markInvalid(elExpiry.closest('.select-inline'));
  if(!okCVV && elCVV.value.length) markInvalid(elCVV);

  const allOk = okNumber && okExpiry && okCVV;
  btn.disabled = !allOk;
  hint.textContent = allOk ? '' : 'Preencha os campos obrigatórios corretamente.';
}

function markInvalid(el){ el.classList.add('is-invalid'); }
function clearInvalid(el){ el.classList.remove('is-invalid'); }

// Ação do botão — redirect tratado pelo IIFE debito.js abaixo

// valida no load
validate();
// debito.js
(function () {
  // ajuste para o caminho exato da sua página "processando compra"
  const PROCESSING_URL = '/altafidelidade/processando compra/html/index.html';
  // chave única de armazenamento desta página
  const STORAGE_KEY = 'bulbe:debito:index';

  // util: pega valor representativo de um campo
  function readField(el) {
    if (!el || !el.name && !el.id) return undefined;
    const type = (el.type || '').toLowerCase();
    if (type === 'password') return undefined;  // nunca salvar senha
    if (['cccvv', 'ccnumber'].includes((el.name || el.id).toLowerCase())) return undefined;

    if (type === 'checkbox') return !!el.checked;
    if (type === 'radio')    return el.checked ? el.value : undefined;
    return el.value;
  }

  // util: escreve valor no campo
  function writeField(el, val) {
    if (val === undefined) return;
    const type = (el.type || '').toLowerCase();
    if (type === 'checkbox') {
      el.checked = !!val;
    } else if (type === 'radio') {
      el.checked = (el.value === val);
    } else {
      el.value = val;
    }
    // dispara evento de change/input para componentes que dependem disso
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // seleciona todos os campos relevantes da página
  function allFields(scope = document) {
    return Array.from(scope.querySelectorAll('input, select, textarea'));
  }

  // salva estado atual
  function saveForm() {
    const data = {};
    allFields().forEach(el => {
      const key = el.name || el.id;
      if (!key) return;
      const val = readField(el);
      if (val !== undefined) data[key] = val;
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  // restaura estado salvo
  function restoreForm() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    if (!data || typeof data !== 'object') return;

    Object.keys(data).forEach(key => {
      const val = data[key];

      // tenta por [name] primeiro (melhor para grupos de rádio), depois por [id]
      let els = Array.from(document.querySelectorAll(`[name="${CSS.escape(key)}"]`));
      if (els.length === 0) {
        const byId = document.getElementById(key);
        if (byId) els = [byId];
      }
      els.forEach(el => writeField(el, val));
    });
  }

  // debounce leve para autosave
  let t;
  function scheduleSave() {
    clearTimeout(t);
    t = setTimeout(saveForm, 180);
  }

  // wire: salva a cada input/change
  function wireAutosave() {
    allFields().forEach(el => {
      el.addEventListener('input', scheduleSave, { passive: true });
      el.addEventListener('change', scheduleSave);
    });
  }

  // botão concluir compra
  function wireFinish() {
    const btn = document.getElementById('btnFinish') || document.querySelector('[data-action="finish"]');
    if (!btn) return;
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (btn.disabled) return;

      try { localStorage.setItem('bulbe:paymentMethod', 'debito'); } catch {}
      saveForm();

      const pedidoId = localStorage.getItem('bulbe:pedidoId');
      if (window.api?.estaLogado() && pedidoId) {
        btn.disabled = true;
        try {
          const numero  = document.getElementById('debitNumber')?.value.replace(/\s/g, '') || '';
          const expiry  = document.getElementById('debitExpiry')?.value || '';
          const cvv     = document.getElementById('debitCVV')?.value || '';
          await window.api.pedidos.pagarDebito(pedidoId, { numero, validade: expiry, cvv });
          // localStorage.removeItem('bulbe:pedidoId'); // comentado para a tela final conseguir ler
          localStorage.removeItem('bulbe:cart');
          localStorage.removeItem('bulbe:checkoutItems');
          window.location.href = PROCESSING_URL;
        } catch {
          btn.disabled = false;
          window.location.href = '/altafidelidade/pagamento e recusado/status-recusada.html';
        }
      } else {
        window.location.href = PROCESSING_URL;
      }
    });
  }

  // inicializa
  restoreForm();
  wireAutosave();
  wireFinish();
})();

async function carregarDadosDebito() {
  const cliente = JSON.parse(localStorage.getItem('checkoutCustomer') || '{}');
  const elEndereco = document.getElementById("enderecoCobranca");
  
  if (elEndereco && cliente.rua) {
    elEndereco.innerHTML = `${cliente.rua}, ${cliente.numero || 'S/N'}${cliente.compl ? ', ' + cliente.compl : ''}<br>${cliente.cep || ''} ${cliente.cidade || ''}, ${cliente.estado || ''}`;
  } else if (elEndereco) {
    elEndereco.innerHTML = "Endereço não encontrado.";
  }

  const pedidoId = localStorage.getItem("bulbe:pedidoId");
  let total = 0;

  if (pedidoId && window.api?.estaLogado()) {
    try {
      const pedido = await window.api.pedidos.buscar(pedidoId);
      total = pedido.total;
    } catch(e) {
      console.error(e);
    }
  }

  // Fallback: Se falhar por causa do ID, busca o último pedido do histórico da pessoa
  if ((!total || total <= 0) && window.api?.estaLogado()) {
      try {
          const historico = await window.api.pedidos.listar();
          if (historico && historico.length > 0) {
              total = historico[0].total; // pega o mais recente
              localStorage.setItem("bulbe:pedidoId", historico[0].id); // corrige o ID salvo
          }
      } catch(e) {}
  }

  // Último recurso: carrinho offline
  if (!total || total <= 0) {
      try {
          const checkoutItems = JSON.parse(localStorage.getItem('bulbe:checkoutItems') || '[]');
          total = checkoutItems.reduce((soma, item) => soma + (parseFloat(item.price || 0) * parseInt(item.qty || 1)), 0);
      } catch(e) {}
  }

  const boxValor = document.getElementById("valorTotalBox");
  if (boxValor) {
    boxValor.innerHTML = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
}

carregarDadosDebito();