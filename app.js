// Inicializa o banco no LocalStorage caso esteja vazio
if (!localStorage.getItem('chamados')) {
    localStorage.setItem('chamados', JSON.stringify([]));
}

// Busca os chamados mapeados do LocalStorage
function getChamados() {
    return JSON.stringify(localStorage.getItem('chamados')) ? JSON.parse(localStorage.getItem('chamados')) : [];
}

// Salva a lista de chamados no LocalStorage
function saveChamados(chamados) {
    localStorage.setItem('chamados', JSON.stringify(chamados));
}

// Carrega os dados na Dashboard (index.html)
function renderDashboard() {
    const chamados = getChamados();

    const total = chamados.length;
    const abertos = chamados.filter(c => c.status === 'Aberto').length;
    const andamento = chamados.filter(c => c.status === 'Em Andamento').length;
    const concluidos = chamados.filter(c => c.status === 'Concluído').length;

    if (document.getElementById('total-chamados')) {
        document.getElementById('total-chamados').innerText = total;
        document.getElementById('abertos-chamados').innerText = abertos;
        document.getElementById('andamento-chamados').innerText = andamento;
        document.getElementById('concluidos-chamados').innerText = concluidos;
    }
}

// Cadastra ou edita um chamado (novo-chamado.html)
function handleChamadoForm(e) {
    e.preventDefault();
    const chamados = getChamados();

    const id = document.getElementById('chamado-id').value;
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const prioridade = document.getElementById('prioridade').value;
    const status = document.getElementById('status').value;

    if (id) {
        // Modo Edição
        const index = chamados.findIndex(c => c.id == id);
        if (index !== -1) {
            chamados[index] = { id: Number(id), titulo, descricao, prioridade, status };
        }
    } else {
        // Modo Cadastro
        const novoChamado = {
            id: Date.now(),
            titulo,
            descricao,
            prioridade,
            status
        };
        chamados.push(novoCheckado || novoChamado);
    }

    saveChamados(chamados);
    window.location.href = 'chamados.html';
}

// Renderiza a tabela de chamados com filtros (chamados.html)
function renderTabelaChamados(filtroTexto = '') {
    const tabelaBody = document.getElementById('tabela-chamados-body');
    if (!tabelaBody) return;

    const chamados = getChamados();
    tabelaBody.innerHTML = '';

    const chamadosFiltrados = chamados.filter(c =>
        c.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        c.descricao.toLowerCase().includes(filtroTexto.toLowerCase())
    );

    if (chamadosFiltrados.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum chamado encontrado.</td></tr>`;
        return;
    }

    chamadosFiltrados.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.titulo}</td>
            <td><span class="badge badge-${c.prioridade.toLowerCase()}">${c.prioridade}</span></td>
            <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span></td>
            <td>${c.descricao}</td>
            <td class="actions-btn">
                <button class="btn btn-sm" onclick="editarChamado(${c.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="excluirChamado(${c.id})">Excluir</button>
            </td>
        `;
        tabelaBody.appendChild(tr);
    });
}

// Redireciona para a página de formulário preenchido para edição
function editarChamado(id) {
    window.location.href = `novo-chamado.html?edit=${id}`;
}

// Exclui um chamado do sistema
function excluirChamado(id) {
    if (confirm('Tem certeza que deseja excluir este chamado?')) {
        let chamados = getChamados();
        chamados = chamados.filter(c => c.id != id);
        saveChamados(chamados);
        renderTabelaChamados(document.getElementById('search-input')?.value);
    }
}

// Preenche o formulário se houver ID para edição na URL
function verificarEdicao() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId && document.getElementById('form-chamado')) {
        document.getElementById('form-title').innerText = 'Editar Chamado';
        const chamados = getChamados();
        const chamado = chamados.find(c => c.id == editId);

        if (chamado) {
            document.getElementById('chamado-id').value = chamado.id;
            document.getElementById('titulo').value = chamado.titulo;
            document.getElementById('descricao').value = chamado.descricao;
            document.getElementById('prioridade').value = chamado.prioridade;
            document.getElementById('status').value = chamado.status;
        }
    }
}

// Listener para carregar as funções baseadas na página atual
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderTabelaChamados();
    verificarEdicao();

    const form = document.getElementById('form-chamado');
    if (form) {
        form.addEventListener('submit', handleChamadoForm);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderTabelaChamados(e.target.value);
        });
    }
});