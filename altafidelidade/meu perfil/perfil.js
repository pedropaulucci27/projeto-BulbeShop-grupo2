/* =========================================================
   CARREGAR PERFIL DA API
   ========================================================= */
async function carregarPerfil() {
  if (!window.api?.estaLogado()) return;

  try {
    const usuario = await window.api.usuario.perfil();
    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl && usuario.nome) nomeEl.value = usuario.nome;

    const emailEl = document.getElementById('email');
    if (emailEl && usuario.email) emailEl.value = usuario.email;
  } catch {}

  try {
    const pontos = await window.api.usuario.pontos();
    const btn = document.getElementById('abrirPontosBulbe');
    if (btn && pontos?.pontos !== undefined) btn.innerHTML = `${pontos.pontos} pts &gt;`;
  } catch {}
}

async function salvarPerfil(e) {
  e.preventDefault();
  if (!window.api?.estaLogado()) return;

  const nome  = document.getElementById('nomeUsuario')?.value.trim();
  const senha = document.getElementById('senha')?.value;
  const btn   = e.target.querySelector('[type="submit"]');

  const dados = {};
  if (nome)  dados.nome  = nome;
  if (senha && senha !== '************') dados.senha = senha;

  if (!Object.keys(dados).length) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Salvando…'; }

  try {
    await window.api.usuario.atualizarPerfil(dados);
    if (btn) { btn.textContent = 'Salvo!'; setTimeout(() => { btn.disabled = false; btn.textContent = 'Alterar Perfil'; }, 2000); }
  } catch {
    if (btn) { btn.disabled = false; btn.textContent = 'Alterar Perfil'; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarPerfil();
  document.querySelector('form.form')?.addEventListener('submit', salvarPerfil);
});

/* =========================================================
   MOSTRAR/OCULTAR SENHA
   ========================================================= */
const toggle = document.getElementById('toggleSenha');
const senha = document.getElementById('senha');

if (toggle && senha) {
    toggle.addEventListener('click', () => {
        senha.type = senha.type === 'password' ? 'text' : 'password';
    });
}

// Máscara simples para CPF e telefone (sem dependências)
const tel = document.getElementById('telefone');
if (tel) {
    tel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6) e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        else if (v.length > 2) e.target.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        else if (v.length > 0) e.target.value = `(${v}`;
    });
}

const cpf = document.getElementById('cpf');
if (cpf) {
    cpf.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        let out = '';
        if (v.length > 9) out = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
        else if (v.length > 6) out = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
        else if (v.length > 3) out = `${v.slice(0, 3)}.${v.slice(3)}`;
        else out = v;
        e.target.value = out;
    });
}

// ====== Modal Pontos Bulbe ======
const btnAbrirPontos = document.getElementById('abrirPontosBulbe');
const modalPontos = document.getElementById('modalPontosBulbe');
const overlayPontos = document.getElementById('overlayPontosBulbe');
const btnFecharPontos = document.getElementById('fecharPontosBulbe');

function abrirModalPontos() {
    if (modalPontos) {
        modalPontos.classList.add('aberto');
        modalPontos.setAttribute('aria-hidden', 'false');
    }
}

function fecharModalPontos() {
    if (modalPontos) {
        modalPontos.classList.remove('aberto');
        modalPontos.setAttribute('aria-hidden', 'true');
    }
}

if (btnAbrirPontos) {
    btnAbrirPontos.addEventListener('click', abrirModalPontos);
}

if (overlayPontos) {
    overlayPontos.addEventListener('click', fecharModalPontos);
}

if (btnFecharPontos) {
    btnFecharPontos.addEventListener('click', fecharModalPontos);
}

// Fecha no ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModalPontos();
    }
});