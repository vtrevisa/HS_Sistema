<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\EmailToken;
use App\Traits\AuthenticatesWithToken;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Log;

class IntegrationController extends Controller
{
    use AuthenticatesWithToken;

    protected $providers = [
        'gmail' => [
            'token_url' => 'https://oauth2.googleapis.com/token',
            'client_id_env' => 'GMAIL_CLIENT_ID',
            'client_secret_env' => 'GMAIL_CLIENT_SECRET',
            'redirect_env' => 'GMAIL_REDIRECT_URI',
            'scope' => 'https://www.googleapis.com/auth/gmail.send',
        ],
        'microsoft' => [
            'token_url' => 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            'client_id_env' => 'MICROSOFT_CLIENT_ID',
            'client_secret_env' => 'MICROSOFT_CLIENT_SECRET',
            'redirect_env' => 'MICROSOFT_REDIRECT_URI',
            'scope' => 'https://graph.microsoft.com/Mail.Send offline_access User.Read',
        ],
    ];

    public function callback(Request $request, $provider)
    {
        $code = $request->query('code');
        $state = $request->query('state');

        // prepare cookie name and expiration for any early redirects
        $cookieName = "oauth_state_{$provider}";
        $forgetCookie = cookie($cookieName, '', -1);

        // If provider redirected back with an error (user denied permission etc.), forward to frontend
        if ($request->has('error')) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=' . urlencode($request->get('error')))
                ->withCookie($forgetCookie);
        }

        if (!$code) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=missing_code')
                ->withCookie($forgetCookie);
        }

        if (!$state) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=missing_state')
                ->withCookie($forgetCookie);
        }

        // Determine user from server-side state map (stateless flow)
        $cookieName = "oauth_state_{$provider}";
        // read cookie the server previously set and expire it in the response
        $cookieState = $request->cookie($cookieName);
        $forgetCookie = cookie($cookieName, '', -1);

        // Validate cookie matches returned state to protect against CSRF
        if (!$cookieState || $cookieState !== $state) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=invalid_state')
                ->withCookie($forgetCookie);
        }

        // Prefer a single source of truth: the cache mapping state -> userId created in start()
        $userId = Cache::pull("oauth_state_map_{$state}");
        if (!$userId) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=state_expired')
                ->withCookie($forgetCookie);
        }

        $user = User::find($userId);
        if (!$user) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=user_not_found')
                ->withCookie($forgetCookie);
        }

        if (!isset($this->providers[$provider])) {
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=unsupported_provider')
                ->withCookie($forgetCookie);
        }

        $cfg = $this->providers[$provider];

        // Exchange code for tokens
        $response = Http::asForm()->post($cfg['token_url'], [
            'code' => $code,
            'client_id' => env($cfg['client_id_env']),
            'client_secret' => env($cfg['client_secret_env']),
            'redirect_uri' => env($cfg['redirect_env']),
            'grant_type' => 'authorization_code',
        ]);

        if (!$response->successful()) {
            // Log detailed provider response for debugging
            try {
                Log::error('OAuth token exchange failed', [
                    'provider' => $provider,
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'request' => [
                        'client_id' => env($cfg['client_id_env']),
                        'redirect_uri' => env($cfg['redirect_env']),
                    ],
                ]);
            } catch (\Exception $e) {
                // ignore logging failures
            }

            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?error=token_exchange_failed')
                ->withCookie($forgetCookie);
        }

        $data = $response->json();

        $accessToken = $data['access_token'] ?? null;
        $refreshToken = $data['refresh_token'] ?? null;
        $expiresIn = $data['expires_in'] ?? null;
        $scope = $data['scope'] ?? null;
        $providerEmail = null;

        // Optional: fetch user email from provider (Gmail: use token to call people/me or get id_token)
        // For Gmail you can decode id_token if present or call https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=...
        if (isset($data['id_token'])) {
            // decode JWT (not verified here) to get email if present (or call userinfo endpoint)
            try {
                $payload = explode('.', $data['id_token'])[1] ?? null;
                if ($payload) {
                    $decoded = json_decode(base64_decode(strtr($payload, '-_', '+/')));
                    $providerEmail = $decoded->email ?? null;
                }
            } catch (\Exception $e) {
                // ignored
            }
        }

        // If provider is Gmail and we still don't have an email, fetch userinfo
        if ($provider === 'gmail' && !$providerEmail && $accessToken) {
            try {
                $info = Http::withToken($accessToken)
                    ->get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json');
                if ($info->successful()) {
                    $json = $info->json();
                    $providerEmail = $json['email'] ?? $providerEmail;
                }
            } catch (\Exception $e) {
                // ignore failures to fetch provider email
            }
        }

        // If provider is Microsoft, fetch user email from Graph API
        if ($provider === 'microsoft' && $accessToken) {
            try {
                $graphResponse = Http::withToken($accessToken)
                    ->get('https://graph.microsoft.com/v1.0/me');
                if ($graphResponse->successful()) {
                    $json = $graphResponse->json();
                    $providerEmail = $json['mail'] ?? $json['userPrincipalName'] ?? $providerEmail;
                }
            } catch (\Exception $e) {
                // ignore failures to fetch provider email
            }
        }

        // Save tokens in dedicated email_tokens table (one record per user)
        $tokenData = [
            'provider' => $provider,
            'email' => $providerEmail ?? $user->email,
            'access_token' => $accessToken ? Crypt::encryptString($accessToken) : null,
            'refresh_token' => $refreshToken ? Crypt::encryptString($refreshToken) : null,
            'expires_at' => $expiresIn ? now()->addSeconds($expiresIn) : null,
        ];

        EmailToken::updateOrCreate(
            ['user_id' => $user->id],
            $tokenData
        );

        // Redirect to frontend success page (or return JSON)
        // Use FRONTEND_URL env so backend and frontend hosts can differ
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/dashboard/minha-conta?provider_connected=' . $provider;
        return redirect($frontendUrl)->withCookie($forgetCookie);
    }

    public function start(Request $request, $provider)
    {
        if (!isset($this->providers[$provider])) {
            return response()->json(['status' => false, 'message' => 'Unsupported provider'], 400);
        }

        $user = $request->user();
        if (!$user) {
            // fallback to cookie-based personal access token used by AuthController
            $user = $this->getAuthenticatedUser($request);
        }

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $cfg = $this->providers[$provider];

        // generate secure state
        try {
            $state = bin2hex(random_bytes(16));
        } catch (\Exception $e) {
            $state = hash('sha256', uniqid((string) time(), true));
        }

        // map state -> user id for stateless callback fallback (10 minutes)
        Cache::put("oauth_state_map_{$state}", $user->id, now()->addMinutes(10));

        // set cookie so callback can validate state (server-set cookie)
        $cookieName = "oauth_state_{$provider}";
        $secure = config('app.env') === 'production';
        $cookie = cookie(
            $cookieName,
            $state,
            10, // minutes
            '/',
            null,
            $secure,
            true, // httpOnly
            false,
            'lax'
        );

        // build provider auth URL
        if ($provider === 'gmail') {
            $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
            $params = http_build_query([
                'client_id' => env($cfg['client_id_env']),
                'redirect_uri' => env($cfg['redirect_env']),
                'response_type' => 'code',
                'scope' => $cfg['scope'],
                'access_type' => 'offline',
                'prompt' => 'consent',
                'state' => $state,
                'include_granted_scopes' => 'true',
            ]);
            Log::info('redirect_uri for Gmail OAuth', ['redirect_uri' => env($cfg['redirect_env'])]);
        } else {
            $authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
            $params = http_build_query([
                'client_id' => env($cfg['client_id_env']),
                'redirect_uri' => env($cfg['redirect_env']),
                'response_type' => 'code',
                'scope' => $cfg['scope'],
                'state' => $state,
                'response_mode' => 'query',
            ]);
        }

        return redirect()->away($authUrl . '?' . $params)->withCookie($cookie);
    }

    /**
     * Return email provider connection status for the authenticated user.
     */
    public function emailStatus(Request $request)
    {
        $user = $request->user() ?? $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $hasGmail = EmailToken::where('user_id', $user->id)->where('provider', 'gmail')->exists();
        $hasMicrosoft = EmailToken::where('user_id', $user->id)->where('provider', 'microsoft')->exists();

        return response()->json([
            'gmail' => ['connected' => (bool) $hasGmail],
            'outlook' => ['connected' => (bool) $hasMicrosoft],
        ]);
    }

    /**
     * Disconnect (delete) saved tokens for the given provider for the authenticated user.
     */
    public function disconnectEmail(Request $request, $provider)
    {
        $user = $request->user() ?? $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        // Allow 'outlook' alias map to 'microsoft'
        $prov = $provider === 'outlook' ? 'microsoft' : $provider;
        if (!in_array($prov, ['gmail', 'microsoft'])) {
            return response()->json(['status' => false, 'message' => 'Unsupported provider'], 400);
        }

        $deleted = EmailToken::where('user_id', $user->id)->where('provider', $prov)->delete();

        return response()->json(['status' => true, 'deleted' => (bool) $deleted]);
    }

}