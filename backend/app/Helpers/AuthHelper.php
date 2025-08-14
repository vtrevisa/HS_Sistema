<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AuthHelper
{
  /**
   * Retorna o PersonalAccessToken a partir do request (Bearer token ou cookie)
   */
  public static function getAccessTokenFromRequest(Request $request): ?PersonalAccessToken
  {
    $token = $request->bearerToken() ?? $request->cookie('auth-token');

    if (!$token) {
      return null;
    }

    $token = urldecode($token);

    $parts = explode('|', $token);

    if (count($parts) === 2) {
      $plainToken = $parts[1];
    } else {
      $plainToken = $token;
    }


    return PersonalAccessToken::findToken($plainToken);
  }
}
