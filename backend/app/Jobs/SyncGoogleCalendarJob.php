<?php

namespace App\Jobs;

use App\Services\GoogleCalendarService;
use Illuminate\Support\Facades\Log;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncGoogleCalendarJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $userId;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    public function handle(GoogleCalendarService $calendarService)
    {
        $options = [
            'timeMin' => now()->toRfc3339String(),
            'timeMax' => now()->addMonths(6)->toRfc3339String(),
            'singleEvents' => true,
            'orderBy' => 'startTime',
            'maxResults' => 2500,
        ];

        try {
            $calendarService->syncUserCalendars($this->userId, $options);
        } catch (\Exception $e) {
            Log::error('SyncGoogleCalendarJob handle failed', ['userId' => $this->userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
