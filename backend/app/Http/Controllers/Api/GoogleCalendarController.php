<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GoogleCalendarService;
use App\Traits\AuthenticatesWithToken;
use Illuminate\Http\Request;

class GoogleCalendarController extends Controller
{
    use AuthenticatesWithToken;
    protected $calendarService;

    public function __construct(GoogleCalendarService $calendarService)
    {
        $this->calendarService = $calendarService;
    }

    public function listCalendars(Request $request)
    {
        try {
            $user = $request->user() ?? $this->getAuthenticatedUser($request);
            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $calendars = $this->calendarService->listCalendars($user->id);
            return response()->json($calendars);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function listEvents(Request $request)
    {
        try {
            $user = $request->user() ?? $this->getAuthenticatedUser($request);
            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $calendarId = $request->get('calendarId', 'primary');
            $optParams = $request->only(['maxResults', 'timeMin', 'timeMax', 'orderBy']);
            $events = $this->calendarService->listEvents($user->id, $calendarId, $optParams);
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createEvent(Request $request)
    {
        $validated = $request->validate([
            'summary' => 'required|string',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'allDay' => 'boolean',
            'start_date' => 'required_if:allDay,true|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'start_datetime' => 'required_if:allDay,false|date_format:Y-m-d\TH:i:s',
            'end_datetime' => 'required_if:allDay,false|date_format:Y-m-d\TH:i:s|after:start_datetime',
            'timezone' => 'nullable|string',
            'attendees' => 'nullable|array',
            'attendees.*' => 'email',
            'calendarId' => 'nullable|string',
        ]);

        try {
            $user = $request->user() ?? $this->getAuthenticatedUser($request);
            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $event = $this->calendarService->createEvent(
                $user->id,
                $validated,
                $request->get('calendarId', 'primary')
            );
            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateEvent(Request $request, string $eventId)
    {
        $validated = $request->validate([
            'summary' => 'nullable|string',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'allDay' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'start_datetime' => 'nullable|date_format:Y-m-d\TH:i:s',
            'end_datetime' => 'nullable|date_format:Y-m-d\TH:i:s',
            'timezone' => 'nullable|string',
            'calendarId' => 'nullable|string',
        ]);

        try {
            $user = $request->user() ?? $this->getAuthenticatedUser($request);
            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $event = $this->calendarService->updateEvent(
                $user->id,
                $eventId,
                $validated,
                $request->get('calendarId', 'primary')
            );
            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteEvent(Request $request, string $eventId)
    {
        try {
            $user = $request->user() ?? $this->getAuthenticatedUser($request);
            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $this->calendarService->deleteEvent(
                $user->id,
                $eventId,
                $request->get('calendarId', 'primary')
            );
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Trigger an async sync that saves Google Calendar events into Tasks.
     */
    public function sync(Request $request)
    {
        try {
            $user = $request->user() ?? $this->getAuthenticatedUser($request);
            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            \App\Jobs\SyncGoogleCalendarJob::dispatch($user->id);

            return response()->json(['accepted' => true], 202);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}