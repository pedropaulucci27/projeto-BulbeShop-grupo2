// /altafidelidade/pagamento2/.assets/script.js
(function () {
  const btn = document.getElementById('btnSave');

  // ---------- País (select-block) ----------
  const selPais   = document.getElementById('countrySelect');
  const paisHead  = selPais?.querySelector('.select-head');
  const paisList  = selPais?.querySelector('.select-list');
  const paisLabel = selPais?.querySelector('.select-placeholder');

  const getPaisValue = () => {
    const t = (paisLabel?.textContent || '').trim();
    return /selecion/i.test(t) ? '' : t;
  };

  function wirePais() {
    paisHead?.addEventListener('click', () => {
      const open = selPais.getAttribute('aria-expanded') === 'true';
      selPais.setAttribute('aria-expanded', String(!open));
    });
    paisList?.addEventListener('click', (ev) => {
      const li = ev.target.closest('.opt');
      if (!li) return;
      if (paisLabel) paisLabel.textContent = li.textContent.trim();
      selPais.setAttribute('aria-expanded', 'false');
      refreshCTA();
    });
    document.addEventListener('click', (e) => {
      if (!selPais.contains(e.target)) selPais.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------- Estado/Cidade (inline-enhanced) ----------
  const selEstado = document.getElementById('stateSelect');
  const selCidade = document.getElementById('citySelect');

  const setInlineValue = (container, value) => {
    const lbl = container?.querySelector('.inline-label');
    if (lbl && value) lbl.textContent = value;
  };

  function wireInline(container) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const head = e.target.closest('.inline-head');
      const opt  = e.target.closest('.inline-opt');
      if (head) {
        const open = container.getAttribute('aria-expanded') === 'true';
        container.setAttribute('aria-expanded', String(!open));
        return;
      }
      if (opt) {
        setInlineValue(container, opt.textContent.trim());
        container.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) container.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------- Campos básicos ----------
  const sectionCards = Array.from(document.querySelectorAll('.card'));
  const camposComprador = sectionCards[1]?.querySelectorAll('.field .input') || [];
  const [inpNome, inpFone, inpCPF] = camposComprador;

  const camposEndereco = sectionCards[2]?.querySelectorAll('.field .input') || [];
  const [inpCEP, inpRua, inpNumero, inpCompl, inpBairro] = camposEndereco;
  const cbSemNumero = document.querySelector('.checkbox-inline input[type="checkbox"]');

  cbSemNumero?.addEventListener('change', () => {
    if (cbSemNumero.checked) {
      if (inpNumero) {
        inpNumero.value = '';
        inpNumero.disabled = true;
      }
    } else {
      if (inpNumero) inpNumero.disabled = false;
    }
  });

  // ---------- Frete (obrigatório e exclusivo) ----------
  const ulFrete = document.getElementById('freteList');
  const fretes  = Array.from(ulFrete?.querySelectorAll('input[name="frete"]') || []);
  function getFreteValue() {
    const el = fretes.find(f => f.checked);
    if (!el) return '';
    const li = el.closest('.frete-item');
    const labelText = li?.querySelector('label span')?.textContent?.trim() || '';
    const priceText = li?.querySelector('strong')?.textContent?.trim() || '';
    return `${labelText} | ${priceText}`;
  }
  fretes.forEach(chk => {
    chk.addEventListener('change', () => {
      if (chk.checked) fretes.forEach(o => { if (o !== chk) o.checked = false; });
    });
  });

  // ---------- Reidratar se houver ----------
  const saved = JSON.parse(localStorage.getItem('checkoutCustomer') || '{}');
  if (saved.pais && paisLabel) paisLabel.textContent = saved.pais;

  if (inpNome && saved.nome)   inpNome.value = saved.nome;
  if (inpFone && saved.fone)   inpFone.value = saved.fone;
  if (inpCPF  && saved.cpf)    inpCPF.value  = saved.cpf;

  if (inpCEP   && saved.cep)    inpCEP.value   = saved.cep;
  if (inpRua   && saved.rua)    inpRua.value   = saved.rua;
  if (inpNumero && saved.numero && saved.numero !== 'S/N') inpNumero.value = saved.numero;
  if (cbSemNumero && saved.numero === 'S/N') {
    cbSemNumero.checked = true;
    if (inpNumero) inpNumero.disabled = true;
  }
  if (inpCompl && saved.compl)  inpCompl.value  = saved.compl;
  if (inpBairro && saved.bairro)inpBairro.value = saved.bairro;

  if (saved.estado) setInlineValue(selEstado, saved.estado);
  if (saved.cidade) setInlineValue(selCidade, saved.cidade);

  if (saved.frete) {
    fretes.forEach(chk => {
      const li = chk.closest('.frete-item');
      const labelText = li?.querySelector('label span')?.textContent?.trim() || '';
      if (saved.frete.startsWith(labelText)) chk.checked = true;
    });
  }

  // ---------- Coletar + Validar ----------
  function collect() {
    const data = {
      pais:   getPaisValue(),
      nome:   (inpNome?.value   || '').trim(),
      fone:   (inpFone?.value   || '').trim(),
      cpf:    (inpCPF?.value    || '').trim(),
      cep:    (inpCEP?.value    || '').trim(),
      rua:    (inpRua?.value    || '').trim(),
      numero: (inpNumero?.value || '').trim(),
      compl:  (inpCompl?.value  || '').trim(),
      bairro: (inpBairro?.value || '').trim(),
      // estado/cidade continuam sendo salvos, mas não são obrigatórios nesta etapa
      estado: selEstado?.querySelector('.inline-label')?.textContent?.trim() || '',
      cidade: selCidade?.querySelector('.inline-label')?.textContent?.trim() || '',
      frete:  getFreteValue()
    };
    if (cbSemNumero?.checked) data.numero = 'S/N';
    return data;
  }

  wirePais();
  wireInline(selEstado);
  wireInline(selCidade);

  // ---------- Salvar + redirecionar ----------
  btn?.addEventListener('click', () => {
    if (btn.disabled) return;
    const data = collect();
    localStorage.setItem('checkoutCustomer', JSON.stringify(data));

    const method = (localStorage.getItem('payMethod') || '').toLowerCase();
    if (method.includes('débito') || method.includes('debito')) {
      window.location.href = '/altafidelidade/cartao de debito/index.html';
      return;
    }
    if (method.includes('crédito') || method.includes('credito')) {
      window.location.href = '/altafidelidade/pagamento3/pagamento3.html';
      return;
    }
        if (method.includes('pix')) {
      window.location.href = '/altafidelidade/pix/pix.html';
      return;
    }
        if (method.includes('boleto')) {
      window.location.href = '/altafidelidade/boleto/boleto.html';
      return;
    }


    // fallback
    window.location.href = '/altafidelidade/pagamento1/pagamento.html';
  });
})();


document.addEventListener("DOMContentLoaded", function () {

  const btnSave = document.getElementById("btnSave");

  // Lista dos campos obrigatórios por ID
  const camposObrigatorios = [
    "nomeCompleto",
    "telefone",
    "cpf",
    "cep",
    "rua",
    "numero",
    "bairro"
  ];

  function validarCampos() {
    let valido = true;

    // Validação dos campos de texto
    camposObrigatorios.forEach(id => {
      const campo = document.getElementById(id);
      if (!campo.value.trim()) {
        valido = false;
      }
    });

    // Validação do País
    const paisSelecionado =
      document.querySelector("#countrySelect .select-placeholder").textContent.trim() !== "Selecionar";
    if (!paisSelecionado) valido = false;

    // Estado
    const estadoSelecionado =
      document.querySelector("#stateSelect .inline-label").textContent.trim() !== "Selecione o estado";
    if (!estadoSelecionado) valido = false;

    // Cidade
    const cidadeSelecionada =
      document.querySelector("#citySelect .inline-label").textContent.trim() !== "Selecione a cidade";
    if (!cidadeSelecionada) valido = false;

    // Frete
    const freteSelecionado = document.querySelector("input[name='frete']:checked");
    if (!freteSelecionado) valido = false;

    // Ativa / Desativa botão
    btnSave.disabled = !valido;
    btnSave.classList.toggle("enabled", valido);
  }

  // Eventos de atualização
  camposObrigatorios.forEach(id => {
    document.getElementById(id).addEventListener("input", validarCampos);
  });

  document.querySelectorAll("input[name='frete']").forEach(el => {
    el.addEventListener("change", validarCampos);
  });

  document.getElementById("countrySelect").addEventListener("click", validarCampos);
  document.getElementById("stateSelect").addEventListener("click", validarCampos);
  document.getElementById("citySelect").addEventListener("click", validarCampos);

  validarCampos(); // Evita botão ativado inicial
});

