const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Uzupełnij wszystkie pola");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);

      alert("Zalogowano pomyślnie");

      setTimeout(() => {
        window.location.href = "user-dashboard.html";
      }, 1000);
    } else {
      alert(data.message || "Błąd logowania");
    }
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    alert("Nie udało się połączyć z serwerem");
  }
});
