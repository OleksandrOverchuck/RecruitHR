document.addEventListener("DOMContentLoaded", async function () {
  await loadEmployeeProfile();
});

async function loadEmployeeProfile() {
  const token = localStorage.getItem("token");

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

    const text = await response.text();

    if (!response.ok) {
      throw new Error("Nie udało się pobrać danych pracownika");
    }

    const data = JSON.parse(text);

    // Redirect if not an EMPLOYEE
    if (data.role !== "EMPLOYEE") {
      alert("Dostęp tylko dla pracowników");
      window.location.href = "index.html";
      return;
    }

    const fullName = `${data.firstName} ${data.lastName}`;

    document.getElementById("fullName").textContent = fullName;
    document.getElementById("emailText").textContent = data.email;
    document.getElementById("indexNumber").textContent =
      data.indexNumber || "-";
    document.getElementById("roleText").textContent = "Pracownik";

    document.getElementById("editFirstName").value = data.firstName;
    document.getElementById("editLastName").value = data.lastName;

    document.getElementById("miniFullName").textContent = fullName;

    const initials =
      (data.firstName?.charAt(0) || "") + (data.lastName?.charAt(0) || "");

    const avatar = document.getElementById("userAvatar");
    const profileImage = document.getElementById("profileImagePreview");

    if (data.profileImageName) {
      await loadProfilePhoto(token);
      profileImage.style.display = "block";
      avatar.style.display = "none";
    } else {
      profileImage.style.display = "none";
      avatar.style.display = "flex";
      avatar.textContent = initials.toUpperCase();
    }

    const cvStatus = document.getElementById("cvStatus");
    const downloadCvBtn = document.getElementById("downloadCvBtn");

    if (data.cvFileName) {
      cvStatus.textContent = `Dodane CV: ${data.cvFileName}`;
      downloadCvBtn.style.display = "inline-block";
      downloadCvBtn.onclick = downloadCV;
    } else {
      cvStatus.textContent = "Nie dodano jeszcze CV.";
      downloadCvBtn.style.display = "none";
    }

    // Setup profile form
    document
      .getElementById("profileForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        await updateEmployeeProfile(token);
      });

    // Setup logout
    document.getElementById("logoutBtn").addEventListener("click", function () {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  } catch (error) {
    console.error("Błąd:", error);
    alert("Sesja wygasła lub nie udało się pobrać danych");
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

async function updateEmployeeProfile(token) {
  const firstName = document.getElementById("editFirstName").value;
  const lastName = document.getElementById("editLastName").value;

  try {
    const response = await fetch("http://localhost:8080/api/users/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
      }),
    });

    if (!response.ok) {
      throw new Error("Nie udało się zaktualizować profilu");
    }

    alert("Profil został zaktualizowany");
    location.reload();
  } catch (error) {
    console.error("Błąd:", error);
    alert("Nie udało się zaktualizować profilu");
  }
}

async function downloadCV() {
  const token = localStorage.getItem("token");

  try {
    const userResponse = await fetch("http://localhost:8080/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const userData = await userResponse.json();
    const userId = userData.id;

    const cvResponse = await fetch(
      `http://localhost:8080/api/users/${userId}/cv`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!cvResponse.ok) {
      throw new Error("Nie udało się pobrać CV");
    }

    const blob = await cvResponse.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "CV.pdf";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Błąd pobierania CV:", error);
    alert("Nie udało się pobrać CV");
  }
}
