const SESSION_KEY = "sessaoUsuarioTI";
const STORAGE_KEY = "chamadosTI";

function verificarLogin() {
  const sessao = JSON.parse(localStorage.getItem(SESSION_KEY));

  if (!sessao || !sessao.logado) {
    window.location.href = "index.html";
    return;
  }

  const usuarioLogado = document.getElementById("usuarioLogado");

  if (usuarioLogado) {
    usuarioLogado.textContent = `Olá, ${sessao.nome}`;
  }
}

function configurarLogout() {
  const btnSair = document.getElementById("btnSair");

  if (btnSair) {
    btnSair.addEventListener("click", (event) => {
      event.preventDefault();

      Swal.fire({
        title: "Deseja sair?",
        text: "Sua sessão será encerrada.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#0d6efd",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sim, sair",
        cancelButtonText: "Cancelar",
      }).then((resultado) => {
        if (resultado.isConfirmed) {
          localStorage.removeItem(SESSION_KEY);
          window.location.href = "index.html";
        }
      });
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

  return `SX-${ano}-${numero}`;
}

function mostrarSucesso(mensagem) {
  Swal.fire({
    icon: "success",
    title: "Sucesso!",
    text: mensagem,
    confirmButtonColor: "#0d6efd",
    timer: 1800,
    timerProgressBar: true,
  });
}

function atualizarDashboard() {
  const total = document.getElementById("totalChamados");

  if (!total) {
    return;
  }

  total.textContent = chamados.length;

  document.getElementById("totalAbertos").textContent = chamados.filter(
    (chamado) => chamado.status === "Aberto"
  ).length;

  document.getElementById("totalAndamento").textContent = chamados.filter(
    (chamado) => chamado.status === "Em andamento"
  ).length;

  document.getElementById("totalFinalizados").textContent = chamados.filter(
    (chamado) => chamado.status === "Finalizado"
  ).length;
}

function configurarFormulario() {
  const form = document.getElementById("formChamado");

  if (!form) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const idEdicao = params.get("editar");
  const chamado = chamados.find((item) => item.id === idEdicao);

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
    const chamadoAtual = chamados.find((item) => item.id === id);

    const dados = {
      id: id || crypto.randomUUID(),
      protocolo: id ? chamadoAtual.protocolo : gerarProtocolo(),
      solicitante: document.getElementById("solicitante").value.trim(),
      setor: document.getElementById("setor").value.trim(),
      tipo: document.getElementById("tipo").value,
      prioridade: document.getElementById("prioridade").value,
      status: document.getElementById("status").value,
      descricao: document.getElementById("descricao").value.trim(),
      dataCriacao: id
        ? chamadoAtual.dataCriacao
        : new Date().toLocaleDateString("pt-BR"),
    };

    if (id) {
      chamados = chamados.map((item) => (item.id === id ? dados : item));

      salvarNoStorage();

      Swal.fire({
        icon: "success",
        title: "Chamado atualizado!",
        text: "As informações foram salvas com sucesso.",
        confirmButtonColor: "#0d6efd",
        timer: 1600,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "chamados.html";
      });
    } else {
      chamados.push(dados);

      salvarNoStorage();
      form.reset();
      atualizarDashboard();

      mostrarSucesso("Chamado cadastrado com sucesso.");
    }
  });
}

function renderizarTabela() {
  const lista = document.getElementById("listaChamados");

  if (!lista) {
    return;
  }

  const termo = document.getElementById("pesquisa").value.toLowerCase();
  
  // Pegando os valores dos novos selects adicionados no HTML de forma segura
  const filtroPrioridade = document.getElementById("filtroPrioridade")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value || "";

  // Filtra os chamados com base no texto, prioridade e status
  const filtrados = chamados.filter((chamado) => {
    const bateTexto = (
      chamado.protocolo.toLowerCase().includes(termo) ||
      chamado.solicitante.toLowerCase().includes(termo) ||
      chamado.setor.toLowerCase().includes(termo) ||
      chamado.tipo.toLowerCase().includes(termo)
    );

    const batePrioridade = filtroPrioridade === "" || chamado.prioridade.toLowerCase() === filtroPrioridade.toLowerCase();
    const bateStatus = filtroStatus === "" || chamado.status.toLowerCase() === filtroStatus.toLowerCase();

    return bateTexto && batePrioridade && bateStatus;
  });

  lista.innerHTML = "";

  filtrados.forEach((chamado) => {
    const linha = document.createElement("tr");
    const prioridadeClasse = chamado.prioridade
      .toLowerCase()
      .replace("é", "e");

    // Cria classe dinâmica baseada no status atual para estilização (Ex: status-aberto)
    const statusClasse = "status-badge status-" + chamado.status.toLowerCase().replace(" ", "-");

    linha.innerHTML = `
      <td>${chamado.protocolo}</td>
      <td>${chamado.solicitante}</td>
      <td>${chamado.setor}</td>
      <td>${chamado.tipo}</td>
      <td><span class="badge ${prioridadeClasse}">${chamado.prioridade}</span></td>
      <td><span class="${statusClasse}">${chamado.status}</span></td>
      <td>
        <a class="btn btn-small btn-edit" href="novo-chamado.html?editar=${chamado.id}">Editar</a>
        <button class="btn btn-small btn-delete" onclick="excluirChamado('${chamado.id}')">Excluir</button>
      </td>
    `;

    lista.appendChild(linha);
  });

  // Atualiza o contador numérico de chamados visíveis na tela
  const badgeContador = document.getElementById("contadorChamados");
  if (badgeContador) {
    badgeContador.textContent = filtrados.length;
  }

  document.getElementById("mensagemVazia").style.display = filtrados.length
    ? "none"
    : "block";
}

function excluirChamado(id) {
  Swal.fire({
    title: "Excluir chamado?",
    text: "Essa ação não poderá ser desfeita.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sim, excluir",
    cancelButtonText: "Cancelar",
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      chamados = chamados.filter((chamado) => chamado.id !== id);

      salvarNoStorage();
      renderizarTabela();

      Swal.fire({
        icon: "success",
        title: "Excluído!",
        text: "O chamado foi removido com sucesso.",
        confirmButtonColor: "#0d6efd",
        timer: 1600,
        timerProgressBar: true,
      });
    }
  });
}

function configurarPesquisa() {
  const pesquisa = document.getElementById("pesquisa");
  const filtroPrioridade = document.getElementById("filtroPrioridade");
  const filtroStatus = document.getElementById("filtroStatus");

  // Vincula a renderização da tabela toda vez que o usuário alterar qualquer filtro
  if (pesquisa) pesquisa.addEventListener("input", renderizarTabela);
  if (filtroPrioridade) filtroPrioridade.addEventListener("change", renderizarTabela);
  if (filtroStatus) filtroStatus.addEventListener("change", renderizarTabela);
}

verificarLogin();
configurarLogout();
atualizarDashboard();
configurarFormulario();
renderizarTabela();
configurarPesquisa();
