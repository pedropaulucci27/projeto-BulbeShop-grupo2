const API_BASE = "http://localhost:3000/api/v1";

const IMAGENS_PRODUTOS = {
  "lampada-led-9w.jpg":                   "/altafidelidade/home/img/luz.png",
  "liquidificador-mondial-1000w.jpg":     "/altafidelidade/home/img/blender.jpg",
  "garrafa-tupperware.jpg":               "/altafidelidade/home/img/tupperware.jpg",
  "ventilador-mesa-britania.jpg":         "/altafidelidade/home/img/ventiladorbritania.webp",
  "livro-energia-fique-por-dentro.jpg":   "/altafidelidade/home/img/livro.jpg",
};

function resolverImagemProduto(filename) {
  if (!filename) return "/altafidelidade/home/img/ventiladorbritania.webp";
  if (filename.startsWith("http") || filename.startsWith("/altafidelidade")) return filename;
  const local = IMAGENS_PRODUTOS[filename];
  if (local) return local;
  if (filename.startsWith("/")) return `http://localhost:3000${filename}`;
  return "/altafidelidade/home/img/ventiladorbritania.webp";
}

function getToken() {
  try { return localStorage.getItem("bulbe:token") || null; } catch { return null; }
}

function salvarToken(token) {
  try { localStorage.setItem("bulbe:token", token); } catch {}
}

function removerToken() {
  try { localStorage.removeItem("bulbe:token"); } catch {}
}

function getUsuario() {
  try { return JSON.parse(localStorage.getItem("bulbe:usuario")) || null; } catch { return null; }
}

function salvarUsuario(usuario) {
  try { localStorage.setItem("bulbe:usuario", JSON.stringify(usuario)); } catch {}
}

function removerUsuario() {
  try { localStorage.removeItem("bulbe:usuario"); } catch {}
}

async function requisicao(metodo, caminho, corpo) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opcoes = { method: metodo, headers };
  if (corpo) opcoes.body = JSON.stringify(corpo);

  const resp = await fetch(`${API_BASE}${caminho}`, opcoes);

  if (resp.status === 401) {
    removerToken();
    removerUsuario();
  }

  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({}));
    throw new Error(erro.erro || erro.mensagem || erro.message || `Erro ${resp.status}`);
  }

  return resp.json();
}

const api = {
  get:    (caminho)         => requisicao("GET",    caminho),
  post:   (caminho, corpo)  => requisicao("POST",   caminho, corpo),
  put:    (caminho, corpo)  => requisicao("PUT",    caminho, corpo),
  patch:  (caminho, corpo)  => requisicao("PATCH",  caminho, corpo),
  delete: (caminho)         => requisicao("DELETE", caminho),

  auth: {
    login:    (email, senha)          => requisicao("POST", "/auth/login",    { email, senha }),
    cadastro: (nome, email, senha)    => requisicao("POST", "/auth/register", { nome, email, senha }),
    logout:   ()                      => requisicao("POST", "/auth/logout"),
  },

  produtos: {
    listar:   (params = "")           => requisicao("GET", `/produtos${params}`),
    buscar:   (id)                    => requisicao("GET", `/produtos/${id}`),
    categorias: ()                    => requisicao("GET", "/categorias"),
  },

  favoritos: {
    listar:   ()                      => requisicao("GET",    "/favoritos"),
    adicionar:(produtoId)             => requisicao("POST",   `/favoritos/${produtoId}`),
    remover:  (produtoId)             => requisicao("DELETE", `/favoritos/${produtoId}`),
  },

  carrinho: {
    listar:   ()                      => requisicao("GET",    "/carrinho"),
    adicionar:(produtoId, quantidade) => requisicao("POST",   "/carrinho/itens", { produtoId, quantidade }),
    atualizar:(itemId, quantidade)    => requisicao("PATCH",  `/carrinho/itens/${itemId}`, { quantidade }),
    remover:  (itemId)                => requisicao("DELETE", `/carrinho/itens/${itemId}`),
  },

  pedidos: {
    criar:    (cupom, endereco)       => requisicao("POST",   "/pedidos/checkout", { ...(cupom ? { cupom } : {}), ...(endereco ? { endereco } : {}) }),
    buscar:   (id)                    => requisicao("GET",    `/pedidos/${id}`),
    listar:   ()                      => requisicao("GET",    "/pedidos"),
    cancelar: (id)                    => requisicao("PATCH",  `/pedidos/${id}/cancelar`),
    pagarPix:    (id)                 => requisicao("POST",   `/pedidos/${id}/pagamento/pix`),
    pagarBoleto: (id)                 => requisicao("POST",   `/pedidos/${id}/pagamento/boleto`),
    pagarCartao: (id, dados)          => requisicao("POST",   `/pedidos/${id}/pagamento/cartao`, dados),
    pagarDebito: (id, dados)          => requisicao("POST",   `/pedidos/${id}/pagamento/debito`, dados),
  },

  cupons: {
    listar:   ()                      => requisicao("GET", "/cupons"),
    buscar:   (codigo)                => requisicao("GET", `/cupons/${codigo}`),
  },

  lojas: {
    listar:   ()                      => requisicao("GET", "/lojas-parceiras"),
    buscar:   (id)                    => requisicao("GET", `/lojas-parceiras/${id}`),
    produtos: (id)                    => requisicao("GET", `/lojas-parceiras/${id}/produtos`),
  },

  usuario: {
    perfil:         ()                => requisicao("GET", "/usuarios/perfil"),
    atualizarPerfil:(dados)           => requisicao("PUT", "/usuarios/perfil", dados),
    pontos:         ()                => requisicao("GET", "/usuarios/pontos"),
  },

  estaLogado: () => !!getToken(),
  getToken,
  salvarToken,
  removerToken,
  getUsuario,
  salvarUsuario,
  removerUsuario,
};

window.api = api;
