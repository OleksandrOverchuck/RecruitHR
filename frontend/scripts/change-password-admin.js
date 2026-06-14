document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    alert("Brak dostępu do tej strony");
    window.location.href = "login.html";
    return;
  }

  document
    .getElementById("changePasswordForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword !== confirmPassword) {
        alert("Nowe hasła się nie zgadzają");
        return;
      }

      if (newPassword.length < 6) {
        alert("Nowe hasło musi mieć co najmniej 6 znaków");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8080/api/admin/change-password",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              oldPassword,
              newPassword,
            }),
          },
        );

        const result = await response.text();

        if (response.ok) {
          alert("Hasło zostało zmienione pomyślnie");
          document.getElementById("changePasswordForm").reset();
        } else {
          alert(result || "Nie udało się zmienić hasła");
        }
      } catch (error) {
        console.error("Błąd zmiany hasła:", error);
        alert("Błąd połączenia z serwerem");
      }
    });

  document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });
});
