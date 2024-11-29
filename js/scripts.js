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
    if (!window.location.pathname.includes("index.html")) {
      // sessionStorage.removeItem("userConectado");
      // localStorage.removeItem("userConectado");

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

      if (!userResult || !userResult || userResult.email !== emailValue) {
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

  const addBookBtn = document.getElementById("addBookBtn");

  if (addBookBtn) {
    addBookBtn.addEventListener("click", () => {
      const bookName = prompt("Digite o nome do livro:");
      if (bookName) {
        const newBook = createCardElement(bookName);
        document.getElementById("aguardandoLeitura").appendChild(newBook);

        // Salvar na localStorage
        saveCardToLocalStorage(newBook.id, "aguardandoLeitura");
      }
    });
  }

  function createCardElement(bookName) {
    const cardId = `${bookName}-tag${Date.now()}`;
    const card = document.createElement("div");
    card.id = cardId;
    card.className = "kanban-card";
    card.draggable = true;

    card.innerHTML = `
      <span>${bookName}</span>
      <div class="card-actions">
        <button class="btn btn-sm btn-primary edit-btn">Editar</button>
        <button class="btn btn-sm btn-danger delete-btn">Remover</button>
      </div>
    `;

    addDragAndDropHandlers(card);
    addCardActionHandlers(card);

    return card;
  }

  function addCardActionHandlers(card) {
    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        const currentBookName = card.querySelector("span").textContent;
        const newBookName = prompt("Editar o nome do livro:", currentBookName);

        if (newBookName && newBookName !== currentBookName) {
          const oldCardId = card.id;
          const newCardId = `${newBookName}-tag${Date.now()}`;

          // Atualizar o conteúdo do card
          card.querySelector("span").textContent = newBookName;
          card.id = newCardId;

          // Atualizar no localStorage
          updateCardInLocalStorage(oldCardId, newCardId, card.parentElement.id);
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm("Deseja realmente remover este card?")) {
          card.remove();

          removeCardFromLocalStorage(card.id);
        }
      });
    }
  }

  function updateCardInLocalStorage(oldCardId, newCardId, columnId) {
    let user = JSON.parse(localStorage.getItem("userConectado"));
    const savedCards =
      JSON.parse(localStorage.getItem("data-user-" + user.email)) || {};

    // Atualizar a chave do card no localStorage
    delete savedCards[oldCardId];
    savedCards[newCardId] = columnId;

    localStorage.setItem("data-user-" + user.email, JSON.stringify(savedCards));
  }

  function removeCardFromLocalStorage(cardId) {
    let user = JSON.parse(localStorage.getItem("userConectado"));
    const savedCards =
      JSON.parse(localStorage.getItem("data-user-" + user.email)) || {};

    // Remover o card da lista de cards salvos
    delete savedCards[cardId];
    localStorage.setItem("data-user-" + user.email, JSON.stringify(savedCards));
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
      if (!window.location.pathname.includes("index.html")) {
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
      if (!window.location.pathname.includes("index.html")) {
        sessionStorage.removeItem("userConectado");
        localStorage.removeItem("userConectado");

        window.location = "index.html";
        alert("Realize o Login novamente.");
        return;
      }
      return;
    }

    const savedCards =
      JSON.parse(localStorage.getItem("data-user-" + user.email)) || {};

    Object.entries(savedCards).forEach(([cardId, columnId]) => {
      const column = document.getElementById(columnId);
      if (column) {
        const bookName = cardId.split("-")[0];
        const card = createCardElement(bookName);
        card.id = cardId;
        column.appendChild(card);
      }
    });
  }

  window.onload = loadCardsFromLocalStorage;
}
