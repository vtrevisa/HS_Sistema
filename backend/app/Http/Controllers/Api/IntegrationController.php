<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\IntegrationToken;
use App\Services\GmailSender;
use App\Services\MicrosoftSender;
use App\Traits\AuthenticatesWithToken;
use Laravel\Sanctum\PersonalAccessToken;

class IntegrationController extends Controller
{
    use AuthenticatesWithToken;

    protected $providers = [
        'gmail' => [
            'token_url' => 'https://oauth2.googleapis.com/token',
            'client_id_env' => 'GOOGLE_CLIENT_ID',
            'client_secret_env' => 'GOOGLE_CLIENT_SECRET',
            'redirect_env' => 'GOOGLE_GMAIL_REDIRECT_URI',
            // include openid/email scopes so we can obtain the provider email address
            'scope' => 'openid email profile https://www.googleapis.com/auth/gmail.send',
        ],
        'calendar' => [
            'token_url' => 'https://oauth2.googleapis.com/token',
            'client_id_env' => 'GOOGLE_CLIENT_ID',
            'client_secret_env' => 'GOOGLE_CLIENT_SECRET',
            'redirect_env' => 'GOOGLE_CALENDAR_REDIRECT_URI',
            // calendar scopes
            'scope' => 'openid email profile https://www.googleapis.com/auth/calendar',
        ],
        'microsoft' => [
            'token_url' => 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            'client_id_env' => 'MICROSOFT_CLIENT_ID',
            'client_secret_env' => 'MICROSOFT_CLIENT_SECRET',
            'redirect_env' => 'MICROSOFT_REDIRECT_URI',
            // request openid/email/profile and offline access to retrieve provider email and refresh tokens
            'scope' => 'openid email profile offline_access https://graph.microsoft.com/Mail.Send User.Read',
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

        // read cookie the server previously set and expire it in the response
        $cookieState = $request->cookie($cookieName);
        
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

        // ESTE TESTE PODERIA ESTAR NO INICIO ANTES DE GERAR COOKIE
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

        $providerEmail = null;

        // 1) direct field returned by provider
        if (!empty($data['email'])) {
            $providerEmail = $data['email'];
        }

        // 2) try extract from id_token JWT payload if present
        if (!$providerEmail && !empty($data['id_token'])) {
            try {
                $payload = explode('.', $data['id_token'])[1] ?? null;
                if ($payload) {
                    $pad = strlen($payload) % 4;
                    if ($pad) $payload .= str_repeat('=', 4 - $pad);
                    $decoded = json_decode(base64_decode(strtr($payload, '-_', '+/')));
                    $providerEmail = $decoded->email ?? $decoded->upn ?? $providerEmail;
                }
            } catch (\Exception $e) {
                // ignore
            }
        }

        // 3) provider-specific userinfo calls (prefer OpenID Connect endpoints)
        if (!$providerEmail && $accessToken) {
            try {
                if ($provider === 'gmail' || $provider === 'calendar') {
                    $info = Http::withToken($accessToken)
                        ->get('https://openidconnect.googleapis.com/v1/userinfo');
                    if ($info->successful()) {
                        $json = $info->json();
                        $providerEmail = $json['email'] ?? $providerEmail;
                    }
                } elseif ($provider === 'microsoft') {
                    $graphResponse = Http::withToken($accessToken)
                        ->get('https://graph.microsoft.com/v1.0/me');
                    if ($graphResponse->successful()) {
                        $json = $graphResponse->json();
                        $providerEmail = $json['mail'] ?? $json['userPrincipalName'] ?? $providerEmail;
                    }
                }
            } catch (\Exception $e) {
                // ignore failures to fetch provider email
            }
        }

        // Save tokens in dedicated integration_tokens table (one record per user/type)
        $tokenData = [
            'type' => $provider === 'calendar' ? 'calendar' : 'email',
            'provider' => $provider === 'calendar' ? 'gmail' : $provider,
            'email' => $providerEmail ?? $user->email,
            'access_token' => $accessToken ? Crypt::encryptString($accessToken) : null,
            'refresh_token' => $refreshToken ? Crypt::encryptString($refreshToken) : null,
            'expires_at' => $expiresIn ? now()->addSeconds($expiresIn) : null,
        ];

        IntegrationToken::updateOrCreate(
            ['user_id' => $user->id, 'type' => $tokenData['type']],
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

        // Escopos necessários para Calendar
        $scope = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid',
            'https://www.googleapis.com/auth/calendar',
        ];

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
        } else if ($provider === 'calendar') {
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
            Log::info('redirect_uri for Google Calendar OAuth', ['redirect_uri' => env('GOOGLE_CALENDAR_REDIRECT_URI')]);
        } else if ($provider === 'microsoft') {
            $authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
            $params = http_build_query([
                'client_id' => env($cfg['client_id_env']),
                'redirect_uri' => env($cfg['redirect_env']),
                'response_type' => 'code',
                'scope' => $cfg['scope'],
                'state' => $state,
                'response_mode' => 'query',
            ]);
            Log::info('redirect_uri for Microsoft OAuth', ['redirect_uri' => env($cfg['redirect_env'])]);
        } else {
            return response()->json(['status' => false, 'message' => 'Unsupported provider'], 400);
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

        $gmailToken = IntegrationToken::where('user_id', $user->id)->where('type', 'email')->where('provider', 'gmail')->first();
        $msToken = IntegrationToken::where('user_id', $user->id)->where('type', 'email')->where('provider', 'microsoft')->first();

        return response()->json([
            'gmail' => [
                'connected' => (bool) $gmailToken,
                'email' => $gmailToken->email ?? null,
            ],
            'microsoft' => [
                'connected' => (bool) $msToken,
                'email' => $msToken->email ?? null,
            ],
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

        // Allow 'microsoft' alias map to 'microsoft'
        $prov = $provider === 'microsoft' ? 'microsoft' : $provider;
        if (!in_array($prov, ['gmail', 'microsoft'])) {
            return response()->json(['status' => false, 'message' => 'Unsupported provider'], 400);
        }

        $deleted = IntegrationToken::where('user_id', $user->id)->where('provider', $prov)->delete();

        return response()->json(['status' => true, 'deleted' => (bool) $deleted]);
    }

    /**
     * Return calendar provider connection status for the authenticated user.
     */
    public function calendarStatus(Request $request)
    {
        $user = $request->user() ?? $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $calToken = IntegrationToken::where('user_id', $user->id)->where('type', 'calendar')->where('provider', 'gmail')->first();

        return response()->json([
            'calendar' => [
                'connected' => (bool) $calToken,
                'email' => $calToken->email ?? null,
            ],
        ]);
    }

    /**
     * Disconnect (delete) saved calendar tokens for the given provider for the authenticated user.
     */
    public function disconnectCalendar(Request $request, $provider)
    {
        $user = $request->user() ?? $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $prov = $provider === 'microsoft' ? 'microsoft' : $provider;
        if (!in_array($prov, ['gmail', 'microsoft'])) {
            return response()->json(['status' => false, 'message' => 'Unsupported provider'], 400);
        }

        $deleted = IntegrationToken::where('user_id', $user->id)->where('type', 'calendar')->where('provider', $prov)->delete();

        return response()->json(['status' => true, 'deleted' => (bool) $deleted]);
    }

    public function send(Request $request, GmailSender $gmail, MicrosoftSender $microsoft)
    {
        Log::info(['request' => $request->all()]);
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer',
            'provider' => 'required|in:gmail,microsoft',
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