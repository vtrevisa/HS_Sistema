<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // Show all users from db

    public function index(): JsonResponse
    {

        $users = User::orderBy('id', 'DESC')->get();

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
                'cnpj' => $request->cnpj,
                'company' => $request->company,
                'phone'    => $request->phone,
                'address' => $request->address
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
