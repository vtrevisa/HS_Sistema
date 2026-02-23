// hooks/useCalendar.ts
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api'
import { connectCalendar } from '../components/Profile/calendarConnector';

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
    // Reuse in-flight sync promise to avoid duplicate backend dispatches
    const syncPromiseRef = useRef<Promise<any> | null>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/calendar/status');
            // backend may return either { connected: boolean } or { calendar: { connected: boolean } }
            const connectedFlag = res.data?.connected ?? res.data?.calendar?.connected ?? false;
            setConnected(connectedFlag);
        } catch (error) {
            console.error('Erro ao verificar status do calendário', error);
        } finally {
            setLoading(false);
        }
    };

    const syncEvents = async () => {
        // If a sync is already in progress, return the same promise (dedupe)
        if (syncPromiseRef.current) {
            return syncPromiseRef.current;
        }

        const promise = api.post('/calendar/sync')
            .catch(e => {
                console.warn('Failed to dispatch calendar sync', e);
                throw e;
            })
            .finally(() => {
                // clear in-flight marker when done (success or failure)
                syncPromiseRef.current = null;
            });

        syncPromiseRef.current = promise;
        return promise;
    };

    const createEvent = async (eventData: any) => {
        const res = await api.post('/calendar/events', eventData);
        return res.data;
    };

    const updateEvent = async (eventId: string, eventData: any) => {
        const res = await api.put(`/calendar/events/${eventId}`, eventData);
        return res.data;
    };

    const deleteEvent = async (eventId: string) => {
        await api.delete(`/calendar/events/${eventId}`);
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