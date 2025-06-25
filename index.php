<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HS Sistema - Client Management</title>
    <!-- Link to external CSS -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <?php
    // Handle form submission
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['name'])) {
        include 'add_client.php';
    }
    
    // Check if we need to show the modal or refresh
    $showModal = isset($_GET['show_modal']) && $_GET['show_modal'] === 'true';
    $refresh = isset($_GET['refresh']) && $_GET['refresh'] === 'true';
    ?>
    
    <div class="menu">
        <img src="logo.png" alt="HS Sistema Logo">
        <h1>HS Sistema</h1>
        <ul>
            <li><a href="#">Clients</a></li>
        </ul>
    </div>
    <div class="content">
        <div class="content-header">
            <h1>Client Management</h1>
            <div>
                <a href="?show_modal=true" class="add-client-btn">Add Client</a>
                <a href="?refresh=true" class="refresh-btn">Refresh Data</a>
            </div>
        </div>
        
        <div class="client-grid" id="client-grid">
            <?php include 'get_clients.php'; ?>
        </div>
    </div>

    <!-- Modal -->
    <?php if ($showModal): ?>
    <div class="modal" id="add-client-modal" style="display: flex;">
        <div class="modal-content">
            <a href="?" class="close-btn">X</a>
            <h2>Add Client</h2>
            <form method="POST" action="">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>

                <label for="phone">Phone:</label>
                <input type="text" id="phone" name="phone" required>

                <label for="notes">Notes:</label>
                <textarea id="notes" name="notes" rows="4"></textarea>

                <button type="submit">Add Client</button>
            </form>
        </div>
    </div>
    <?php endif; ?>
</body>
</html>