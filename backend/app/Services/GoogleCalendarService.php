<?php
namespace App\Services;

use App\Models\IntegrationToken;
use Google\Client as GoogleClient;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventDateTime;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\Task;
use App\Models\GoogleCalendarSync;
use Illuminate\Support\Carbon;
use Google\Service\Calendar\Event as GoogleEvent;

class GoogleCalendarService
{
    /**
     * Retorna o cliente Google autenticado para o usuário.
     *
     * @param int $userId
     * @return GoogleClient
     * @throws Exception
     */
    private function getAuthenticatedClient(int $userId): GoogleClient
    {
        $token = IntegrationToken::where('user_id', $userId)->where('type', 'calendar')->where('provider', 'gmail')->first();
        if (!$token) {
            throw new Exception('Nenhum token de calendário encontrado.');
        }

        try {
            $accessToken = Crypt::decryptString($token->access_token);
            $refreshToken = $token->refresh_token ? Crypt::decryptString($token->refresh_token) : null;
        } catch (\Exception $e) {
            throw new Exception('Erro ao decriptografar tokens.');
        }

        $client = new GoogleClient();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));

        $expiresIn = $token->expires_at ? $token->expires_at->diffInSeconds(now()) : 0;
        $client->setAccessToken([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => $expiresIn,
        ]);

        if ($client->isAccessTokenExpired()) {
            if (!$refreshToken) {
                throw new Exception('Token expirado e sem refresh_token. Reconecte o calendário.');
            }

            Log::info("Token Google Calendar expirado para usuário {$userId}. Renovando...");
            $newToken = $client->fetchAccessTokenWithRefreshToken($refreshToken);

            if (isset($newToken['error'])) {
                throw new Exception('Falha ao renovar token: ' . ($newToken['error_description'] ?? $newToken['error']));
            }

            // Atualiza refresh_token se o provedor retornou um novo
            if (!empty($newToken['refresh_token'])) {
                $token->refresh_token = Crypt::encryptString($newToken['refresh_token']);
            }

            $token->access_token = Crypt::encryptString($newToken['access_token']);
            $token->expires_at = now()->addSeconds($newToken['expires_in'] ?? 0);
            $token->save();

            // Setar access token completo no cliente
            $client->setAccessToken([
                'access_token' => $newToken['access_token'],
                'refresh_token' => $newToken['refresh_token'] ?? $refreshToken,
                'expires_in' => $newToken['expires_in'] ?? 0,
            ]);
            Log::info("Token Google Calendar renovado.");
        }

        return $client;
    }

    /**
     * Lista os calendários do usuário.
     */
    public function listCalendars(int $userId): array
    {
        $client = $this->getAuthenticatedClient($userId);
        $service = new Calendar($client);
        $calendarList = $service->calendarList->listCalendarList();
        $calendars = [];
        foreach ($calendarList->getItems() as $calendar) {
            $calendars[] = [
                'id' => $calendar->getId(),
                'summary' => $calendar->getSummary(),
                'primary' => $calendar->getPrimary(),
            ];
        }
        return $calendars;
    }

    /**
     * Lista eventos de um calendário (padrão: primary).
     */
    public function listEvents(int $userId, string $calendarId = 'primary', array $optParams = []): array
    {
        $client = $this->getAuthenticatedClient($userId);
        $service = new Calendar($client);

        // Parâmetros padrão: próximos 20 eventos
        $defaultParams = [
            'maxResults' => 20,
            'orderBy' => 'startTime',
            'singleEvents' => true,
            'timeMin' => now()->toRfc3339String(),
        ];
        $optParams = array_merge($defaultParams, $optParams);

        $events = $service->events->listEvents($calendarId, $optParams);
        $items = [];
        foreach ($events->getItems() as $event) {
            $items[] = [
                'id' => $event->getId(),
                'summary' => $event->getSummary(),
                'description' => $event->getDescription(),
                'location' => $event->getLocation(),
                'start' => $event->getStart()->getDateTime() ?: $event->getStart()->getDate(),
                'end' => $event->getEnd()->getDateTime() ?: $event->getEnd()->getDate(),
                'allDay' => $event->getStart()->getDate() ? true : false,
            ];
        }
        return $items;
    }

    /**
     * Cria um evento.
     */
    public function createEvent(int $userId, array $data, string $calendarId = 'primary'): Event
    {
        $client = $this->getAuthenticatedClient($userId);
        $service = new Calendar($client);

        $event = new Event([
            'summary' => $data['summary'],
            'location' => $data['location'] ?? '',
            'description' => $data['description'] ?? '',
        ]);

        // Definir data/hora
        $start = new EventDateTime();
        $end = new EventDateTime();

        if (!empty($data['allDay'])) {
            // Evento de dia inteiro: usar date (YYYY-MM-DD)
            $start->setDate($data['start_date']);
            $end->setDate($data['end_date'] ?? $data['start_date']);
        } else {
            // Evento com horário: usar dateTime (RFC3339)
            $start->setDateTime($data['start_datetime']);
            $start->setTimeZone($data['timezone'] ?? 'America/Sao_Paulo');
            $end->setDateTime($data['end_datetime']);
            $end->setTimeZone($data['timezone'] ?? 'America/Sao_Paulo');
        }

        $event->setStart($start);
        $event->setEnd($end);

        // Se houver participantes
        if (!empty($data['attendees'])) {
            $attendees = [];
            foreach ($data['attendees'] as $email) {
                $attendees[] = ['email' => $email];
            }
            $event->setAttendees($attendees);
        }

        return $service->events->insert($calendarId, $event);
    }

    /**
     * Atualiza um evento.
     */
    public function updateEvent(int $userId, string $eventId, array $data, string $calendarId = 'primary'): Event
    {
        $client = $this->getAuthenticatedClient($userId);
        $service = new Calendar($client);

        // Buscar evento existente
        $event = $service->events->get($calendarId, $eventId);

        if (isset($data['summary'])) $event->setSummary($data['summary']);
        if (isset($data['location'])) $event->setLocation($data['location']);
        if (isset($data['description'])) $event->setDescription($data['description']);

        // Atualizar datas se fornecidas
        if (isset($data['start_datetime']) || isset($data['end_datetime'])) {
            $start = new EventDateTime();
            $end = new EventDateTime();

            if (!empty($data['allDay'])) {
                $start->setDate($data['start_date'] ?? $event->getStart()->getDate());
                $end->setDate($data['end_date'] ?? $event->getEnd()->getDate());
            } else {
                $start->setDateTime($data['start_datetime'] ?? $event->getStart()->getDateTime());
                $end->setDateTime($data['end_datetime'] ?? $event->getEnd()->getDateTime());
                $start->setTimeZone($data['timezone'] ?? 'America/Sao_Paulo');
                $end->setTimeZone($data['timezone'] ?? 'America/Sao_Paulo');
            }
            $event->setStart($start);
            $event->setEnd($end);
        }

        return $service->events->update($calendarId, $eventId, $event);
    }

    /**
     * Exclui um evento.
     */
    public function deleteEvent(int $userId, string $eventId, string $calendarId = 'primary'): void
    {
        $client = $this->getAuthenticatedClient($userId);
        $service = new Calendar($client);
        $service->events->delete($calendarId, $eventId);
    }

    /**
     * List events raw (returns Google Event objects and pagination/sync tokens)
     * Returns: ['items' => [...], 'nextPageToken' => string|null, 'nextSyncToken' => string|null]
     */
    public function listEventsRaw(int $userId, string $calendarId = 'primary', array $optParams = []): array
    {
        $client = $this->getAuthenticatedClient($userId);
        $service = new Calendar($client);

        $events = $service->events->listEvents($calendarId, $optParams);

        return [
            'items' => $events->getItems(),
            'nextPageToken' => $events->getNextPageToken(),
            'nextSyncToken' => $events->getNextSyncToken(),
        ];
    }

    /**
     * Sync all calendars for a user using Google syncToken incremental sync.
     * Stores/updates tasks with google_event_id and calendar_id.
     * Returns summary array calendarId => count
     */
    public function syncUserCalendars(int $userId, array $options = []): array
    {
        $summary = [];
        $calendars = $this->listCalendars($userId);

        // If calendarId provided in options, filter to that calendar only
        if (!empty($options['calendarId'])) {
            $calendars = array_filter($calendars, function ($c) use ($options) {
                return $c['id'] === $options['calendarId'];
            });
        }

        foreach ($calendars as $cal) {
            $calendarId = $cal['id'];
            $syncedCount = 0;

            $syncRecord = GoogleCalendarSync::firstOrCreate(
                ['user_id' => $userId, 'calendar_id' => $calendarId],
                ['sync_token' => null, 'last_synced_at' => null]
            );

            $opt = array_merge([
                'singleEvents' => true,
                'orderBy' => 'startTime',
                'timeMin' => now()->toRfc3339String(),
                'maxResults' => 2500,
            ], $options);

            if (!empty($syncRecord->sync_token)) {
                $opt['syncToken'] = $syncRecord->sync_token;
            }

            $pageToken = null;
            $nextSyncToken = null;

            do {
                if ($pageToken) $opt['pageToken'] = $pageToken;

                try {
                    $res = $this->listEventsRaw($userId, $calendarId, $opt);
                } catch (\Google\Service\Exception $e) {
                    // 410 means syncToken is invalid/expired — do full sync without token
                    if ((int) $e->getCode() === 410) {
                        unset($opt['syncToken']);
                        $res = $this->listEventsRaw($userId, $calendarId, $opt);
                    } else {
                        Log::warning('Google listEventsRaw failed', ['user' => $userId, 'calendar' => $calendarId, 'error' => $e->getMessage()]);
                        break;
                    }
                }

                $items = $res['items'] ?? [];
                foreach ($items as $item) {
                    // $item is Google_Event object
                    if (!($item instanceof GoogleEvent)) {
                        continue;
                    }

                    $eventId = $item->getId();
                    if (!$eventId) continue;

                    // extract start
                    $startObj = $item->getStart();
                    $startRaw = null;
                    if ($startObj) {
                        $startRaw = $startObj->getDateTime() ?: $startObj->getDate();
                    }

                    $startDate = null;
                    $startHour = null;
                    if ($startRaw) {
                        try {
                            $c = Carbon::parse($startRaw);
                            $startDate = $c->toDateString();
                            $timeStr = $c->format('H:i:s');
                            // if event had no time (all-day), treat hour as null
                            $startHour = (strpos($startRaw, 'T') === false) ? null : $timeStr;
                        } catch (\Exception $e) {
                            $startDate = null;
                            $startHour = null;
                        }
                    }

                    Task::updateOrCreate(
                        ['user_id' => $userId, 'google_event_id' => $eventId],
                        [
                            'title' => $item->getSummary() ?? 'Sem título',
                            'description' => $item->getDescription() ?? null,
                            'date' => $startDate,
                            'hour' => $startHour,
                            'google_event_id' => $eventId,
                            'calendar_id' => $calendarId,
                        ]
                    );

                    $syncedCount++;
                }

                $pageToken = $res['nextPageToken'] ?? null;
                $nextSyncToken = $res['nextSyncToken'] ?? $nextSyncToken;

            } while ($pageToken);

            // persist nextSyncToken if returned
            if ($nextSyncToken) {
                $syncRecord->sync_token = $nextSyncToken;
                $syncRecord->last_synced_at = now();
                $syncRecord->save();
            }

            $summary[$calendarId] = $syncedCount;
        }

        return $summary;
    }

    /**
     * Desconecta (remove tokens).
     */
    public function disconnect(int $userId): bool
    {
        return IntegrationToken::where('user_id', $userId)->where('type', 'calendar')->where('provider', 'gmail')->delete();
    }
}