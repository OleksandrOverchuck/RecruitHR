document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || (role !== "HR" && role !== "ADMIN")) {
    alert("Brak dostępu do zarządzania ofertami");
    window.location.href = "login.html";
    return;
  }

  await loadMyJobOffers();

  // Obsługa formularza dodawania oferty
  document
    .getElementById("jobOfferForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const location = document.getElementById("location").value.trim();
      const level = document.getElementById("level").value.trim();
      const description = document.getElementById("description").value.trim();

      if (!title) {
        alert("Tytuł stanowiska jest wymagany");
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/hr/jobs", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            location,
            level,
            description,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Oferta pracy została dodana");
          document.getElementById("jobOfferForm").reset();
          await loadMyJobOffers();
        } else {
          alert(data.message || "Nie udało się dodać oferty");
        }
      } catch (error) {
        console.error("Błąd dodawania oferty:", error);
        alert("Nie udało się połączyć z serwerem");
      }
    });

  // Obsługa formularza edycji
  document
    .getElementById("editOfferForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const offerId = document.getElementById("editOfferId").value;
      const title = document.getElementById("editTitle").value.trim();
      const location = document.getElementById("editLocation").value.trim();
      const level = document.getElementById("editLevel").value.trim();
      const description = document
        .getElementById("editDescription")
        .value.trim();

      if (!title) {
        alert("Tytuł stanowiska jest wymagany");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/hr/jobs/${offerId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              location,
              level,
              description,
            }),
          },
        );

        if (response.ok) {
          alert("Oferta została zaktualizowana");
          closeEditModal();
          await loadMyJobOffers();
        } else {
          const error = await response.text();
          alert(error || "Nie udało się zaktualizować oferty");
        }
      } catch (error) {
        console.error("Błąd aktualizacji oferty:", error);
        alert("Nie udało się połączyć z serwerem");
      }
    });

  // Obsługa zamykania modala
  document
    .getElementById("closeEditModal")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("closeDetailsModal")
    .addEventListener("click", closeDetailsModal);
  window.addEventListener("click", function (event) {
    const editModal = document.getElementById("editOfferModal");
    const detailsModal = document.getElementById("offerDetailsModal");
    if (event.target === editModal) {
      closeEditModal();
    }
    if (event.target === detailsModal) {
      closeDetailsModal();
    }
  });
});

async function loadMyJobOffers() {
  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("email");
  const container = document.getElementById("jobOffersList");

  console.log("Current user email:", currentUserEmail);

  try {
    const response = await fetch("http://localhost:8080/api/hr/jobs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Nie udało się pobrać ofert");
    }

    const allOffers = await response.json();
    console.log("All offers from backend:", allOffers);

    // Filtruj tylko aktywne oferty stworzone przez zalogowanego HR-a
    const myOffers = allOffers.filter(
      (offer) => offer.ownerEmail === currentUserEmail && offer.active,
    );

    console.log("My offers after filtering:", myOffers);

    if (!myOffers.length) {
      container.innerHTML = "<p>Nie masz żadnych ofert. Dodaj nową!</p>";
      return;
    }

    container.innerHTML = "";

    myOffers.forEach((offer) => {
      const offerCard = document.createElement("div");
      offerCard.className = "offer-card";

      offerCard.innerHTML = `
        <h3>${offer.title}</h3>
        <p><strong>Lokalizacja:</strong> ${offer.location || "-"}</p>
        <p><strong>Poziom:</strong> ${offer.level || "-"}</p>
        <p><strong>Status:</strong> ${offer.active ? "Aktywna" : "Nieaktywna"}</p>
        <div class="offer-actions">
          <button class="dashboard-btn view-offer-btn" data-id="${offer.id}">Wyświetl szczegóły</button>
          <button class="dashboard-btn danger-btn deactivate-offer-btn" data-id="${offer.id}">Dezaktywuj</button>
        </div>
      `;

      container.appendChild(offerCard);

      // Obsługa przycisku wyświetlania szczegółów
      offerCard
        .querySelector(".view-offer-btn")
        .addEventListener("click", () => {
          openDetailsModal(offer);
        });

      // Obsługa przycisku dezaktywacji
      offerCard
        .querySelector(".deactivate-offer-btn")
        .addEventListener("click", () => {
          if (confirm("Czy na pewno chcesz dezaktywować tę ofertę?")) {
            deactivateJobOffer(offer.id);
          }
        });
    });
  } catch (error) {
    console.error("Błąd ładowania ofert:", error);
    container.innerHTML = "<p>Nie udało się pobrać ofert pracy.</p>";
  }
}

function openDetailsModal(offer) {
  document.getElementById("detailsTitle").textContent = offer.title;
  document.getElementById("detailsLocation").textContent =
    offer.location || "-";
  document.getElementById("detailsLevel").textContent = offer.level || "-";
  document.getElementById("detailsStatus").textContent = offer.active
    ? "Aktywna"
    : "Nieaktywna";
  document.getElementById("detailsDescription").textContent =
    offer.description || "Brak opisu";

  // Obsługa przycisków w modalu szczegółów
  document.getElementById("detailsEditBtn").onclick = () => {
    closeDetailsModal();
    openEditModal(offer);
  };

  document.getElementById("detailsDeleteBtn").textContent = "Dezaktywuj";
  document.getElementById("detailsDeleteBtn").onclick = () => {
    if (confirm("Czy na pewno chcesz dezaktywować tę ofertę?")) {
      closeDetailsModal();
      deactivateJobOffer(offer.id);
    }
  };

  document.getElementById("detailsCloseBtn").onclick = closeDetailsModal;

  document.getElementById("offerDetailsModal").style.display = "block";
}

function closeDetailsModal() {
  document.getElementById("offerDetailsModal").style.display = "none";
}

function openEditModal(offer) {
  document.getElementById("editOfferId").value = offer.id;
  document.getElementById("editTitle").value = offer.title;
  document.getElementById("editLocation").value = offer.location || "";
  document.getElementById("editLevel").value = offer.level || "";
  document.getElementById("editDescription").value = offer.description || "";
  document.getElementById("editOfferModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editOfferModal").style.display = "none";
}

async function deleteJobOffer(jobId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:8080/api/hr/jobs/${jobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      alert(`Błąd podczas usuwania: ${body}`);
      return;
    }

    alert("Oferta została usunięta");
    await loadMyJobOffers();
  } catch (error) {
    console.error("Błąd usuwania oferty:", error);
    alert("Nie udało się usunąć oferty");
  }
}

async function deactivateJobOffer(jobId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:8080/api/hr/jobs/${jobId}/deactivate`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.text();

    if (!response.ok) {
      alert(result || "Nie udało się dezaktywować oferty");
      return;
    }

    alert("Oferta została dezaktywowana");
    await loadMyJobOffers();
  } catch (error) {
    console.error("Błąd dezaktywacji oferty:", error);
    alert("Nie udało się połączyć z serwerem");
  }
}

document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault();

  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  alert("Wylogowano pomyślnie");
  window.location.href = "login.html";
});
