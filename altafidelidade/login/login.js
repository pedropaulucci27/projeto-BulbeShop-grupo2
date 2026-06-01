// Redireciona para home se já estiver logado
if (window.api?.estaLogado()) {
  window.location.href = "/altafidelidade/home/paginicial.html";
}

const toggleSenha = document.getElementById("toggleSenha");
const senhaInput  = document.getElementById("senha");

toggleSenha?.addEventListener("click", () => {
  senhaInput.type = senhaInput.type === "password" ? "text" : "password";
});

document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailEl = document.getElementById("email");
  const senhaEl = document.getElementById("senha");
  const erroEl  = document.getElementById("erroLogin");
  const btnEl   = document.getElementById("btnEntrar");

  const email = emailEl.value.trim();
  const senha = senhaEl.value;

  // Validação de campos vazios
  if (!email || !senha) {
    erroEl.textContent = "Preencha e-mail e senha antes de continuar.";
    erroEl.hidden = false;
    return;
  }

  erroEl.hidden = true;
  btnEl.disabled = true;
  btnEl.textContent = "Entrando…";

  // Desabilita inputs durante a requisição
  emailEl.disabled = true;
  senhaEl.disabled = true;

  try {
    const resp = await window.api.auth.login(email, senha);
    window.api.salvarToken(resp.token);
    window.api.salvarUsuario(window.api.extrairUsuarioDoToken(resp.token) || { email });

    const destino = new URLSearchParams(window.location.search).get("next")
      || "/altafidelidade/home/paginicial.html";
    window.location.href = destino;
  } catch (err) {
    erroEl.textContent = err.message || "E-mail ou senha inválidos.";
    erroEl.hidden = false;
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = "Entrar";
    emailEl.disabled = false;
    senhaEl.disabled = false;
  }
});
