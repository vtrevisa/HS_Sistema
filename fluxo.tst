Frontend (use-google-calendar.ts::syncEvents()) 
-> Routes (api.php::post /calendar/sync) 
-> Controller (GoogleCalendarController::sync)
-> Job (SyncGoogleCalendarJob::handle())
-> Service (GoogleCalendarService::syncUserCalendars) -> Salva em Task