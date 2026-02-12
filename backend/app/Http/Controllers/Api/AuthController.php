<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Traits\AuthenticatesWithToken;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    use AuthenticatesWithToken;
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

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'status' => false,
                'message' => "Credenciais inválidas",
            ], 401);
        } else {


            // Get user from DB
            $user = $request->user();

            $user->update([
                'last_login_at' => now(),
            ]);

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
        }
    }

    // Logout

    public function logout(Request $request): JsonResponse
    {
        try {

            $user = $this->getAuthenticatedUser($request);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Token inválido ou não fornecido.',
                ], 401);
            }

            // Delete token
            $accessToken = $user->currentAccessToken();
            if ($accessToken) {
                $accessToken->delete();
            }

            // Remove cookie
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
                'message' => 'Erro ao deslogar.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function me(Request $request)
    {

        try {

            $user = $this->getAuthenticatedUser($request);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Token de autenticação é inválido ou não fornecido.',
                ], 401);
            }

            // Load user plan
            $user->load('plan');

            return response()->json([
                'status' => true,
                'user' => [
                    'id' => $user->id,
                    'role' => $user->role,
                    'name' => $user->name,
                    'email' => $user->email,
                    'cnpj' => $user->cnpj,
                    'company' => $user->company,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar_url' => $user->avatar_url ?? null,
                    'last_login_at' => $user->last_login_at,
                    'created_at' => $user->created_at,
                    'plan_active' => $user->isPlanActive(),
                    'plan' => $user->plan ? [
                        'id' => $user->plan->id,
                        'name' => $user->plan->name,
                        'monthly_credits' => $user->plan->monthly_credits,
                        'monthly_used' => $user->monthly_used,
                        'price' => $user->plan->price,
                        'plan_renews_at' => $user->plan_renews_at,
                        'last_renewal_at' => $user->last_renewal_at,
                    ] : null,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Erro ao verificar o usuário.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Token inválido ou não fornecido.',
            ], 401);
        }

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'A senha atual está incorreta.'
            ], 422);
        }

        // Save new password
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Senha alterada com sucesso.'
        ], 200);
    }
}
