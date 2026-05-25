const toggleSenha = document.getElementById("toggleSenha");
const senhaInput  = document.getElementById("senha");

toggleSenha?.addEventListener("click", () => {
  senhaInput.type = senhaInput.type === "password" ? "text" : "password";
});

document.getElementById("formCadastro")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome  = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const erroEl = document.getElementById("erroCadastro");
  const btnEl  = document.getElementById("btnCadastrar");

  if (senha.length < 6) {
    erroEl.textContent = "A senha deve ter pelo menos 6 caracteres.";
    erroEl.hidden = false;
    return;
  }

  erroEl.hidden = true;
  btnEl.disabled = true;
  btnEl.textContent = "Criando conta…";

  try {
    const resp = await window.api.auth.cadastro(nome, email, senha);
    window.api.salvarToken(resp.token);
    window.api.salvarUsuario(resp.usuario || resp.user || { nome, email });
    window.location.href = "/altafidelidade/home/paginicial.html";
  } catch (err) {
    erroEl.textContent = err.message || "Não foi possível criar a conta. Tente novamente.";
    erroEl.hidden = false;
    btnEl.disabled = false;
    btnEl.textContent = "Criar conta";
  }
});
