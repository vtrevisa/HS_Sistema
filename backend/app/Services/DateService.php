<?php

namespace App\Services;

use Carbon\Carbon;

class DateService
{
  /**
   * Converte uma data do formato dd/mm/yyyy para yyyy-mm-dd
   */
  public static function convertToDatabaseFormat(?string $date): ?string
  {
    if (!$date) return null;

    try {
      return Carbon::createFromFormat('d/m/Y', $date)->format('Y-m-d');
    } catch (\Exception $e) {
      return null; // retorna null se a data for inválida
    }
  }
}
