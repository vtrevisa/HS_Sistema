<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        $login = $request->input('login');
        $password = $request->input('password');
        // Try login as email
        $credentials = ['email' => $login, 'password' => $password];
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }
        // Try login as name (username)
        $user = User::where('name', $login)->first();
        if ($user && Hash::check($password, $user->getAuthPassword())) {
            Auth::login($user);
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }
        return back()->with('error', 'Invalid credentials');
    }

    public function dashboard()
    {
        if (!Auth::check()) {
            return redirect('/login');
        }
        return view('dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}
