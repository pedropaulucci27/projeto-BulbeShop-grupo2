
// ==========================================
// 1. LÓGICA DO MODAL (MANTIDA ORIGINAL)
// ==========================================
const btnNaoRecebi = document.getElementById("btnNaoRecebi");
const modal = document.getElementById("modalBoleto");
const btnFecharModal = document.getElementById("btnFecharModal");
const btnTentarNovamente = document.getElementById("btnTentarNovamente");
function abrirModal() {
    if (!modal) return;
    modal.hidden = false;
}
function fecharModal() {
    if (!modal) return;
    modal.hidden = true;
}
btnNaoRecebi?.addEventListener("click", abrirModal);
btnFecharModal?.addEventListener("click", fecharModal);
btnTentarNovamente?.addEventListener("click", fecharModal);
// fechar clicando fora da caixa
modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
        fecharModal();
    }
});
// fechar com ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
        fecharModal();
    }
});
// ==========================================
// 2. BOTÃO CONCLUIR COMPRA (ATUALIZADO)
// ==========================================
const btnConcluir = document.getElementById("btnConcluir");
btnConcluir?.addEventListener("click", async () => {
  const pedidoId = localStorage.getItem("bulbe:pedidoId");
  if (window.api?.estaLogado() && pedidoId) {
    btnConcluir.disabled = true;
    try {
      await window.api.pedidos.pagarBoleto(pedidoId);
      
      // Mensagem de sucesso ao aprovar
      const elMsg = document.getElementById("mensagemBoleto");
      if(elMsg) elMsg.innerText = "Seu boleto foi gerado com sucesso! Ele foi enviado ao seu email.";
      
      // Ocultado o removeItem para a tela final conseguir ler o ID real da compra
      // localStorage.removeItem("bulbe:pedidoId"); 
      
      localStorage.removeItem("bulbe:cart");
      localStorage.removeItem("bulbe:checkoutItems");
      
      // Delay de 1.5s para o usuário ler a mensagem de sucesso antes de sair da página
      setTimeout(() => {
          window.location.href = "/altafidelidade/processando compra/html/index.html";
      }, 1500);
      
    } catch {
      btnConcluir.disabled = false;
      window.location.href = "/altafidelidade/pagamento e recusado/status-recusada.html";
    }
  } else {
    window.location.href = "/altafidelidade/processando compra/html/index.html";
  }
});
// ==========================================
// 3. CARREGAR DADOS NA TELA (ATUALIZADO E CORRIGIDO)
// ==========================================
async function carregarDadosBoleto() {
    const pedidoId = localStorage.getItem("bulbe:pedidoId");
    const clienteStr = localStorage.getItem("checkoutCustomer");
    
    // A. Já gera o Código de Barras primeiro para não travar
    let codigo = "";
    for (let i = 0; i < 47; i++) {
        codigo += Math.floor(Math.random() * 10);
    }
    const formatado = codigo.replace(/^(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})$/, "$1.$2 $3.$4 $5.$6 $7 $8");
    
    const elCodigo = document.getElementById("codigoBarrasTxt");
    if (elCodigo) {
        elCodigo.innerText = formatado;
    }
    // B. Coloca o Email do Usuário Logado
    const elEmail = document.getElementById("emailUsuario");
    if (elEmail) {
        let emailEncontrado = "Email não encontrado";
        try {
            if (window.api?.estaLogado()) {
                const perfil = await window.api.usuario.perfil();
                if (perfil?.email) emailEncontrado = perfil.email;
            } else {
                const usuarioSalvo = JSON.parse(localStorage.getItem("bulbe:usuario") || "{}");
                if (usuarioSalvo.email) emailEncontrado = usuarioSalvo.email;
            }
        } catch (e) {
            console.error("Erro ao puxar email", e);
        }
        elEmail.innerText = emailEncontrado;
    }

    // C. Calcula o total do pedido
    let total = 0;
    if (pedidoId && window.api?.estaLogado()) {
        try {
            const pedido = await window.api.pedidos.buscar(pedidoId);
            total = pedido.total;
        } catch (e) { console.error("Erro ao buscar pedido por ID", e); }
    }
    
    // Fallback: Se falhar por causa do ID, busca o último pedido do histórico da pessoa
    if ((!total || total <= 0) && window.api?.estaLogado()) {
        try {
            const historico = await window.api.pedidos.listar();
            if (historico && historico.length > 0) {
                total = historico[0].total; // pega o mais recente
                localStorage.setItem("bulbe:pedidoId", historico[0].id); // corrige o ID salvo
            }
        } catch(e) { console.error("Erro ao listar histórico", e); }
    }
    
    // Último recurso: carrinho offline
    if (!total || total <= 0) {
        try {
            const checkoutItems = JSON.parse(localStorage.getItem('bulbe:checkoutItems') || '[]');
            total = checkoutItems.reduce((soma, item) => soma + (parseFloat(item.price || 0) * parseInt(item.qty || 1)), 0);
        } catch(e) { console.error(e); }
    }
    
    const elValor = document.getElementById("valorPedido");
    if (elValor) {
        elValor.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}
// Executa ao abrir a página
carregarDadosBoleto();
