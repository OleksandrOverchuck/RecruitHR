const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    alert("Uzupełnij wszystkie pola");
    return;
  }

  if (password !== confirmPassword) {
    alert("Hasła nie są takie same");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(
        "Konto zostało zarejestrowane. Za chwilę zostaniesz przeniesiony do logowania.",
      );

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      alert(data.message || "Błąd rejestracji");
    }
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
    alert("Nie udało się połączyć z serwerem");
  }
});
