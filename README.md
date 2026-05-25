# SupportX

Sistema de Chamados de TI desenvolvido em front-end e pronto para deploy no GitHub Pages.

## Acesso inicial

Usuário: `admin`  
Senha: `123456`

Também é possível cadastrar novos usuários pela tela inicial.

## Estrutura

```txt
supportx/
├── index.html          # Login
├── dashboard.html      # Dashboard
├── novo-chamado.html   # Cadastro e edição de chamados
├── chamados.html       # Lista de chamados
├── etapas.html         # Etapas do projeto
├── css/
│   └── style.css
├── js/
│   ├── auth.js
│   └── script.js
├── README.md
├── .gitignore
└── COMMITS_SUGERIDOS.txt
```

## Tecnologias

- HTML5
- CSS3
- JavaScript
- LocalStorage

## Funcionalidades

- Login funcional
- Cadastro de usuários
- Sessão simulada com LocalStorage
- Proteção de páginas internas
- Logout
- Cadastro de chamados
- Edição de chamados
- Exclusão de chamados
- Pesquisa dinâmica
- Dashboard com indicadores

## Como abrir localmente

Abra o arquivo `index.html` no navegador.

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos do projeto.
3. Vá em **Settings**.
4. Clique em **Pages**.
5. Em **Branch**, selecione `main`.
6. Em **Folder**, selecione `/root`.
7. Clique em **Save**.
8. Aguarde o link do GitHub Pages ser gerado.

## Observação

O projeto usa LocalStorage, então os dados ficam salvos no navegador do usuário.
