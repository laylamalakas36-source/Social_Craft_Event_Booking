/*
|--------------------------------------------------------------------------
| ADMIN PROTECTION
|--------------------------------------------------------------------------
*/

const loggedIn =
  localStorage.getItem(
    "socialcraft.loggedIn"
  ) === "true";


const role =
  localStorage.getItem(
    "socialcraft.role"
  );


if (
  !loggedIn ||
  role !== "admin"
) {

  window.location.href =
    "login.html";

}


/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
*/

const RESERVATION_KEY =
  "socialcraft.reservations";


function getReservations() {

  try {

    return JSON.parse(
      localStorage.getItem(
        RESERVATION_KEY
      ) || "[]"
    );

  } catch (error) {

    return [];

  }

}


function peso(amount) {

  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }
  ).format(amount);

}


function formatDate(date) {

  if (!date) {
    return "";
  }


  return new Date(
    date + "T00:00:00"
  ).toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

}


/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderReservations() {

  const container =
    document.getElementById(
      "adminReservations"
    );


  const empty =
    document.getElementById(
      "noReservations"
    );


  const reservations =
    getReservations();


  container.innerHTML = "";


  if (
    reservations.length === 0
  ) {

    empty.style.display =
      "block";

    return;

  }


  empty.style.display =
    "none";


  reservations
    .slice()
    .reverse()
    .forEach(
      reservation => {


        const card =
          document.createElement(
            "div"
          );


        card.className =
          "admin-reservation-card";


        card.innerHTML = `

          <div class="admin-reservation-header">

            <div>

              <span class="booking-category">
                ${reservation.category}
              </span>

              <h2>
                ${reservation.event}
              </h2>

            </div>

            <strong>
              ${peso(reservation.total)}
            </strong>

          </div>


          <div class="admin-reservation-grid">

            <div>
              <span>Reservation ID</span>
              <strong>
                ${reservation.id}
              </strong>
            </div>

            <div>
              <span>Username</span>
              <strong>
                ${reservation.username}
              </strong>
            </div>

            <div>
              <span>Customer</span>
              <strong>
                ${reservation.name}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                ${reservation.email}
              </strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>
                ${reservation.phone}
              </strong>
            </div>

            <div>
              <span>Date</span>
              <strong>
                ${formatDate(reservation.date)}
              </strong>
            </div>

            <div>
              <span>Time</span>
              <strong>
                ${reservation.time}
              </strong>
            </div>

            <div>
              <span>Guests</span>
              <strong>
                ${reservation.quantity}
              </strong>
            </div>

          </div>

        `;


        container.appendChild(
          card
        );

      }
    );

}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function setupLogout() {

  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );


  if (!logoutBtn) {
    return;
  }


  logoutBtn.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "socialcraft.loggedIn"
      );

      localStorage.removeItem(
        "socialcraft.username"
      );

      localStorage.removeItem(
        "socialcraft.role"
      );


      window.location.href =
        "login.html";

    }
  );

}


document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderReservations();

    setupLogout();

  }
);
