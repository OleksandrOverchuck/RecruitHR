document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);

  if (!token) {
    alert("Nie jesteś zalogowany");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("STATUS /api/users/me:", response.status);

    const text = await response.text();
    console.log("ODPOWIEDŹ BACKENDU:", text);

    if (!response.ok) {
      throw new Error("Nie udało się pobrać danych użytkownika");
    }

    const data = JSON.parse(text);

    const fullName = `${data.firstName} ${data.lastName}`;

    document.getElementById("fullName").textContent = fullName;
    document.getElementById("userEmail").textContent = data.email;
    document.getElementById("userRole").textContent = data.role;

    document.getElementById("miniFullName").textContent = fullName;
    document.getElementById("miniRole").textContent = data.role;

    const initials =
      (data.firstName?.charAt(0) || "") + (data.lastName?.charAt(0) || "");
    document.getElementById("userAvatar").textContent = initials.toUpperCase();

    const cvStatus = document.getElementById("cvStatus");
    const downloadCvBtn = document.getElementById("downloadCvBtn");

    if (data.cvFileName) {
      cvStatus.textContent = `Dodane CV: ${data.cvFileName}`;
      downloadCvBtn.style.display = "inline-block";
    } else {
      cvStatus.textContent = "Nie dodano jeszcze CV.";
      downloadCvBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Błąd:", error);
    alert("Sesja wygasła lub nie udało się pobrać danych użytkownika");
    window.location.href = "login.html";
  }
});

document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();

  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  alert("Wylogowano pomyślnie");
  window.location.href = "login.html";
});

document
  .getElementById("uploadCvBtn")
  .addEventListener("click", async function () {
    const token = localStorage.getItem("token");
    const fileInput = document.getElementById("cvFileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Wybierz plik PDF");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Możesz przesłać tylko plik PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/users/me/cv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.text();

      if (response.ok) {
        alert("CV zostało dodane pomyślnie");
        location.reload();
      } else {
        alert(result || "Błąd podczas przesyłania CV");
      }
    } catch (error) {
      console.error("Błąd uploadu CV:", error);
      alert("Nie udało się przesłać CV");
    }
  });

document
  .getElementById("downloadCvBtn")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/api/users/me/cv", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Nie udało się pobrać CV");
      }

      const blob = await response.blob();

      let fileName = "cv.pdf";
      const disposition = response.headers.get("Content-Disposition");

      if (disposition && disposition.includes("filename=")) {
        fileName = disposition.split("filename=")[1].replace(/"/g, "").trim();
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Błąd pobierania CV:", error);
      alert("Nie udało się pobrać CV");
    }
  });
