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
    wrap.style.cssText = "display:flex;align-items:center;gap:12px;font-size:.75rem;font-family:Poppins,sans-serif;";

    if (logado && usuario) {
      const iniciais = (usuario.nome || usuario.email || "U")
        .split(" ").slice(0, 2).map(p => p[0].toUpperCase()).join("");

      wrap.innerHTML = `
        <a href="/altafidelidade/meu perfil/perfil.html"
           style="display:flex;align-items:center;text-decoration:none;color:inherit;">
          <span style="background:#fff;color:#08068D;border-radius:50%;width:32px;height:32px;
                       display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.72rem;
                       flex-shrink:0;">
            ${iniciais}
          </span>
        </a>
        <button id="btnLogout"
          style="background:none;border:1px solid rgba(255,255,255,.6);color:#fff;border-radius:8px;
                 padding:5px 14px;cursor:pointer;font-size:.75rem;font-family:inherit;white-space:nowrap;
                 line-height:1;vertical-align:middle;display:flex;align-items:center;">
          Sair
        </button>`;
    } else {
      wrap.innerHTML = `
        <a href="/altafidelidade/login/login.html"
           style="background:#fff;color:#08068D;border-radius:20px;padding:6px 16px;
                  text-decoration:none;font-size:.8rem;font-weight:700;white-space:nowrap;
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
