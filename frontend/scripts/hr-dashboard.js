document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || (role !== "HR" && role !== "ADMIN")) {
    alert("Brak dostępu do panelu HR");
    window.location.href = "login.html";
    return;
  }

  await loadHrProfile();
  await loadJobOffers();
});

async function loadHrProfile() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:8080/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error("Nie udało się pobrać danych użytkownika");
    }

    const data = JSON.parse(text);

    const fullName = `${data.firstName} ${data.lastName}`;

    document.getElementById("fullName").textContent = fullName;
    document.getElementById("emailText").textContent = data.email;
    document.getElementById("roleText").textContent = data.role;
    document.getElementById("indexNumberText").textContent =
      data.indexNumber || "-";

    document.getElementById("editFirstName").value = data.firstName;
    document.getElementById("editLastName").value = data.lastName;

    document.getElementById("miniFullName").textContent = fullName;
    document.getElementById("miniRole").textContent = `Rola: ${data.role}`;

    const initials =
      (data.firstName?.charAt(0) || "") + (data.lastName?.charAt(0) || "");

    const avatar = document.getElementById("userAvatar");
    const profileImage = document.getElementById("profileImagePreview");
    const photoStatus = document.getElementById("photoStatus");

    if (data.profileImageName) {
      await loadProfilePhoto(token);
      profileImage.style.display = "block";
      avatar.style.display = "none";
      photoStatus.textContent = `Dodano zdjęcie profilowe: ${data.profileImageName}`;
    } else {
      profileImage.style.display = "none";
      avatar.style.display = "flex";
      avatar.textContent = initials.toUpperCase();
      photoStatus.textContent = "Nie dodano jeszcze zdjęcia profilowego.";
    }
  } catch (error) {
    console.error("Błąd:", error);
    alert("Sesja wygasła lub nie udało się pobrać danych użytkownika");
    window.location.href = "login.html";
  }
}

async function loadProfilePhoto(token) {
  try {
    const response = await fetch("http://localhost:8080/api/users/me/photo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Nie udało się pobrać zdjęcia profilowego");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    const profileImage = document.getElementById("profileImagePreview");
    profileImage.src = imageUrl;
  } catch (error) {
    console.error("Błąd ładowania zdjęcia:", error);
  }
}

document
  .getElementById("profileForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const firstName = document.getElementById("editFirstName").value.trim();
    const lastName = document.getElementById("editLastName").value.trim();

    if (!firstName || !lastName) {
      alert("Imię i nazwisko są wymagane");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      const result = await response.text();

      if (response.ok) {
        alert("Profil został zaktualizowany");
        await loadHrProfile();
      } else {
        alert(result || "Nie udało się zapisać zmian");
      }
    } catch (error) {
      console.error("Błąd aktualizacji profilu:", error);
      alert("Nie udało się zaktualizować profilu");
    }
  });

document
  .getElementById("uploadPhotoBtn")
  .addEventListener("click", async function () {
    const token = localStorage.getItem("token");
    const fileInput = document.getElementById("photoFileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Wybierz zdjęcie");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Dozwolone są tylko pliki JPG, JPEG i PNG");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/users/me/photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.text();

      if (response.ok) {
        alert("Zdjęcie profilowe zostało zapisane");
        document.getElementById("photoFileInput").value = "";
        await loadHrProfile();
      } else {
        alert(result || "Nie udało się przesłać zdjęcia");
      }
    } catch (error) {
      console.error("Błąd uploadu zdjęcia:", error);
      alert("Nie udało się przesłać zdjęcia");
    }
  });

document
  .getElementById("deletePhotoBtn")
  .addEventListener("click", async function () {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/api/users/me/photo", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.text();

      if (response.ok) {
        alert("Zdjęcie profilowe zostało usunięte");
        await loadHrProfile();
      } else {
        alert(result || "Nie udało się usunąć zdjęcia");
      }
    } catch (error) {
      console.error("Błąd usuwania zdjęcia:", error);
      alert("Nie udało się usunąć zdjęcia");
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
