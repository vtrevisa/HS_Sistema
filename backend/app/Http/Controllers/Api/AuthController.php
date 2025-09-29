<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    // Auth

    public function login(Request $request): JsonResponse
    {

        // Validation
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $login = $request->input('login');
        $password = $request->input('password');

        // Detects whether user entered email or username
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'name';
        $credentials = [$field => $login, 'password' => $password];

        if (Auth::attempt($credentials)) {

            // Get user from DB
            $user = $request->user();

            // Generate token
            $token = $user->createToken('auth-token')->plainTextToken;

            // Cookie HttpOnly secure

            $cookie = cookie(
                'auth-token',
                $token,
                60 * 24,       // 1 day
                '/',           // path
                'localhost',   //domain
                false,         // secure=false in localhost, true in prod with HTTPS
                true,          // httpOnly
                false,
                'Lax'
            );

            return response()->json([
                'status' => true,
                'message' => "Usuário logado com sucesso",
                'token' => $token,
            ], 200)->withCookie($cookie);
        } else {
            return response()->json([
                'status' => false,
                'message' => "Credenciais inválidas",
            ], 401);
        }
    }

    // Logout

    public function logout(Request $request): JsonResponse
    {
        try {

            $token = $request->cookie('auth-token');

            if (!$token) {
                return response()->json([
                    'status' => false,
                    'message' => 'Token de autenticação não fornecido ou inválido.',
                ], 401);
            }

            // Delete token from user
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $accessToken->delete();
            }

            // Clean cookie
            $cookie = cookie(
                'auth-token',
                '',
                -1,
                '/',
                'localhost',
                false,
                true,
                false,
                'Lax'
            );

            return response()->json([
                'status' => true,
                'message' => 'Usuário deslogado com sucesso.',
            ], 200)->withCookie($cookie);
        } catch (Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Usuário não deslogado.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function me(Request $request)
    {

        try {

            $token = $request->cookie('auth-token');

            if (!$token) {
                return response()->json([
                    'status' => false,
                    'message' => 'Token de autenticação é inválido ou não fornecido.',
                ], 401);
            }

            // Retrieves the user associated with the token
            $accessToken = PersonalAccessToken::findToken($token);

            $user = $accessToken->tokenable;

            return response()->json([
                'status' => true,
                //'token' => $token,
                'user' => $user,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Erro ao verificar o usuário.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
