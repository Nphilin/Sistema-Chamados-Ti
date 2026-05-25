const USERS_KEY = "usuariosTI";
const SESSION_KEY = "sessaoUsuarioTI";

const usuarioPadrao = { nome: "Administrador", usuario: "admin", senha: "123456" };

function obterUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const existeAdmin = usuarios.some((item) => item.usuario === usuarioPadrao.usuario);
  if (!existeAdmin) {
    usuarios.push(usuarioPadrao);
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
  }
  return usuarios;
}

function salvarUsuarios(usuarios) {
  localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

function mostrarAlerta(mensagem, tipo) {
  const alerta = document.getElementById("loginAlert");
  alerta.textContent = mensagem;
  alerta.className = `login-alert ${tipo}`;
  setTimeout(() => {
    alerta.className = "login-alert";
    alerta.textContent = "";
  }, 3500);
}

function alternarAba(aba) {
  const formLogin = document.getElementById("formLogin");
  const formCadastro = document.getElementById("formCadastro");
  const tabLogin = document.getElementById("tabLogin");
  const tabCadastro = document.getElementById("tabCadastro");

  if (aba === "login") {
    formLogin.classList.add("active");
    formCadastro.classList.remove("active");
    tabLogin.classList.add("active");
    tabCadastro.classList.remove("active");
  } else {
    formCadastro.classList.add("active");
    formLogin.classList.remove("active");
    tabCadastro.classList.add("active");
    tabLogin.classList.remove("active");
  }
}

function realizarLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById("loginUsuario").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();
  const usuarios = obterUsuarios();

  if (!usuario || !senha) {
    mostrarAlerta("Preencha todos os campos.", "error");
    return;
  }

  const usuarioEncontrado = usuarios.find(
    (item) => item.usuario === usuario && item.senha === senha
  );

  if (!usuarioEncontrado) {
    mostrarAlerta("Usuário ou senha inválidos.", "error");
    return;
  }

  mostrarAlerta("Login realizado com sucesso!", "success");

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ nome: usuarioEncontrado.nome, usuario: usuarioEncontrado.usuario, logado: true })
  );

  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

function cadastrarUsuario(event) {
  event.preventDefault();

  const nome = document.getElementById("cadastroNome").value.trim();
  const usuario = document.getElementById("cadastroUsuario").value.trim();
  const senha = document.getElementById("cadastroSenha").value.trim();

  if (!nome || !usuario || !senha) {
    mostrarAlerta("Preencha todos os campos.", "error");
    return;
  }

  if (senha.length < 4) {
    mostrarAlerta("A senha precisa ter pelo menos 4 caracteres.", "error");
    return;
  }

  const usuarios = obterUsuarios();
  const usuarioExiste = usuarios.some((item) => item.usuario === usuario);

  if (usuarioExiste) {
    mostrarAlerta("Esse usuário já existe.", "error");
    return;
  }
   usuarios.push({ nome, usuario, senha });
  salvarUsuarios(usuarios);

  document.getElementById("formCadastro").reset();
  alternarAba("login");
  mostrarAlerta("Usuário cadastrado com sucesso!", "success");
}

function configurarMostrarSenha() {
  document.querySelectorAll(".show-password").forEach((botao) => {
    botao.addEventListener("click", () => {
      const input = document.getElementById(botao.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
      botao.textContent = input.type === "password" ? "Mostrar" : "Ocultar";
    });
  });
}

obterUsuarios();

const sessao = JSON.parse(localStorage.getItem(SESSION_KEY));
if (sessao && sessao.logado) window.location.href = "index.html";

document.getElementById("tabLogin").addEventListener("click", () => alternarAba("login"));
document.getElementById("tabCadastro").addEventListener("click", () => alternarAba("cadastro"));
document.getElementById("formLogin").addEventListener("submit", realizarLogin);
document.getElementById("formCadastro").addEventListener("submit", cadastrarUsuario);
configurarMostrarSenha();
