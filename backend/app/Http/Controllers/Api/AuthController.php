<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Auth

    public function login(Request $request): JsonResponse
    {
        $login = $request->input('login');
        $password = $request->input('password');

        // Detects whether user entered email or username
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'name';

        $credentials = [$field => $login, 'password' => $password];

        if (Auth::attempt($credentials)) {

            // Get data from user
            $user = Auth::user();

            // Generate token
            $token = $request->user()->createToken('auth-token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => "Usuário logado com sucesso",
                'token' => $token,
                'user' => $user,
            ], 201);
        } else {
            return response()->json([
                'status' => false,
                'message' => "Credenciais inválidas",
            ], 404);
        }
    }

    // Logout

    public function logout(User $user): JsonResponse
    {
        try {

            $user->tokens()->delete();

            return response()->json([
                'status' => true,
                'message' => 'Usuário deslogado com sucesso.',
            ], 200);
        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Usuário não deslogado.',
            ], 400);
        }
    }
}
