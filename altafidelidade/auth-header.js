/* Gerencia o estado de autenticação no header */
(function () {
  function init() {
    if (!window.api) return;

    const usuario = window.api.getUsuario();
    const logado  = window.api.estaLogado();

    // Tenta encontrar o container de ícones do header
    const iconsEl = document.querySelector(".icons");
    if (!iconsEl) return;

    // Remove indicador anterior se existir
    document.getElementById("auth-indicator")?.remove();

    const wrap = document.createElement("div");
    wrap.id = "auth-indicator";
    wrap.style.cssText = "display:flex;align-items:center;gap:6px;font-size:.75rem;font-family:Poppins,sans-serif;";

    if (logado && usuario) {
      const iniciais = (usuario.nome || usuario.email || "U")
        .split(" ").slice(0, 2).map(p => p[0].toUpperCase()).join("");

      wrap.innerHTML = `
        <a href="/altafidelidade/meu perfil/perfil.html"
           style="display:flex;align-items:center;gap:4px;text-decoration:none;color:inherit;">
          <span style="background:#4361ee;color:#fff;border-radius:50%;width:28px;height:28px;
                       display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.7rem;">
            ${iniciais}
          </span>
        </a>
        <button id="btnLogout"
          style="background:none;border:1px solid #ccc;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:.72rem;font-family:inherit;">
          Sair
        </button>`;
    } else {
      wrap.innerHTML = `
        <a href="/altafidelidade/login/login.html"
           style="background:#4361ee;color:#fff;border-radius:6px;padding:4px 12px;
                  text-decoration:none;font-size:.78rem;font-weight:600;white-space:nowrap;">
          Entrar
        </a>`;
    }

    iconsEl.prepend(wrap);

    document.getElementById("btnLogout")?.addEventListener("click", async () => {
      try { await window.api.auth.logout(); } catch {}
      window.api.removerToken();
      window.api.removerUsuario();
      window.location.href = "/altafidelidade/home/paginicial.html";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
