// hooks/useCalendar.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api'
import { connectCalendar } from '@/components/Profile/calendarConnector';

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    location?: string;
    start: string;
    end: string;
    allDay: boolean;
}

export const useGoogleCalendar = () => {
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/calendar/status');
            console.log('Status do calendário:', res);
            // backend may return either { connected: boolean } or { calendar: { connected: boolean } }
            const connectedFlag = res.data?.connected ?? res.data?.calendar?.connected ?? false;
            setConnected(connectedFlag);
            if (connectedFlag) {
                syncEvents();
            }
        } catch (error) {
            console.error('Erro ao verificar status do calendário', error);
        } finally {
            setLoading(false);
        }
    };

    const syncEvents = async () => {
        try {
        // trigger backend sync that saves Google events as Tasks
        await api.post('/calendar/sync').catch(e => console.warn('Failed to dispatch calendar sync', e));
        const calRes = await api.get('/calendar/calendars');
        console.log('DEBUG /calendar/calendars response:', calRes);

        const calendars = Array.isArray(calRes.data) ? calRes.data : calRes.data.items ?? [];
        const now = new Date().toISOString();
        const timeMax = new Date(); timeMax.setMonth(timeMax.getMonth() + 6); // ex: próximos 6 meses

        const eventsResByCal = await Promise.all(
        calendars.map(c =>
            api.get('/calendar/events', {
            params: {
                calendarId: c.id,
                singleEvents: true,
                orderBy: 'startTime',
                timeMin: now,
                timeMax: timeMax.toISOString(),
                maxResults: 2500
            }
            })
            .then(r => ({ calendar: c, response: r }))
            .catch(err => ({ calendar: c, error: err }))
        )
        );

        console.log('DEBUG aggregated events per calendar:', eventsResByCal);

        // opcional: juntar todos os eventos em um único array
        const allEvents = eventsResByCal.flatMap(x => (x.response?.data ?? []));
        console.log('DEBUG allEvents combined:', allEvents);
        return { calendars, eventsResByCal, allEvents };
        } catch (e) {
            console.error('Erro ao agregar eventos:', e);
            throw e;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createEvent = async (eventData: any) => {
        const res = await api.post('/calendar/events', eventData);
        await syncEvents();
        return res.data;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateEvent = async (eventId: string, eventData: any) => {
        const res = await api.put(`/calendar/events/${eventId}`, eventData);
        await syncEvents();
        return res.data;
    };

    const deleteEvent = async (eventId: string) => {
        await api.delete(`/calendar/events/${eventId}`);
        await syncEvents();
    };

    const disconnect = async () => {
        await api.delete('/calendar/disconnect');
        setConnected(false);
        setEvents([]);
    };

    return {
        connected,
        events,
        loading,
        connectCalendar,
        syncEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        disconnect,
    };
};