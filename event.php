
<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/db.php";

try {
    $sql = "
        SELECT
            e.id,
            e.title,
            e.price,
            e.capacity,
            COALESCE(
                SUM(
                    CASE
                        WHEN r.status = 'confirmed' THEN r.guests
                        ELSE 0
                    END
                ),
                0
            ) AS booked
        FROM events e
        LEFT JOIN reservations r ON r.event_id = e.id
        GROUP BY e.id, e.title, e.price, e.capacity
        ORDER BY e.title
    ";

    $stmt = $pdo->query($sql);
    $events = $stmt->fetchAll();

    foreach ($events as &$event) {
        $event["price"] = (float) $event["price"];
        $event["capacity"] = (int) $event["capacity"];
        $event["booked"] = (int) $event["booked"];
        $event["available"] = max(
            0,
            $event["capacity"] - $event["booked"]
        );
    }
    unset($event);

    echo json_encode([
        "success" => true,
        "events" => $events
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to load events."
    ]);
}
?>