
/* =========================================
   LOGIN PROTECTION
========================================= */
const loggedIn =
  localStorage.getItem("socialcraft.loggedIn") === "true";

const userRole =
  localStorage.getItem("socialcraft.role");

if (!loggedIn) {
  window.location.href = "login.html";
}

if (loggedIn && userRole === "admin") {
  window.location.href = "admin.html";
}

/* =========================================
   CONFIGURATION
========================================= */
const EVENTS_API = "event.php";
const BOOKING_API = "book.php";

const EVENT_DETAILS = {
  "paint-sip": {
    category: "Painting",
    description: "Relax, paint, and enjoy a creative session with friends."
  },
  "pottery": {
    category: "Pottery",
    description: "Create your own handmade pottery piece."
  },
  "board-games": {
    category: "Games",
    description: "Enjoy fun board games and meet new people."
  },
  "mixology": {
    category: "Mixology",
    description: "Learn the basics of making creative drinks."
  },
  "craft-night": {
    category: "Crafts",
    description: "A relaxing evening filled with fun DIY crafts."
  },
  "canvas": {
    category: "Art",
    description: "Create a beautiful canvas artwork."
  },
  "clay-art": {
    category: "Clay",
    description: "Shape and decorate your own clay creation."
  },
  "friendship-bracelet": {
    category: "Crafts",
    description: "Create colorful handmade friendship bracelets."
  }
};

let EVENTS = [];
let loadingEvents = false;
let submittingBooking = false;

/* =========================================
   HELPERS
========================================= */
function peso(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

function todayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentUsername() {
  return localStorage.getItem("socialcraft.username") || "";
}

async function readJSON(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Hindi valid JSON ang server response. Tingnan ang PHP error."
    );
  }
}

function toast(message) {
  const element = document.getElementById("toast");

  if (element) {
    element.textContent = message;
    element.classList.add("show");

    setTimeout(() => {
      element.classList.remove("show");
    }, 3000);
  } else {
    alert(message);
  }
}

function setError(fieldId, show) {
  const field = document.getElementById(fieldId);

  if (field) {
    field.classList.toggle("invalid", show);
  }
}

/* =========================================
   LOAD EVENTS FROM MYSQL
========================================= */
async function loadEvents() {
  if (loadingEvents) return;

  loadingEvents = true;

  const eventGrid = document.getElementById("eventGrid");

  if (eventGrid) {
    eventGrid.textContent = "Loading events...";
  }

  try {
    const response = await fetch(EVENTS_API, {
      method: "GET",
      cache: "no-store"
    });

    const data = await readJSON(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load events.");
    }

    EVENTS = (data.events || []).map(event => {
      const details = EVENT_DETAILS[event.id] || {};

      return {
        ...event,
        id: String(event.id),
        title: event.title,
        category: details.category || "Workshop",
        description: details.description || "",
        price: Number(event.price),
        capacity: Number(event.capacity),
        booked: Number(event.booked),
        available: Number(event.available)
      };
    });

    renderEvents();
    populateEventSelect();
    updateTotal();
  } catch (error) {
    console.error("Event loading error:", error);

    if (eventGrid) {
      eventGrid.textContent =
        "Hindi ma-load ang events. Tingnan kung running ang Apache at MySQL.";
    }

    toast(error.message);
  } finally {
    loadingEvents = false;
  }
}

/* =========================================
   RENDER EVENT CARDS
========================================= */
function renderEvents() {
  const eventGrid = document.getElementById("eventGrid");

  if (!eventGrid) return;

  eventGrid.innerHTML = "";

  EVENTS.forEach(event => {
    const remaining = Math.max(0, event.available);

    const card = document.createElement("article");
    card.className = "card";

    const top = document.createElement("div");
    top.className = "card-top";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = event.category;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = `${remaining} seats left`;

    top.append(tag, meta);

    const title = document.createElement("h3");
    title.textContent = event.title;

    const description = document.createElement("p");
    description.className = "detail";
    description.textContent = event.description;

    const bottom = document.createElement("div");
    bottom.className = "card-bottom";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = peso(event.price);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.dataset.bookEvent = event.id;
    button.disabled = remaining <= 0;
    button.textContent = remaining <= 0 ? "Full" : "Book Now";

    button.addEventListener("click", () => {
      const select = document.getElementById("eventSelect");

      if (select) {
        select.value = event.id;
        updateTotal();
      }

      const bookingSection =
        document.getElementById("booking") ||
        document.getElementById("bookingForm");

      if (bookingSection) {
        bookingSection.scrollIntoView({
          behavior: "smooth"
        });
      }
    });

    bottom.append(price, button);
    card.append(top, title, description, bottom);
    eventGrid.appendChild(card);
  });
}

/* =========================================
   POPULATE EVENT SELECT
========================================= */
function populateEventSelect() {
  const select = document.getElementById("eventSelect");

  if (!select) return;

  const previousValue = select.value;

  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select an event...";
  select.appendChild(placeholder);

  EVENTS.forEach(event => {
    const option = document.createElement("option");
    option.value = event.id;

    option.textContent =
      `${event.title} — ${peso(event.price)} (${event.available} seats left)`;

    option.disabled = event.available <= 0;

    select.appendChild(option);
  });

  if (
    previousValue &&
    EVENTS.some(event =>
      event.id === previousValue && event.available > 0
    )
  ) {
    select.value = previousValue;
  }
}

/* =========================================
   UPDATE TOTAL
========================================= */
function updateTotal() {
  const eventSelect = document.getElementById("eventSelect");
  const guestsInput = document.getElementById("guestsInput");
  const totalAmount = document.getElementById("totalAmount");

  if (!eventSelect || !guestsInput || !totalAmount) return;

  const selectedEvent = EVENTS.find(
    event => event.id === eventSelect.value
  );

  const guests = Number(guestsInput.value || 0);

  totalAmount.textContent = selectedEvent
    ? peso(selectedEvent.price * guests)
    : peso(0);
}

/* =========================================
   BOOKING FORM
========================================= */
function setupBookingForm() {
  const form = document.getElementById("bookingForm");

  if (!form) return;

  const eventSelect = document.getElementById("eventSelect");
  const dateInput = document.getElementById("dateInput");
  const timeSelect = document.getElementById("timeSelect");
  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const phoneInput = document.getElementById("phoneInput");
  const guestsInput = document.getElementById("guestsInput");
  const submitButton = document.getElementById("confirmReservationBtn");

  if (
    !eventSelect ||
    !dateInput ||
    !timeSelect ||
    !nameInput ||
    !emailInput ||
    !phoneInput ||
    !guestsInput
  ) {
    console.error("May booking form element na nawawala sa index.html.");
    return;
  }

  dateInput.min = todayISO();

  eventSelect.addEventListener("change", updateTotal);
  guestsInput.addEventListener("input", updateTotal);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (submittingBooking) return;

    let valid = true;

    const eventId = eventSelect.value;
    const date = dateInput.value;
    const time = timeSelect.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const guests = Number(guestsInput.value);
    const username = getCurrentUsername();

    const selectedEvent = EVENTS.find(
      event => event.id === eventId
    );

    const checks = [
      ["f-event", Boolean(eventId)],
      ["f-date", Boolean(date) && date >= todayISO()],
      ["f-time", Boolean(time)],
      ["f-name", name.length >= 2],
      ["f-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)],
      ["f-phone", /^[0-9+\-\s()]{7,20}$/.test(phone)],
      ["f-guests", Number.isInteger(guests) && guests >= 1 && guests <= 10]
    ];

    checks.forEach(([fieldId, passed]) => {
      setError(fieldId, !passed);
      if (!passed) valid = false;
    });

    if (!username) {
      toast("Hindi makita ang username mo. Mag-login ulit.");
      return;
    }

    if (!selectedEvent) {
      setError("f-event", true);
      toast("Pumili ng valid na event.");
      return;
    }

    if (guests > selectedEvent.available) {
      toast(`Available seats na lang: ${selectedEvent.available}.`);
      return;
    }

    if (!valid) {
      toast("Pakisuri ang lahat ng booking details.");
      return;
    }

    submittingBooking = true;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Processing...";
    }

    try {
    
const response = await fetch(BOOKING_API, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify({
        eventId: eventId,
        date: date,
        time: time,
        name: name,
        email: email,
        phone: phone,
        guests: guests
    })
});

const data = await readJSON(response);

if (!response.ok || !data.success) {
    throw new Error(
        data.message || "Hindi na-save ang booking."
    );
}

toast("Booking confirmed!");

form.reset();
guestsInput.value = "1";

await loadEvents();

setTimeout(() => {
    window.location.href = "my-booking.html";
}, 700);
    } catch (error) {
      console.error("Booking error:", error);
      toast(error.message || "May problema sa pag-save ng booking.");
      await loadEvents();
    } finally {
      submittingBooking = false;

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Confirm Reservation";
      }
    }
  });
}

/* =========================================
   LOGOUT
========================================= */
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("socialcraft.loggedIn");
    localStorage.removeItem("socialcraft.username");
    localStorage.removeItem("socialcraft.role");

    window.location.href = "login.html";
  });
}

/* =========================================
   MOBILE MENU
========================================= */
function setupMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

/* =========================================
   INITIALIZE
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  setupBookingForm();
  setupLogout();
  setupMenu();
  loadEvents();
});