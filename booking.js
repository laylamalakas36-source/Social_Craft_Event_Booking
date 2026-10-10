/*
|--------------------------------------------------------------------------
| LOGIN PROTECTION
|--------------------------------------------------------------------------
*/

const loggedIn =
    localStorage.getItem("socialcraft.loggedIn") === "true";

const currentUsername =
    localStorage.getItem("socialcraft.username");

const role =
    localStorage.getItem("socialcraft.role");


if (!loggedIn || !currentUsername) {

    window.location.href = "login.html";

}


if (role === "admin") {

    window.location.href = "admin.html";

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

        const saved =
            localStorage.getItem(RESERVATION_KEY);


        if (!saved) {
            return [];
        }


        const reservations =
            JSON.parse(saved);


        return Array.isArray(reservations)
            ? reservations
            : [];


    } catch (error) {

        console.error(
            "Error reading reservations:",
            error
        );

        return [];

    }

}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function peso(amount) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(Number(amount) || 0);

}


function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    const formattedDate =
        new Date(date + "T00:00:00");


    if (isNaN(formattedDate.getTime())) {
        return date;
    }


    return formattedDate.toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


/*
|--------------------------------------------------------------------------
| GET CUSTOMER RESERVATIONS ONLY
|--------------------------------------------------------------------------
*/

function getMyBookings() {

    const reservations =
        getReservations();


    const username =
        String(
            currentUsername || ""
        )
        .trim()
        .toLowerCase();


    return reservations.filter(
        function (reservation) {

            const reservationUsername =
                String(
                    reservation.username || ""
                )
                .trim()
                .toLowerCase();


            return (
                reservationUsername !== "" &&
                reservationUsername === username
            );

        }
    );

}


/*
|--------------------------------------------------------------------------
| RENDER MY BOOKINGS
|--------------------------------------------------------------------------
*/

function renderMyBookings() {

    const list =
        document.getElementById(
            "myBookingsList"
        );


    const noBooking =
        document.getElementById(
            "noBooking"
        );


    if (!list || !noBooking) {
        return;
    }


    /*
    |----------------------------------------------------------------------
    | IMPORTANT:
    | Get ONLY reservations belonging to current customer
    |----------------------------------------------------------------------
    */

    const myBookings =
        getMyBookings();


    list.innerHTML = "";


    /*
    |----------------------------------------------------------------------
    | NO RESERVATION
    |----------------------------------------------------------------------
    */

    if (myBookings.length === 0) {

        noBooking.style.display =
            "block";

        return;

    }


    noBooking.style.display =
        "none";


    /*
    |----------------------------------------------------------------------
    | LATEST RESERVATION FIRST
    |----------------------------------------------------------------------
    */

    myBookings.sort(
        function (a, b) {

            return (
                new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                )
            );

        }
    );


    /*
    |----------------------------------------------------------------------
    | DISPLAY CUSTOMER'S RESERVATIONS
    |----------------------------------------------------------------------
    */

    myBookings.forEach(
        function (reservation) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "booking-card";


            card.innerHTML = `

                <div class="booking-card-top">

                    <div>

                        <span class="booking-category">
                            ${escapeHTML(
                                reservation.category ||
                                "Event"
                            )}
                        </span>

                        <h2>
                            ${escapeHTML(
                                reservation.event ||
                                "Event"
                            )}
                        </h2>

                    </div>


                    <strong class="booking-status">
                        Confirmed
                    </strong>

                </div>


                <div class="booking-details">

                    <div>

                        <span>
                            Reservation ID
                        </span>

                        <strong>
                            ${escapeHTML(
                                reservation.id ||
                                "N/A"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Date
                        </span>

                        <strong>
                            ${formatDate(
                                reservation.date
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Time
                        </span>

                        <strong>
                            ${escapeHTML(
                                reservation.time ||
                                "N/A"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Guests
                        </span>

                        <strong>
                            ${Number(
                                reservation.quantity ||
                                0
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Price per Guest
                        </span>

                        <strong>
                            ${peso(
                                reservation.price
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Total
                        </span>

                        <strong>
                            ${peso(
                                reservation.total
                            )}
                        </strong>

                    </div>

                </div>


                <div class="booking-customer">

                    <strong>
                        Reservation Details
                    </strong>


                    <p>
                        <strong>Name:</strong>
                        ${escapeHTML(
                            reservation.name ||
                            "N/A"
                        )}
                    </p>


                    <p>
                        <strong>Email:</strong>
                        ${escapeHTML(
                            reservation.email ||
                            "N/A"
                        )}
                    </p>


                    <p>
                        <strong>Phone:</strong>
                        ${escapeHTML(
                            reservation.phone ||
                            "N/A"
                        )}
                    </p>

                </div>

            `;


            list.appendChild(
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
        function () {

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


/*
|--------------------------------------------------------------------------
| INITIALIZE
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderMyBookings();

        setupLogout();

    }
);