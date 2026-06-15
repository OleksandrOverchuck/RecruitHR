const applicationsList = document.getElementById("applicationsList");
const logoutBtn = document.getElementById("logoutBtn");

const API_BASE_URL = "http://localhost:8080/api";

let currentApplicationId = null;
let currentCandidateName = null;

async function loadApplications() {
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
      throw new Error("Błąd podczas pobierania aplikacji");
    }

    const applications = await response.json();

    // Filtruj aplikacje gdzie status != HIRED
    const activeApplications = applications.filter(
      (app) => app.status !== "HIRED",
    );

    if (activeApplications.length === 0) {
      applicationsList.innerHTML =
        '<p style="grid-column: 1 / -1; text-align: center;">Brak aktywnych aplikacji</p>';
      return;
    }

    applicationsList.innerHTML = activeApplications
      .map(
        (app) => `
      <div class="application-card">
        <div class="application-header">
          <h3>${app.firstName} ${app.lastName}</h3>
          <span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span>
        </div>
        <div class="application-info">
          <p><strong>Email:</strong> ${app.email}</p>
          <p><strong>Nr indeksu:</strong> ${app.indexNumber || "Brak"}</p>
          <p><strong>Stanowisko:</strong> ${app.jobTitle}</p>
          <p><strong>Data aplikacji:</strong> ${new Date(app.appliedAt).toLocaleDateString("pl-PL")}</p>
        </div>
        <div class="application-actions">
          ${app.cvFileName ? `<a href="${API_BASE_URL}/users/${app.userId}/cv" class="btn-small" download>Pobierz CV</a>` : ""}
          <button class="btn-small hire-btn" onclick="openAcceptModal(${app.id}, '${app.firstName} ${app.lastName}')">Akceptuj</button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Błąd:", error);
    applicationsList.innerHTML =
      '<p style="grid-column: 1 / -1; text-align: center; color: red;">Błąd podczas pobierania aplikacji</p>';
  }
}

function openAcceptModal(applicationId, candidateName) {
  currentApplicationId = applicationId;
  currentCandidateName = candidateName;
  document.getElementById("candidateName").value = candidateName;
  document.getElementById("position").value = "";
  document.getElementById("salary").value = "";
  document.getElementById("acceptModal").style.display = "flex";
}

function closeAcceptModal() {
  document.getElementById("acceptModal").style.display = "none";
  currentApplicationId = null;
  currentCandidateName = null;
}

function generatePDF() {
  alert("Funkcja generowania PDF będzie dostępna w wersji .NET");
}

document.getElementById("acceptForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const position = document.getElementById("position").value.trim();
  const salary = parseFloat(document.getElementById("salary").value);

  if (!position || !salary) {
    alert("Wszystkie pola są wymagane");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/hr/applications/${currentApplicationId}/accept`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position,
          salary,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    alert("Kandydat został zaakceptowany!");
    closeAcceptModal();
    loadApplications();
  } catch (error) {
    console.error("Błąd:", error);
    alert("Błąd podczas akceptowania kandydata: " + error.message);
  }
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

loadApplications();
