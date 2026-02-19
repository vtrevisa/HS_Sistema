// hooks/useCalendar.ts
import { useState, useEffect } from 'react';
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
                fetchEvents();
            }
        } catch (error) {
            console.error('Erro ao verificar status do calendário', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async (params?: any) => {
        try {
            const res = await api.get('/calendar/events', { params });
            setEvents(res.data);
        } catch (error) {
            console.error('Erro ao buscar eventos', error);
        }
    };

    const createEvent = async (eventData: any) => {
        const res = await api.post('/calendar/events', eventData);
        await fetchEvents();
        return res.data;
    };

    const updateEvent = async (eventId: string, eventData: any) => {
        const res = await api.put(`/calendar/events/${eventId}`, eventData);
        await fetchEvents();
        return res.data;
    };

    const deleteEvent = async (eventId: string) => {
        await api.delete(`/calendar/events/${eventId}`);
        await fetchEvents();
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
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        disconnect,
    };
};