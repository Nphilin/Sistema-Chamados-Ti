const SESSION_KEY = "sessaoUsuarioTI";
const STORAGE_KEY = "chamadosTI";

function verificarLogin() {
  const sessao = JSON.parse(localStorage.getItem(SESSION_KEY));

  if (!sessao || !sessao.logado) {
    window.location.href = "login.html";
    return null;
  }

  const usuarioLogado = document.getElementById("usuarioLogado");
  if (usuarioLogado) {
    usuarioLogado.textContent = `Olá, ${sessao.nome}`;
  }

  return sessao;
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
  const ano = new Date().getFullYear();
  const numero = Math.floor(Math.random() * 90000) + 10000;
  return `TI-${ano}-${numero}`;
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensagem;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

function atualizarDashboard() {
  const totalChamados = document.getElementById("totalChamados");
  if (!totalChamados) return;

  totalChamados.textContent = chamados.length;
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

    const dadosChamado = {
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
      chamados = chamados.map(item => item.id === id ? dadosChamado : item);
      salvarNoStorage();
      mostrarToast("Chamado atualizado com sucesso!");
      setTimeout(() => window.location.href = "chamados.html", 800);
    } else {
      chamados.push(dadosChamado);
      salvarNoStorage();
      form.reset();
      mostrarToast("Chamado cadastrado com sucesso!");
    }
  });
}

function renderizarTabela() {
  const lista = document.getElementById("listaChamados");
  if (!lista) return;

  const pesquisa = document.getElementById("pesquisa");
  const mensagemVazia = document.getElementById("mensagemVazia");

  const termo = pesquisa.value.toLowerCase();
  const filtrados = chamados.filter(chamado =>
    chamado.protocolo.toLowerCase().includes(termo) ||
    chamado.solicitante.toLowerCase().includes(termo) ||
    chamado.setor.toLowerCase().includes(termo) ||
    chamado.tipo.toLowerCase().includes(termo) ||
    chamado.status.toLowerCase().includes(termo)
  );

  lista.innerHTML = "";

  filtrados.forEach(chamado => {
    const prioridadeClasse = chamado.prioridade.toLowerCase().replace("é", "e");
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${chamado.protocolo}</td>
      <td>${chamado.solicitante}</td>
      <td>${chamado.setor}</td>
      <td>${chamado.tipo}</td>
      <td><span class="badge ${prioridadeClasse}">${chamado.prioridade}</span></td>
      <td><span class="status">${chamado.status}</span></td>
      <td>
        <a class="btn btn-small btn-edit" href="novo-chamado.html?editar=${chamado.id}">Editar</a>
        <button class="btn btn-small btn-delete" onclick="excluirChamado('${chamado.id}')">Excluir</button>
      </td>
    `;

    lista.appendChild(linha);
  });

  mensagemVazia.style.display = filtrados.length ? "none" : "block";
}

function excluirChamado(id) {
  const confirmar = confirm("Deseja realmente excluir este chamado?");
  if (!confirmar) return;

  chamados = chamados.filter(chamado => chamado.id !== id);
  salvarNoStorage();
  renderizarTabela();
}

function configurarPesquisa() {
  const pesquisa = document.getElementById("pesquisa");
  if (pesquisa) {
    pesquisa.addEventListener("input", renderizarTabela);
  }
}

verificarLogin();
configurarLogout();
atualizarDashboard();
configurarFormulario();
renderizarTabela();
configurarPesquisa();
