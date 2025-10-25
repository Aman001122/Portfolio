<?php
// ------------------ CONFIG ------------------
$recipient_email = "amandeepjakhar41@gmail.com"; // Your email address
$sender_email = "no-reply@yourdomain.com"; // Your server email (must exist on your hosting)
$subject_prefix = "Portfolio Contact Form";

// ------------------ HELPER FUNCTION ------------------
function clean_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

// ------------------ RESPONSE ------------------
$response = ["success" => false, "message" => ""];

// ------------------ CHECK REQUEST ------------------
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = isset($_POST['name']) ? clean_input($_POST['name']) : "";
    $email = isset($_POST['email']) ? clean_input($_POST['email']) : "";
    $message = isset($_POST['message']) ? clean_input($_POST['message']) : "";

    if (empty($name) || empty($email) || empty($message)) {
        $response["message"] = "All fields are required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response["message"] = "Invalid email address.";
    } else {
        $subject = "$subject_prefix from $name";
        $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";

        // Always send from your server email
        $headers = "From: Portfolio <$sender_email>\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        if (mail($recipient_email, $subject, $body, $headers)) {
            $response["success"] = true;
            $response["message"] = "Thank you! Your message has been sent.";
        } else {
            $response["message"] = "Oops! Something went wrong. Please try again later.";
        }
    }
} else {
    $response["message"] = "Invalid request method.";
}

// Return JSON
header("Content-Type: application/json");
echo json_encode($response);
exit();
?>
