<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class UserController extends Controller
{
    // Show all users from db

    public function index(): JsonResponse
    {


        $users = User::with('plan')
            ->withSum('alvaraLogs as alvarasUsed', 'quantity')
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json([
            'status' => true,
            'users' => $users,
        ], 200);
    }

    // Show user from db

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'status' => true,
            'user' => $user,
        ], 200);
    }

    // Add user to db

    public function store(UserRequest $request): JsonResponse
    {

        // Init transaction on DB
        DB::beginTransaction();

        try {

            // Add user on DB

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'role'     => $request->role ?? 'user',
                'status'   => $request->status ?? 'inactive',
            ]);

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'user' => $user,
                'message' => "Usuário cadastrado com sucesso!",
            ], 201);
        } catch (Exception $e) {

            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Usuário não cadastrado!",
            ], 400);
        }
    }

    // Edit user from db

    public function update(UserRequest $request, User $user): JsonResponse
    {
        // Init transaction on DB
        DB::beginTransaction();

        try {

            // Edit user on DB

            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'cnpj' => $request->cnpj,
                'company' => $request->company,
                'phone'    => $request->phone,
                'address' => $request->address,
                'role'  => $request->role ?? $user->role,
                'status'  => $request->status ?? $user->status,
            ]);

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'user' => $user,
                'message' => "Usuário editado com sucesso!",
            ], 200);
        } catch (Exception $e) {
            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Usuário não editado!",
            ], 400);
        }
    } 

    // Set email subject and body for user
    public function setEmailConfig(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'email_subject' => 'required|string',
            'email_body' => 'required|string',
        ]);
        Log::info ("-->setEmailConfig: User ID {$user->id} - Subject: {$request->email_subject} - Body: {$request->email_body}");
        try {
            $user->update([
                'email_subject' => $request->email_subject,
                'email_body' => $request->email_body,
            ]);

            return response()->json([
                'status' => true,
                'user' => $user,
                'message' => "Configurações de e-mail atualizadas com sucesso!",
            ], 200);
        } catch (Exception $e) {
            Log::error('setEmailConfig error', ['user_id' => $user->id, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Configurações de e-mail não atualizadas!',
            ], 500);
        }
    }

    // Upload user avatar

    public function uploadAvatar(Request $request)
    {
        $token = $request->cookie('auth-token');
        $accessToken = PersonalAccessToken::findToken($token);
        $user = $accessToken?->tokenable;

        if (!$token || !$accessToken || !$user) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não autenticado ou token inválido.'
            ], 401);
        }

        $request->validate(['avatar' => 'required|image|max:5120']);
        
        if (!$request->hasFile('avatar')) {
            Log::error('uploadAvatar: Nenhum arquivo enviado.');
            return response()->json(['status' => false, 'message' => 'Nenhum arquivo enviado.'], 400);
        }

        $path = $request->file('avatar')->store("avatars/{$user->id}", 'public');
        
        $url = Storage::disk('public')->url($path);

        $user->avatar_url = $url;
        $user->save();
        
        return response()->json([
            'status' => true,
            'message' => 'Avatar enviado com sucesso.',
            'avatar_url' => $url,
            'path' => $path,
        ], 200);
}


    // Delete user from db

    public function destroy(User $user): JsonResponse
    {
        try {

            // Delete user on DB
            $user->delete();

            return response()->json([
                'status' => true,
                'user' => $user,
                'message' => "Usuário deletado com sucesso!",
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => "Usuário não apagado!",
            ], 400);
        }
    }
}
