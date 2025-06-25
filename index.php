<!-- filepath: /home/vtrevisa/Documents/prog/PHP/HS_Sistema/index.php -->
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
                <button class="add-client-btn" id="add-client-btn">Add Client</button>
                <button class="refresh-btn" id="refresh-btn">Refresh Data</button>
            </div>
        </div>
        
        <div class="client-grid" id="client-grid">
            <?php include 'get_clients.php'; ?>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal" id="add-client-modal">
        <div class="modal-content">
            <button class="close-btn" id="close-modal-btn">X</button>
            <h2>Add Client</h2>
            <form method="POST" action="add_client.php">
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

    <script>
        // JavaScript to handle modal functionality
        const addClientBtn = document.getElementById('add-client-btn');
        const modal = document.getElementById('add-client-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');

        addClientBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
		// Add refresh button functionality
        document.getElementById('refresh-btn').addEventListener('click', function() {
            fetch('get_clients.php')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('client-grid').innerHTML = data;
                });
        });
    </script>
</body>
</html>