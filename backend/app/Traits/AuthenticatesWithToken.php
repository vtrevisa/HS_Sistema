<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

trait AuthenticatesWithToken
{
  protected function getAuthenticatedUser(Request $request)
  {
    $token = $request->cookie('auth-token');

    if (!$token) {
      return null;
    }

    $accessToken = PersonalAccessToken::findToken($token);

    if (!$accessToken) {
      return null;
    }

    return $accessToken->tokenable;
  }
}
