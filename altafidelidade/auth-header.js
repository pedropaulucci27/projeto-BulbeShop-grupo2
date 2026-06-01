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
          <span style="background:#fff;color:#08068D;border-radius:50%;width:28px;height:28px;
                       display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.7rem;">
            ${iniciais}
          </span>
        </a>
        <button id="btnLogout"
          style="background:none;border:1px solid rgba(255,255,255,.5);color:#fff;border-radius:6px;
                 padding:3px 10px;cursor:pointer;font-size:.72rem;font-family:inherit;">
          Sair
        </button>`;
    } else {
      wrap.innerHTML = `
        <a href="/altafidelidade/login/login.html"
           style="background:#fff;color:#08068D;border-radius:20px;padding:5px 14px;
                  text-decoration:none;font-size:.78rem;font-weight:700;white-space:nowrap;
                  box-shadow:0 1px 4px rgba(0,0,0,.15);">
          Entrar
        </a>`;
    }

    iconsEl.append(wrap);

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
