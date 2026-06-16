const API_BASE_URL = "http://localhost:8080/api";
const logoutBtn = document.getElementById("logoutBtn");

const columnIds = {
  ACCEPTED: "acceptedColumn",
  INTERVIEW: "interviewColumn",
  CONTRACT_SIGNING: "contractColumn",
  HIRED: "hiredColumn",
};

let draggedApplicationId = null;

async function loadKanban() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(`${API_BASE_URL}/hr/applications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
      throw new Error("Błąd podczas pobierania kandydatów");
    }

    const applications = await response.json();
    const kanbanApplications = applications.filter((app) =>
      ["ACCEPTED", "INTERVIEW", "CONTRACT_SIGNING", "HIRED"].includes(
        app.status,
      ),
    );

    Object.values(columnIds).forEach((columnId) => {
      const column = document.getElementById(columnId);
      if (column) {
        column.innerHTML = "";
      }
    });

    kanbanApplications.forEach((app) => {
      const column = document.getElementById(columnIds[app.status]);
      if (!column) {
        return;
      }

      const card = document.createElement("div");
      card.className = "kanban-card";
      card.draggable = true;
      card.dataset.applicationId = app.id;
      card.dataset.status = app.status;

      card.innerHTML = `
        <h3>${app.firstName} ${app.lastName}</h3>
        <p>${app.email}</p>
        <span class="kanban-status status-${app.status.toLowerCase()}">${app.status.replace("_", " ")}</span>
        <div class="card-actions">
          ${app.status === "CONTRACT_SIGNING" ? `<button class="btn-small" onclick="sendContract(${app.id})">Generuj umowę</button>` : ""}
        </div>
      `;

      card.addEventListener("dragstart", handleDragStart);
      card.addEventListener("dragend", handleDragEnd);

      column.appendChild(card);
    });

    Object.values(columnIds).forEach((columnId) => {
      const column = document.getElementById(columnId).parentElement;
      column.addEventListener("dragover", handleDragOver);
      column.addEventListener("drop", handleDrop);
      column.addEventListener("dragleave", handleDragLeave);
    });
  } catch (error) {
    console.error("Błąd:", error);
    alert("Błąd podczas ładowania tablicy Kanban: " + error.message);
  }
}

function handleDragStart(event) {
  draggedApplicationId = event.target.dataset.applicationId;
  event.target.classList.add("dragging");
}

function handleDragEnd(event) {
  event.target.classList.remove("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function handleDrop(event) {
  event.preventDefault();
  const column = event.currentTarget;
  column.classList.remove("drag-over");

  const newStatus = column.dataset.status;
  if (!draggedApplicationId || !newStatus) {
    return;
  }

  updateApplicationStatus(draggedApplicationId, newStatus);
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

async function updateApplicationStatus(applicationId, status) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/hr/applications/${applicationId}/status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    await loadKanban();
  } catch (error) {
    console.error("Błąd:", error);
    alert("Błąd podczas aktualizacji statusu: " + error.message);
  }
}

async function sendContract(applicationId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/hr/applications/${applicationId}/contract`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    alert("Umowa została wygenerowana i wysłana do użytkownika.");
    await loadKanban();
  } catch (error) {
    console.error("Błąd:", error);
    alert("Błąd podczas generowania umowy: " + error.message);
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

loadKanban();
