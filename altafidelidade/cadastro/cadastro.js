// Redireciona para home se já estiver logado
if (window.api?.estaLogado()) {
  window.location.href = "/altafidelidade/home/paginicial.html";
}

const toggleSenha = document.getElementById("toggleSenha");
const senhaInput  = document.getElementById("senha");

toggleSenha?.addEventListener("click", () => {
  senhaInput.type = senhaInput.type === "password" ? "text" : "password";
});

// Indicador de força da senha em tempo real
senhaInput?.addEventListener("input", () => {
  const val = senhaInput.value;
  const forcaEl = document.getElementById("forcaSenha");
  if (!forcaEl) return;
  if (val.length === 0) { forcaEl.textContent = ""; return; }
  if (val.length < 6)   { forcaEl.textContent = "Fraca — mínimo 6 caracteres"; forcaEl.style.color = "#e53935"; return; }
  const forte = /[A-Z]/.test(val) && /[0-9]/.test(val) && val.length >= 8;
  const media = val.length >= 6;
  forcaEl.textContent = forte ? "Senha forte" : media ? "Senha média — adicione números e maiúsculas" : "";
  forcaEl.style.color = forte ? "#2e7d32" : "#f57c00";
});

document.getElementById("formCadastro")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nomeEl    = document.getElementById("nome");
  const emailEl   = document.getElementById("email");
  const senhaEl   = document.getElementById("senha");
  const confirmEl = document.getElementById("confirmarSenha");
  const erroEl    = document.getElementById("erroCadastro");
  const btnEl     = document.getElementById("btnCadastrar");

  const nome  = nomeEl.value.trim();
  const email = emailEl.value.trim();
  const senha = senhaEl.value;
  const confirmar = confirmEl?.value || "";

  // Validações
  if (!nome) {
    erroEl.textContent = "Informe seu nome completo.";
    erroEl.hidden = false;
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erroEl.textContent = "Informe um e-mail válido.";
    erroEl.hidden = false;
    return;
  }
  if (senha.length < 6) {
    erroEl.textContent = "A senha deve ter pelo menos 6 caracteres.";
    erroEl.hidden = false;
    return;
  }
  if (confirmar && senha !== confirmar) {
    erroEl.textContent = "As senhas não coincidem.";
    erroEl.hidden = false;
    return;
  }

  erroEl.hidden = true;
  btnEl.disabled = true;
  btnEl.textContent = "Criando conta…";

  // Desabilita inputs durante a requisição
  [nomeEl, emailEl, senhaEl, confirmEl].forEach(el => { if (el) el.disabled = true; });

  try {
    const resp = await window.api.auth.cadastro(nome, email, senha);
    window.api.salvarToken(resp.token);
    window.api.salvarUsuario(window.api.extrairUsuarioDoToken(resp.token) || { nome, email });

    // Mensagem de sucesso antes de redirecionar
    btnEl.textContent = "Conta criada!";
    btnEl.style.background = "#2e7d32";
    setTimeout(() => {
      window.location.href = "/altafidelidade/home/paginicial.html";
    }, 1200);
  } catch (err) {
    erroEl.textContent = err.message || "Não foi possível criar a conta. Tente novamente.";
    erroEl.hidden = false;
  } finally {
    if (!window.location.href.includes("paginicial")) {
      btnEl.disabled = false;
      if (btnEl.textContent === "Criando conta…") btnEl.textContent = "Criar conta";
      [nomeEl, emailEl, senhaEl, confirmEl].forEach(el => { if (el) el.disabled = false; });
    }
  }
});
