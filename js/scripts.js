document.addEventListener("DOMContentLoaded", function () {
  const toggler = document.querySelector(".toggler-btn");

  if (toggler) {
    toggler.addEventListener("click", function () {
      document.querySelector("#sidebar").classList.toggle("collapsed");
    });
  }

  let user = JSON.parse(localStorage.getItem("userConectado"));
  let valueSession = sessionStorage.getItem("userConectado");

  if (!user || !valueSession || user.email !== valueSession) {
    if (window.location.pathname !== "/index.html") {
      sessionStorage.removeItem("userConectado");
      localStorage.removeItem("userConectado");

      window.location = "index.html";
      alert("Realize o Login novamente.");
      return;
    }
  }

  kanban();
  criarUsuarioLocalStorage();
  loginUsuarioLocalStorage();
});

function criarUsuarioLocalStorage() {
  let email = document.querySelector("#email");
  let btnCadastroInicial = document.querySelector("#btn-cadastro-inicial");

  if (btnCadastroInicial) {
    btnCadastroInicial.addEventListener("click", (event) => {
      let emailValue = email.value;

      let regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      //Validar Comprimento Email.
      if (email.value.length < 2 || email.value.length > 80) {
        alert(
          "Campo obrigatório!\nPor favor, revise o preenchimento do campo email."
        );
        return;
      }

      // Verificando se o e-mail é valido
      if (!regexEmail.test(emailValue)) {
        alert(
          "Email inválido!\nPor favor, verifique o preenchimento do campo email."
        );
        return;
      }

      // Cria um objeto com os dados
      let dataUser = {
        email: emailValue,
      };

      //Obter Dados.
      let user = localStorage.getItem("userConectado");
      if (user) {
        let usuario = JSON.parse(user);

        if (usuario.email === emailValue) {
          alert(
            "O Email foi utilizado em um cadastro anterior. \nPor favor, utilize outro email ou se desejar faça o login com sua conta clicando em CONECTAR."
          );
          return;
        }
      }

      // Salvar no Local Storage.
      localStorage.setItem("userConectado", JSON.stringify(dataUser));
      if (localStorage.getItem("userConectado")) {
        alert(
          "CADASTRO REALIZADO COM SUCESSO! \nApós o carregamento da página clique no botão CONECTAR e informe o email cadastrado."
        );

        location.reload();
        return;
      }
    });
  }
}

function loginUsuarioLocalStorage() {
  let email = document.querySelector("#email-login");
  let btnLogin = document.querySelector("#btn-login");

  if (btnLogin) {
    btnLogin.addEventListener("click", (event) => {
      let emailValue = email.value;
      let regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      //Validar Comprimento Email.
      if (email.value.length < 2 || email.value.length > 80) {
        alert(
          "Campo obrigatório!\nPor favor, revise o preenchimento do campo email."
        );
        return;
      }

      // Verificando se o e-mail é valido
      if (!regexEmail.test(emailValue)) {
        alert(
          "Email inválido!\nPor favor, verifique o preenchimento do campo email."
        );
        return;
      }

      //Email não cadastrado
      let user = localStorage.getItem("userConectado");
      let userResult = JSON.parse(user);

      if (userResult.email !== emailValue) {
        alert(
          "O Email informado não foi encontrado. \nPor favor, realize o cadastro clicando no botão CADASTRE-SE."
        );
        return;
      }

      //Email - Conectar
      if (user) {
        if (userResult.email === emailValue) {
          let dataUser = {
            email: userResult.email,
          };

          localStorage.setItem("userConectado", JSON.stringify(dataUser));
          sessionStorage.setItem("userConectado", userResult.email);
          window.location.href = "instrucoes.html";
        }
      }
    });
  }
}

function kanban() {
  let draggedCard = null;
  let touchStartX = 0,
    touchStartY = 0;

  // Adiciona Livros
  const addBookBtn = document.getElementById("addBookBtn");

  if (addBookBtn) {
    addBookBtn.addEventListener("click", () => {
      const bookName = prompt("Digite o nome do livro:");
      if (bookName) {
        const newBook = document.createElement("div");
        const cardId = `${bookName}-tag${Date.now()}`;
        newBook.id = cardId;
        newBook.className = "kanban-card";
        newBook.draggable = true;
        newBook.textContent = bookName;

        addDragAndDropHandlers(newBook);
        document.getElementById("aguardandoLeitura").appendChild(newBook);

        // Salvar na localStorage
        saveCardToLocalStorage(cardId, "aguardandoLeitura");
      }
    });
  }

  function addDragAndDropHandlers(card) {
    card.addEventListener("dragstart", (e) => {
      draggedCard = card;
      e.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("dragend", () => {
      draggedCard = null;
    });

    card.addEventListener("touchstart", (e) => {
      draggedCard = card;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    card.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const elementUnderTouch = document.elementFromPoint(touchX, touchY);
      const targetColumn = elementUnderTouch?.closest(".kanban-column");

      if (targetColumn) {
        targetColumn.classList.add("drag-over");
      }
    });

    card.addEventListener("touchend", (e) => {
      const touchX = e.changedTouches[0].clientX;
      const touchY = e.changedTouches[0].clientY;

      const elementUnderTouch = document.elementFromPoint(touchX, touchY);
      const targetColumn = elementUnderTouch?.closest(".kanban-column");

      if (targetColumn && draggedCard) {
        targetColumn.appendChild(draggedCard);
        saveCardToLocalStorage(draggedCard.id, targetColumn.id);
      }

      document
        .querySelectorAll(".kanban-column")
        .forEach((column) => column.classList.remove("drag-over"));
      draggedCard = null;
    });
  }

  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach((column) => {
    // Suporte a desktop
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");

      if (draggedCard) {
        column.appendChild(draggedCard);
        saveCardToLocalStorage(draggedCard.id, column.id);
      }
    });
  });

  function saveCardToLocalStorage(cardId, columnId) {
    let user = JSON.parse(localStorage.getItem("userConectado"));
    let valueSession = sessionStorage.getItem("userConectado");

    if (!user || !valueSession || user.email !== valueSession) {
      if (window.location.pathname !== "/index.html") {
        sessionStorage.removeItem("userConectado");
        localStorage.removeItem("userConectado");

        window.location = "index.html";
        alert("Realize o Login novamente.");
        return;
      }
    }

    const savedCards =
      JSON.parse(localStorage.getItem("data-user-" + user.email)) || {};
    savedCards[cardId] = columnId;
    localStorage.setItem("data-user-" + user.email, JSON.stringify(savedCards));
  }

  function loadCardsFromLocalStorage() {
    let user = JSON.parse(localStorage.getItem("userConectado"));
    let valueSession = sessionStorage.getItem("userConectado");

    if (!user || !valueSession || user.email !== valueSession) {
      if (window.location.pathname !== "/index.html") {
        sessionStorage.removeItem("userConectado");
        localStorage.removeItem("userConectado");

        window.location = "index.html";
        alert("Realize o Login novamente.");
        return;
      }
    }

    const savedCards =
      JSON.parse(localStorage.getItem("data-user-" + user.email)) || {};
    Object.entries(savedCards).forEach(([cardId, columnId]) => {
      const column = document.getElementById(columnId);
      if (column) {
        const card = document.createElement("div");
        card.id = cardId;
        card.className = "kanban-card";
        card.draggable = true;

        card.textContent = cardId.split("-")[0];
        addDragAndDropHandlers(card);
        column.appendChild(card);
      }
    });
  }

  const cards = document.querySelectorAll(".kanban-card");
  cards.forEach((card) => {
    addDragAndDropHandlers(card);
    saveCardToLocalStorage(card.id, card.parentElement.id); // Salva o estado inicial
  });

  //Recarrega
  window.onload = loadCardsFromLocalStorage;
}
