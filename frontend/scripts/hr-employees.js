const employeesList = document.getElementById("employeesList");
const logoutBtn = document.getElementById("logoutBtn");

const API_BASE_URL = "http://localhost:8080/api";

async function loadEmployees() {
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
      throw new Error("Błąd podczas pobierania pracowników");
    }

    const applications = await response.json();

    // Filtruj aplikacje gdzie status == HIRED
    const hiredEmployees = applications.filter((app) => app.status === "HIRED");

    if (hiredEmployees.length === 0) {
      employeesList.innerHTML =
        '<p style="grid-column: 1 / -1; text-align: center;">Brak zatrudnionych pracowników</p>';
      return;
    }

    // Sortuj pracowników po nazwisku
    hiredEmployees.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    employeesList.innerHTML = hiredEmployees
      .map(
        (employee) => `
      <div class="employee-card">
        <div class="employee-header">
          <h3>${employee.firstName} ${employee.lastName}</h3>
          ${employee.profileImageName ? `<img src="${API_BASE_URL}/users/${employee.userId}/photo" alt="${employee.firstName}" class="employee-avatar">` : '<div class="employee-avatar-placeholder">' + employee.firstName.charAt(0) + employee.lastName.charAt(0) + "</div>"}
        </div>
        <div class="employee-info">
          <p><strong>Email:</strong> ${employee.email}</p>
          <p><strong>Nr indeksu:</strong> ${employee.indexNumber || "Brak"}</p>
          <p><strong>Stanowisko:</strong> ${employee.jobTitle}</p>
          <p><strong>Data zatrudnienia:</strong> ${new Date(employee.appliedAt).toLocaleDateString("pl-PL")}</p>
        </div>
        <div class="employee-actions">
          ${employee.cvFileName ? `<a href="${API_BASE_URL}/users/${employee.userId}/cv" class="btn-small" download>Pobierz CV</a>` : ""}
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Błąd:", error);
    employeesList.innerHTML =
      '<p style="grid-column: 1 / -1; text-align: center; color: red;">Błąd podczas pobierania pracowników</p>';
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

loadEmployees();
