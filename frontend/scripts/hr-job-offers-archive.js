document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || (role !== "HR" && role !== "ADMIN")) {
    alert("Brak dostępu do archiwum ofert");
    window.location.href = "login.html";
    return;
  }

  await loadArchivedOffers();

  document
    .getElementById("archiveCloseDetailsModal")
    .addEventListener("click", closeArchiveDetailsModal);
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("archiveOfferDetailsModal");
    if (event.target === modal) {
      closeArchiveDetailsModal();
    }
  });
});

async function loadArchivedOffers() {
  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("email");
  const container = document.getElementById("archivedOffersList");

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
    const archivedOffers = allOffers.filter(
      (offer) => offer.ownerEmail === currentUserEmail && !offer.active,
    );

    if (!archivedOffers.length) {
      container.innerHTML = "<p>Brak zarchiwizowanych ofert.</p>";
      return;
    }

    container.innerHTML = "";

    archivedOffers.forEach((offer) => {
      const offerCard = document.createElement("div");
      offerCard.className = "offer-card";

      offerCard.innerHTML = `
        <h3>${offer.title}</h3>
        <p><strong>Lokalizacja:</strong> ${offer.location || "-"}</p>
        <p><strong>Poziom:</strong> ${offer.level || "-"}</p>
        <p><strong>Status:</strong> ${offer.active ? "Aktywna" : "Nieaktywna"}</p>
        <div class="offer-actions">
          <button class="dashboard-btn view-offer-btn" data-id="${offer.id}">Wyświetl szczegóły</button>
          <button class="dashboard-btn success-btn activate-offer-btn" data-id="${offer.id}">Przywróć</button>
        </div>
      `;

      container.appendChild(offerCard);

      offerCard
        .querySelector(".view-offer-btn")
        .addEventListener("click", () => {
          openArchiveDetailsModal(offer);
        });

      offerCard
        .querySelector(".activate-offer-btn")
        .addEventListener("click", () => {
          if (confirm("Czy na pewno chcesz przywrócić tę ofertę?")) {
            activateJobOffer(offer.id);
          }
        });
    });
  } catch (error) {
    console.error("Błąd ładowania archiwalnych ofert:", error);
    container.innerHTML = "<p>Nie udało się pobrać archiwalnych ofert.</p>";
  }
}

function openArchiveDetailsModal(offer) {
  document.getElementById("archiveDetailsTitle").textContent = offer.title;
  document.getElementById("archiveDetailsLocation").textContent =
    offer.location || "-";
  document.getElementById("archiveDetailsLevel").textContent =
    offer.level || "-";
  document.getElementById("archiveDetailsStatus").textContent = offer.active
    ? "Aktywna"
    : "Nieaktywna";
  document.getElementById("archiveDetailsDescription").textContent =
    offer.description || "Brak opisu";

  document.getElementById("archiveDetailsEditBtn").onclick = () => {
    window.location.href = `hr-job-offers.html?edit=${offer.id}`;
  };

  document.getElementById("archiveDetailsActivateBtn").onclick = () => {
    if (confirm("Czy na pewno chcesz przywrócić tę ofertę?")) {
      activateJobOffer(offer.id);
    }
  };

  document.getElementById("archiveDetailsCloseBtn").onclick =
    closeArchiveDetailsModal;

  document.getElementById("archiveOfferDetailsModal").style.display = "block";
}

function closeArchiveDetailsModal() {
  document.getElementById("archiveOfferDetailsModal").style.display = "none";
}

async function activateJobOffer(jobId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:8080/api/hr/jobs/${jobId}/activate`,
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
      alert(result || "Nie udało się przywrócić oferty");
      return;
    }

    alert("Oferta została przywrócona");
    await loadArchivedOffers();
  } catch (error) {
    console.error("Błąd przywracania oferty:", error);
    alert("Nie udało się połączyć z serwerem");
  }
}
