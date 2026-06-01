const toggleSenha = document.getElementById("toggleSenha");
const senhaInput  = document.getElementById("senha");

toggleSenha?.addEventListener("click", () => {
  senhaInput.type = senhaInput.type === "password" ? "text" : "password";
});

document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const erroEl  = document.getElementById("erroLogin");
  const btnEl   = document.getElementById("btnEntrar");

  erroEl.hidden = true;
  btnEl.disabled = true;
  btnEl.textContent = "Entrando…";

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
    btnEl.disabled = false;
    btnEl.textContent = "Entrar";
  }
});
