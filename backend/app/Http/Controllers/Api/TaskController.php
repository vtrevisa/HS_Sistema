<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class TaskController extends Controller
{

    public function index(Request $request)
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

        $tasks = Task::where('user_id', $user->id)
            ->orderBy('date')
            ->orderBy('hour')
            ->get();

        return response()->json([
            'status' => true,
            'tasks' => $tasks,
        ], 200);
    }


    public function store(Request $request)
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

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date'        => ['required', 'date'],
            'hour'        => ['nullable', 'date_format:H:i'],
            'priority'    => ['required', Rule::in(['baixa', 'media', 'alta'])],
            'lead_id'     => ['nullable', 'exists:leads,id'],
        ]);

        $task = Task::create([
            'user_id'     => $user->id,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date'        => $validated['date'],
            'hour'        => $validated['hour'] ?? null,
            'priority'    => $validated['priority'],
            'lead_id'     => $validated['lead_id'] ?? null,
        ]);

        return response()->json($task, 201);
    }


    public function completed(int $id)
    {
        $task = Task::findOrFail($id);

        $task->completed = !$task->completed;
        $task->save();

        return response()->json([
            'status' => true,
            'task' => $task,
        ]);
    }
}
