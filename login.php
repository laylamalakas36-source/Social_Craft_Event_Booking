
<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

if ($username === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please enter your username and password."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "SELECT id, username, password, role
         FROM users
         WHERE username = :username
         LIMIT 1"
    );

    $stmt->execute(["username" => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user["password"])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password."
        ]);
        exit;
    }

    if (!in_array($user["role"], ["admin", "user"], true)) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "This account does not have a valid role."
        ]);
        exit;
    }

    session_regenerate_id(true);

    $_SESSION["user_id"] = (int) $user["id"];
    $_SESSION["username"] = $user["username"];
    $_SESSION["role"] = $user["role"];
    $_SESSION["is_admin"] = ($user["role"] === "admin");

    echo json_encode([
        "success" => true,
        "username" => $user["username"],
        "role" => $user["role"],
        "redirect" => $user["role"] === "admin"
            ? "admin.html"
            : "index.html"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "A server error occurred. Please try again."
    ]);
}