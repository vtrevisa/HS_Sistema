<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\User;
use App\Models\EmailTemplate;
use App\Services\GmailSender;
use App\Services\MicrosoftSender;
use App\Services\SmtpSender;
use App\Traits\AuthenticatesWithToken;
use Illuminate\Support\Facades\Validator;

class EmailController extends Controller
{
    use AuthenticatesWithToken;

    //Fn to get the templates and the active template for user
    public function getTemplates(Request $request, User $user): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);
        $templates = EmailTemplate::where('user_id', $user->id)
            ->orderBy('position')
            ->get(['id', 'subject', 'body', 'position', 'active', 'user_id']);

        $activeTemplate = $templates->firstWhere('active', true);

        return response()->json([
            'status' => true,
            'templates' => $templates,
            'active_template' => $activeTemplate ?? null,
        ], 200);
    }
    // Create or update an email template for a user
    public function setEmailConfig(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'email_subject' => 'string|nullable',
            'email_body' => 'string|nullable',
            'position' => 'required|in:1,2,3,4,5',
            'active' => 'nullable|boolean',
        ]);

        $subject = $request->input('email_subject');
        $body = $request->input('email_body');
        $position = (string) $request->input('position');
        $active = (bool) $request->input('active', false);
        try {
            // Ensure only one template per (user_id, position)
            $template = EmailTemplate::firstOrNew([
                'user_id' => $user->id,
                'position' => $position,
            ]);

            $template->subject = $subject;
            $template->body = $body;
            $template->user_id = $user->id;
            $template->position = $position;

            if ($active) {
                // Deactivate other templates for this user
                EmailTemplate::where('user_id', $user->id)
                    ->where('position', '!=', $position)
                    ->update(['active' => false]);
                $template->active = true;
            } else {
                $template->active = false;
            }

            $template->save();

            return response()->json([
                'status' => true,
                'template' => $template,
                'message' => 'Template salvo com sucesso',
            ], 200);
        } catch (Exception $e) {
            Log::error('setEmailConfig error', ['user_id' => $user->id, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'Template não salvo!',
            ], 500);
        }
    }

    public function send(Request $request, GmailSender $gmail, MicrosoftSender $microsoft, SmtpSender $smtp)
    {
        Log::info('send-email request received', ['request' => $request->all()]);
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer',
            'provider' => 'required|in:gmail,microsoft,smtp',
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if ($request->provider === 'gmail') {
                $gmail->send(
                    $request->user_id,
                    $request->to,
                    $request->subject,
                    $request->body
                );
            } else if ($request->provider === 'microsoft') {
                $microsoft->send(
                    $request->user_id,
                    $request->to,
                    $request->subject,
                    $request->body
                );
            } else if ($request->provider === 'smtp') {
                $smtp->send(
                    $request->user_id,
                    $request->to,
                    $request->subject,
                    $request->body
                );
            } else {
                throw new \Exception('Unsupported provider');
            }

            return response()->json([
                'success' => true,
                'message' => 'E-mail enviado com sucesso!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
