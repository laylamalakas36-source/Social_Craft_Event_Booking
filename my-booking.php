<?php
header("Content-Type: application/json; charset=utf-8");
session_start();

require_once __DIR__ . "/db.php";

if (
    empty($_SESSION["user_id"]) ||
    ($_SESSION["role"] ?? "") !== "user"
) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Please log in again."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "SELECT
            id,
            event_id,
            booking_date,
            booking_time,
            full_name,
            email,
            phone,
            guests,
            total_amount,
            status,
         FROM reservations
         WHERE user_id = ?
         ORDER BY created_at DESC"
    );

    $stmt->execute([
        (int) $_SESSION["user_id"]
    ]);

    echo json_encode([
        "success" => true,
        "reservations" => $stmt->fetchAll()
    ]);

} catch (Throwable $e) {
    error_log("My bookings error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to load reservations."
    ]);
}
?>
