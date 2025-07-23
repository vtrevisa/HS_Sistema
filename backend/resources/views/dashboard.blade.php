<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
</head>
<body>
    <h2>Welcome, {{ Auth::user()->name }}</h2>
    <ul>
        <li><strong>Email:</strong> {{ Auth::user()->email }}</li>
        <li><strong>Access Level:</strong> {{ Auth::user()->access }}</li>
        <li><strong>Password (hashed):</strong> {{ Auth::user()->password }}</li>
        <li><strong>Created at:</strong> {{ Auth::user()->created_at }}</li>
        <li><strong>Updated at:</strong> {{ Auth::user()->updated_at }}</li>
    </ul>
    <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button type="submit">Logout</button>
    </form>
</body>
</html>
