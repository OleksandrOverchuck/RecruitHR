document.addEventListener("DOMContentLoaded", async function () {
  await loadAllJobs();
});

async function loadAllJobs() {
  const container = document.getElementById("allJobsList");

  try {
    const response = await fetch("http://localhost:8080/api/jobs", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Nie udało się pobrać ofert pracy");
    }

    const offers = await response.json();

    if (!offers.length) {
      container.innerHTML = "<p>Brak dostępnych ofert pracy.</p>";
      return;
    }

    container.innerHTML = "";

    offers.forEach((offer) => {
      const offerCard = document.createElement("div");
      offerCard.className = "offer-card";

      offerCard.innerHTML = `
        <h3>${offer.title}</h3>
        <p><strong>Lokalizacja:</strong> ${offer.location || "-"}</p>
        <p><strong>Poziom:</strong> ${offer.level || "-"}</p>
        <p class="offer-brief">${offer.description || "Brak opisu"}</p>
        <button class="dashboard-btn offer-apply-btn">Aplikuj</button>
      `;

      // open modal on card click (except when clicking apply button)
      offerCard.addEventListener("click", (e) => {
        if (e.target.closest(".offer-apply-btn")) return; // ignore clicks on apply button
        openOfferModal(offer);
      });

      // handle apply button inside card
      offerCard
        .querySelector(".offer-apply-btn")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          applyForJob(offer.id);
        });

      container.appendChild(offerCard);
    });
  } catch (error) {
    console.error("Błąd ładowania ofert:", error);
    container.innerHTML = "<p>Nie udało się pobrać ofert pracy.</p>";
  }
}

async function applyForJob(jobId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Musisz się zalogować, aby aplikować na ofertę");
    window.location.href = "login.html";
    return;
  }

  const confirmed = confirm("Czy chcesz aplikować na tę ofertę?");
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/jobs/${jobId}/apply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.text();

    if (response.ok) {
      alert("Aplikacja została wysłana pomyślnie");
    } else {
      alert(result || "Nie udało się wysłać aplikacji");
    }
  } catch (error) {
    console.error("Błąd aplikowania:", error);
    alert("Nie udało się połączyć z serwerem");
  }
}

// --- Modal logic ---
const modal = document.getElementById("offerModal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDescription = document.getElementById("modalDescription");
const modalApplyBtn = document.getElementById("modalApplyBtn");
let currentModalJobId = null;

function openOfferModal(offer) {
  currentModalJobId = offer.id;
  modalTitle.textContent = offer.title;
  modalMeta.textContent = `Lokalizacja: ${offer.location || "-"} • Poziom: ${offer.level || "-"} `;
  modalDescription.textContent = offer.description || "Brak opisu";
  modal.style.display = "flex";
  // attach apply handler
  modalApplyBtn.onclick = () => applyForJob(offer.id);
}

function closeOfferModal() {
  modal.style.display = "none";
  currentModalJobId = null;
}

modalClose.addEventListener("click", closeOfferModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeOfferModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "flex") closeOfferModal();
});
