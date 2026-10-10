<?php
header("Content-Type: application/json; charset=utf-8");
session_start();

require_once __DIR__ . "/db.php";

function respond($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(405, [
        "success" => false,
        "message" => "POST request required."
    ]);
}

/* Get logged-in user from PHP session */
$userId = filter_var(
    $_SESSION["user_id"] ?? null,
    FILTER_VALIDATE_INT
);

if (!$userId || ($_SESSION["role"] ?? "") !== "user") {
    respond(401, [
        "success" => false,
        "message" => "Please log in using a student account."
    ]);
}

/* Read JSON sent by script.js */
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond(400, [
        "success" => false,
        "message" => "Invalid booking data."
    ]);
}

/* Accept the field names used by either version of script.js */
$eventId = trim((string)(
    $data["eventId"] ?? $data["event_id"] ?? ""
));

$date = trim((string)(
    $data["date"] ?? $data["booking_date"] ?? ""
));

$time = trim((string)(
    $data["time"] ?? $data["booking_time"] ?? ""
));

$name = trim((string)(
    $data["name"] ?? $data["full_name"] ?? ""
));

$email = trim((string)($data["email"] ?? ""));
$phone = trim((string)($data["phone"] ?? ""));

$guests = filter_var(
    $data["guests"] ?? null,
    FILTER_VALIDATE_INT
);

/* Validate inputs */
$dateObject = DateTime::createFromFormat("!Y-m-d", $date);

if (
    $eventId === "" ||
    !$guests ||
    $guests < 1 ||
    $guests > 20 ||
    $name === "" ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !$dateObject ||
    $dateObject->format("Y-m-d") !== $date ||
    !preg_match('/^\d{2}:\d{2}$/', $time) ||
    $phone === ""
) {
    respond(400, [
        "success" => false,
        "message" => "Please check your name, email, phone, date, time, event, and number of guests."
    ]);
}

try {
    $pdo->beginTransaction();

    /* Lock the selected event while checking capacity */
    $stmt = $pdo->prepare(
        "SELECT id, title, price, capacity
         FROM events
         WHERE id = ?
         FOR UPDATE"
    );

    $stmt->execute([$eventId]);
    $event = $stmt->fetch();

    if (!$event) {
        $pdo->rollBack();

        respond(404, [
            "success" => false,
            "message" => "Selected event was not found."
        ]);
    }

    /* Count guests already booked for this event */
    $stmt = $pdo->prepare(
        "SELECT COALESCE(SUM(guests), 0)
         FROM reservations
         WHERE event_id = ?
           AND status = 'confirmed'"
    );

    $stmt->execute([$eventId]);
    $booked = (int)$stmt->fetchColumn();

    if ($booked + $guests > (int)$event["capacity"]) {
        $pdo->rollBack();

        respond(400, [
            "success" => false,
            "message" => "Not enough seats available for this event. Available seats: " .
                max(0, (int)$event["capacity"] - $booked)
        ]);
    }

    $total = (float)$event["price"] * $guests;

    /* Save reservation */
    $stmt = $pdo->prepare(
        "INSERT INTO reservations
        (user_id, event_id, booking_date, booking_time,
         full_name, email, phone, guests, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')"
    );

    $stmt->execute([
        $userId,
        $eventId,
        $date,
        $time . ":00",
        $name,
        $email,
        $phone,
        $guests,
        $total
    ]);

    $reservationId = $pdo->lastInsertId();

    $pdo->commit();

    respond(200, [
        "success" => true,
        "message" => "Booking confirmed!",
        "reservation_id" => $reservationId,
        "event_id" => $eventId,
        "event" => $event["title"],
        "guests" => $guests,
        "total_amount" => $total
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Booking error: " . $e->getMessage());

    respond(500, [
        "success" => false,
        "message" => "Booking failed. Check the PHP error log and database table columns."
    ]);
}
?>
