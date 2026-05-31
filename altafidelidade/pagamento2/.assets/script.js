(function () {
  const btn = document.getElementById('btnSave');

  // ── País (select-block) ───────────────────────────────────────────
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
    });
    document.addEventListener('click', (e) => {
      if (!selPais.contains(e.target)) selPais.setAttribute('aria-expanded', 'false');
    });
  }

  // ── Campos de estado e cidade (somente leitura, preenchidos pelo CEP) ─
  const inpEstado = document.getElementById('estado');
  const inpCidade = document.getElementById('cidade');

  // ── Campos básicos ───────────────────────────────────────────────
  const inpNome   = document.getElementById('nomeCompleto');
  const inpFone   = document.getElementById('telefone');
  const inpCPF    = document.getElementById('cpf');
  const inpCEP    = document.getElementById('cep');
  const inpRua    = document.getElementById('rua');
  const inpNumero = document.getElementById('numero');
  const inpCompl  = document.getElementById('complemento');
  const inpBairro = document.getElementById('bairro');
  const cbSemNumero = document.querySelector('.checkbox-inline input[type="checkbox"]');

  cbSemNumero?.addEventListener('change', () => {
    if (cbSemNumero.checked) {
      if (inpNumero) { inpNumero.value = ''; inpNumero.disabled = true; }
    } else {
      if (inpNumero) inpNumero.disabled = false;
    }
    if (window.validarCampos) window.validarCampos();
  });

  // ── Frete via API ─────────────────────────────────────────────────
  const ulFrete = document.getElementById('freteList');

  function getFreteValue() {
    const checked = ulFrete?.querySelector('input[name="frete"]:checked');
    if (!checked) return '';
    const li        = checked.closest('.frete-item');
    const labelText = li?.querySelector('label span')?.textContent?.trim() || '';
    const priceText = li?.querySelector('strong')?.textContent?.trim() || '';
    return `${labelText} | ${priceText}`;
  }

  function renderOpcoesFrete(opcoes) {
    if (!ulFrete) return;
    ulFrete.innerHTML = opcoes.map(op => `
      <li class="frete-item">
        <label>
          <input type="radio" name="frete">
          <span>${op.transportadora} (${op.prazo})</span>
        </label>
        <strong>R$ ${Number(op.preco).toFixed(2).replace('.', ',')}</strong>
      </li>`).join('');

    ulFrete.querySelectorAll('input[name="frete"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (window.validarCampos) window.validarCampos();
      });
    });
  }

  async function buscarFrete(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    try {
      console.log('Buscando frete para CEP:', cepLimpo);
      const resposta = await fetch(`http://localhost:3000/api/v1/frete?cep=${cepLimpo}`);
      const dados    = await resposta.json();
      console.log('Resposta da API:', dados);
      if (dados.opcoes) {
        renderOpcoesFrete(dados.opcoes);
        if (dados.estado && inpEstado) inpEstado.value = dados.estado;
        if (dados.cidade && inpCidade) inpCidade.value = dados.cidade;
        if (window.validarCampos) window.validarCampos();
      }
    } catch (err) {
      console.error('Erro ao buscar frete:', err);
    }
  }

  // Busca frete ao sair do campo CEP
  inpCEP?.addEventListener('blur', () => {
    const cep = inpCEP.value.trim();
    if (cep.replace(/\D/g, '').length === 8) buscarFrete(cep);
  });

  // ── Reidrata campos com dados salvos ─────────────────────────────
  const saved = JSON.parse(localStorage.getItem('checkoutCustomer') || '{}');
  if (saved.pais && paisLabel) paisLabel.textContent = saved.pais;

  if (inpNome   && saved.nome)   inpNome.value   = saved.nome;
  if (inpFone   && saved.fone)   inpFone.value   = saved.fone;
  if (inpCPF    && saved.cpf)    inpCPF.value    = saved.cpf;
  if (inpCEP    && saved.cep)    inpCEP.value    = saved.cep;
  if (inpRua    && saved.rua)    inpRua.value    = saved.rua;
  if (inpCompl  && saved.compl)  inpCompl.value  = saved.compl;
  if (inpBairro && saved.bairro) inpBairro.value = saved.bairro;
  if (inpEstado && saved.estado) inpEstado.value = saved.estado;
  if (inpCidade && saved.cidade) inpCidade.value = saved.cidade;

  if (inpNumero && saved.numero && saved.numero !== 'S/N') inpNumero.value = saved.numero;
  if (cbSemNumero && saved.numero === 'S/N') {
    cbSemNumero.checked = true;
    if (inpNumero) inpNumero.disabled = true;
  }

  if (saved.cep) buscarFrete(saved.cep);

  // ── Pré-preenche com dados do perfil se campo vazio ──────────────
  if (window.api && window.api.estaLogado()) {
    window.api.usuario.perfil()
      .then(perfil => {
        if (inpNome && !inpNome.value && perfil.nome)     inpNome.value = perfil.nome;
        if (inpFone && !inpFone.value && perfil.telefone) inpFone.value = perfil.telefone;
        if (inpCPF  && !inpCPF.value  && perfil.cpf)     inpCPF.value  = perfil.cpf;
        if (window.validarCampos) window.validarCampos();
      })
      .catch(() => {});
  }

  // ── Coleta dados do formulário ────────────────────────────────────
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
      estado: (inpEstado?.value || '').trim(),
      cidade: (inpCidade?.value || '').trim(),
      frete:  getFreteValue(),
    };
    if (cbSemNumero?.checked) data.numero = 'S/N';
    return data;
  }

  wirePais();

  // ── Expõe funções globalmente ─────────────────────────────────────
  window.buscarFrete       = buscarFrete;
  window.renderOpcoesFrete = renderOpcoesFrete;

  // ── Salva e redireciona para o método de pagamento ────────────────
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

    window.location.href = '/altafidelidade/pagamento1/pagamento.html';
  });
})();


// ── Validação dos campos obrigatórios ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const btnSave = document.getElementById('btnSave');

  const camposObrigatorios = [
    'nomeCompleto', 'telefone', 'cpf', 'cep', 'rua', 'numero', 'bairro',
  ];

  function validarCampos() {
    let valido = true;

    camposObrigatorios.forEach(id => {
      const campo = document.getElementById(id);
      if (id === 'numero' && document.querySelector('.checkbox-inline input[type="checkbox"]')?.checked) {
        // se marcou 'Sem número', o campo numero não precisa ser validado
      } else if (!campo.value.trim()) {
        valido = false;
      }
    });

    const paisSelecionado =
      document.querySelector('#countrySelect .select-placeholder')?.textContent.trim() !== 'Selecionar';
    if (!paisSelecionado) valido = false;

    // Cidade e Estado não bloqueiam mais o botão
    const estadoPreenchido = (document.getElementById('estado')?.value || '').trim() !== '';
    const cidadePreenchida = (document.getElementById('cidade')?.value || '').trim() !== '';

    const freteSelecionado = document.querySelector("input[name='frete']:checked");
    if (!freteSelecionado) valido = false;

    btnSave.disabled = !valido;
    btnSave.classList.toggle('enabled', valido);
  }

  window.validarCampos = validarCampos;

  camposObrigatorios.forEach(id => {
    document.getElementById(id).addEventListener('input', validarCampos);
  });

  document.querySelectorAll("input[name='frete']").forEach(el => {
    el.addEventListener('change', validarCampos);
  });

  document.getElementById('countrySelect').addEventListener('click', validarCampos);

  validarCampos();
});