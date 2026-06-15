document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    alert("Brak dostępu do panelu administratora");
    window.location.href = "login.html";
    return;
  }

  await loadUsers();

  document
    .getElementById("searchBtn")
    .addEventListener("click", async function () {
      const query = document.getElementById("searchInput").value.trim();
      await loadUsers(query);
    });

  document
    .getElementById("clearSearchBtn")
    .addEventListener("click", async function () {
      document.getElementById("searchInput").value = "";
      await loadUsers();
    });
});

async function loadUsers(query = "") {
  const token = localStorage.getItem("token");
  const loggedInEmail = localStorage.getItem("email");

  try {
    let url = "http://localhost:8080/api/admin/users";

    if (query) {
      url += `?query=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Nie udało się pobrać użytkowników");
    }

    const users = await response.json();
    const container = document.getElementById("usersList");
    container.innerHTML = "";

    if (users.length === 0) {
      container.innerHTML =
        "<p>Brak użytkowników spełniających kryteria wyszukiwania.</p>";
      return;
    }

    users.forEach((user) => {
      const isLoggedAdmin = user.email === loggedInEmail;

      const userCard = document.createElement("div");
      userCard.className = "offer-card";

      let profileImageHTML = `<div style="text-align: center; margin-bottom: 15px;">`;
      if (user.profileImageName) {
        profileImageHTML += `<img src="http://localhost:8080/api/users/${user.id}/photo" alt="${user.firstName} ${user.lastName}" class="profile-image" />`;
      } else {
        profileImageHTML += `<div class="profile-image">${user.firstName[0]}${user.lastName[0]}</div>`;
      }
      profileImageHTML += `</div>`;

      userCard.innerHTML = `
        ${profileImageHTML}
        <h3 style="text-align: center;">${user.firstName} ${user.lastName}</h3>
        <p><strong>Numer indeksu:</strong> ${user.indexNumber}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Aktualna rola:</strong> ${user.role}</p>

        ${
          isLoggedAdmin
            ? `<p style="color: #dc2626; font-weight: bold;">Nie możesz zmienić swojej własnej roli</p>`
            : `
              <select id="role-${user.id}" class="profile-input">
                <option value="USER" ${user.role === "USER" ? "selected" : ""}>USER</option>
                <option value="EMPLOYEE" ${user.role === "EMPLOYEE" ? "selected" : ""}>EMPLOYEE</option>
                <option value="HR" ${user.role === "HR" ? "selected" : ""}>HR</option>
                <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
              </select>

              <button class="dashboard-btn" onclick="updateUserRole(${user.id})" style="width: 100%;">
                Zmień rolę
              </button>
            `
        }
      `;

      container.appendChild(userCard);
    });
  } catch (error) {
    console.error("Błąd:", error);
    alert("Nie udało się załadować użytkowników");
  }
}

async function updateUserRole(userId) {
  const token = localStorage.getItem("token");
  const role = document.getElementById(`role-${userId}`).value;

  try {
    const response = await fetch(
      `http://localhost:8080/api/admin/users/${userId}/role`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      },
    );

    const result = await response.text();

    if (response.ok) {
      alert("Rola została zmieniona");
      await loadUsers(document.getElementById("searchInput").value.trim());
    } else {
      alert(result || "Nie udało się zmienić roli");
    }
  } catch (error) {
    console.error("Błąd zmiany roli:", error);
    alert("Błąd połączenia z serwerem");
  }
}

document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();

  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  window.location.href = "login.html";
});
