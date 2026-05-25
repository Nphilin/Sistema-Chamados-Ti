const SESSION_KEY = "sessaoUsuarioTI";
const STORAGE_KEY = "chamadosTI";

function verificarLogin() {
  const sessao = JSON.parse(localStorage.getItem(SESSION_KEY));
  if (!sessao || !sessao.logado) {
    window.location.href = "login.html";
    return;
  }
  const usuarioLogado = document.getElementById("usuarioLogado");
  if (usuarioLogado) usuarioLogado.textContent = `Olá, ${sessao.nome}`;
}

function configurarLogout() {
  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "login.html";
    });
  }
}

let chamados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function salvarNoStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
}

function gerarProtocolo() {
  return `SX-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 2500);
}

function atualizarDashboard() {
  const total = document.getElementById("totalChamados");
  if (!total) return;
  total.textContent = chamados.length;
  document.getElementById("totalAbertos").textContent = chamados.filter(c => c.status === "Aberto").length;
  document.getElementById("totalAndamento").textContent = chamados.filter(c => c.status === "Em andamento").length;
  document.getElementById("totalFinalizados").textContent = chamados.filter(c => c.status === "Finalizado").length;
}

function configurarFormulario() {
  const form = document.getElementById("formChamado");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const idEdicao = params.get("editar");
  const chamado = chamados.find(item => item.id === idEdicao);

  if (chamado) {
    document.getElementById("tituloFormulario").textContent = "Editar Chamado";
    document.getElementById("chamadoId").value = chamado.id;
    document.getElementById("solicitante").value = chamado.solicitante;
    document.getElementById("setor").value = chamado.setor;
    document.getElementById("tipo").value = chamado.tipo;
    document.getElementById("prioridade").value = chamado.prioridade;
    document.getElementById("status").value = chamado.status;
    document.getElementById("descricao").value = chamado.descricao;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = document.getElementById("chamadoId").value;
    const chamadoAtual = chamados.find(item => item.id === id);

    const dados = {
      id: id || crypto.randomUUID(),
      protocolo: id ? chamadoAtual.protocolo : gerarProtocolo(),
      solicitante: document.getElementById("solicitante").value.trim(),
      setor: document.getElementById("setor").value.trim(),
      tipo: document.getElementById("tipo").value,
      prioridade: document.getElementById("prioridade").value,
      status: document.getElementById("status").value,
      descricao: document.getElementById("descricao").value.trim(),
      dataCriacao: id ? chamadoAtual.dataCriacao : new Date().toLocaleDateString("pt-BR")
    };

    if (id) {
      chamados = chamados.map(item => item.id === id ? dados : item);
      salvarNoStorage();
      mostrarToast("Chamado atualizado com sucesso!");
      setTimeout(() => window.location.href = "chamados.html", 800);
    } else {
      chamados.push(dados);
      salvarNoStorage();
      form.reset();
      mostrarToast("Chamado cadastrado com sucesso!");
      atualizarDashboard();
    }
  });
}

function renderizarTabela() {
  const lista = document.getElementById("listaChamados");
  if (!lista) return;

  const termo = document.getElementById("pesquisa").value.toLowerCase();
  const filtrados = chamados.filter(c =>
    c.protocolo.toLowerCase().includes(termo) ||
    c.solicitante.toLowerCase().includes(termo) ||
    c.setor.toLowerCase().includes(termo) ||
    c.tipo.toLowerCase().includes(termo) ||
    c.status.toLowerCase().includes(termo)
  );

  lista.innerHTML = "";

  filtrados.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.protocolo}</td>
      <td>${c.solicitante}</td>
      <td>${c.setor}</td>
      <td>${c.tipo}</td>
      <td><span class="badge ${c.prioridade.toLowerCase().replace("é", "e")}">${c.prioridade}</span></td>
      <td><span class="status">${c.status}</span></td>
      <td>
        <a class="btn btn-small btn-edit" href="novo-chamado.html?editar=${c.id}">Editar</a>
        <button class="btn btn-small btn-delete" onclick="excluirChamado('${c.id}')">Excluir</button>
      </td>`;
    lista.appendChild(tr);
  });

  document.getElementById("mensagemVazia").style.display = filtrados.length ? "none" : "block";
}

function excluirChamado(id) {
  if (!confirm("Deseja realmente excluir este chamado?")) return;
  chamados = chamados.filter(c => c.id !== id);
  salvarNoStorage();
  renderizarTabela();
}

function configurarPesquisa() {
  const pesquisa = document.getElementById("pesquisa");
  if (pesquisa) pesquisa.addEventListener("input", renderizarTabela);
}

verificarLogin();
configurarLogout();
atualizarDashboard();
configurarFormulario();
renderizarTabela();
configurarPesquisa();
