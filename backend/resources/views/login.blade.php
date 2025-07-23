<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <script>
        window.onload = function() {
            var savedLogin = localStorage.getItem('saved_login');
            if (savedLogin) {
                document.getElementById('login').value = savedLogin;
                document.getElementById('salvar_dados').checked = true;
            }
            document.getElementById('login_form').onsubmit = function() {
                if (document.getElementById('salvar_dados').checked) {
                    localStorage.setItem('saved_login', document.getElementById('login').value);
                }
                // Do not remove saved_login on form submit, only if checkbox is unchecked
            };
            document.getElementById('salvar_dados').onchange = function() {
                if (!this.checked) {
                    localStorage.removeItem('saved_login');
                }
            };
        };
    </script>
</head>
<body>
    <h2>Login</h2>
    @if(session('error'))
        <div style="color:red;">{{ session('error') }}</div>
    @endif
    <form id="login_form" method="POST" action="{{ route('login') }}">
        @csrf
        <label>Email or Login:</label>
        <input type="text" name="login" id="login" required><br>
        <label>Password:</label>
        <input type="password" name="password" required><br>
        <input type="checkbox" name="salvar_dados" id="salvar_dados">
        <label for="salvar_dados">Salvar meus dados</label><br>
        <button type="submit">Login</button>
    </form>
    <button type="button" onclick="alert('Esqueci minha senha: funcionalidade futura')">Esqueci minha senha</button>
</body>
</html>
