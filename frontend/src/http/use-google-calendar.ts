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

    const checkStatus = async () => {
        try {
            const res = await api.get('/calendar/status');
            console.log('Status do calendário:', res);
            return res.data.calendar.connected;     
        } catch (error) {
            console.error('Erro ao verificar status do calendário', error);
        }
    };

    const syncEvents = async () => {
        try {
        // trigger backend sync that saves Google events as Tasks
        await api.post('/calendar/sync').catch(e => console.warn('Failed to dispatch calendar sync', e));
        
        } catch (e) {
            console.error('Erro ao agregar eventos:', e);
            throw e;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createEvent = async (eventData: any) => {

        // normalize date (accepts YYYY-MM-DD or DD/MM/YYYY)
        const normalizeDate = (dateInput: string | Date | undefined | null) => {
            if (!dateInput) return '';
            if (dateInput instanceof Date) {
                const yyyy = dateInput.getFullYear();
                const mm = String(dateInput.getMonth() + 1).padStart(2, '0');
                const dd = String(dateInput.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
            const dateStr = String(dateInput);
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/'); // dd/MM/yyyy
                if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return dateStr; // assume already YYYY-MM-DD
        }

        const normalizeTime = (timeInput: string | number | undefined | null) => {
            if (timeInput === undefined || timeInput === null) return '00:00';
            const timeStr = String(timeInput);
            if (timeStr.includes(':')) {
                const [h, m] = timeStr.split(':');
                return `${h.padStart(2,'0')}:${(m || '00').padStart(2,'0')}`;
            }
            return `${timeStr.padStart(2,'0')}:00`;
        }

        const toLocalDateTimeString = (d: Date) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
        }

        const datePart = normalizeDate(eventData.date);
        const timePart = normalizeTime(eventData.hour);

        // build Date from components in local timezone
        const [y, mo, d] = datePart.split('-').map(Number);
        const [hh, mm] = timePart.split(':').map(Number);
        const startDateObj = new Date(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0, 0);

        // default duration: 60 minutes unless provided
        const durationMinutes = Number(eventData.durationMinutes ?? 60);
        const endDateObj = new Date(startDateObj.getTime() + durationMinutes * 60 * 1000);

        const payload = {
            summary: eventData.title,
            description: eventData.description,
            start_datetime: toLocalDateTimeString(startDateObj),
            end_datetime: toLocalDateTimeString(endDateObj),
            allDay: !!eventData.allDay,
        };

        const res = await api.post('/calendar/events', payload);
        await syncEvents();
        return res.data;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateEvent = async (eventId: string, eventData: any) => {

        // normalize date (accepts YYYY-MM-DD or DD/MM/YYYY)
        const normalizeDate = (dateInput: string | Date | undefined | null) => {
            if (!dateInput) return '';
            if (dateInput instanceof Date) {
                const yyyy = dateInput.getFullYear();
                const mm = String(dateInput.getMonth() + 1).padStart(2, '0');
                const dd = String(dateInput.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
            const dateStr = String(dateInput);
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/'); // dd/MM/yyyy
                if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return dateStr; // assume already YYYY-MM-DD
        }

        const normalizeTime = (timeInput: string | number | undefined | null) => {
            if (timeInput === undefined || timeInput === null) return '00:00';
            const timeStr = String(timeInput);
            if (timeStr.includes(':')) {
                const [h, m] = timeStr.split(':');
                return `${h.padStart(2,'0')}:${(m || '00').padStart(2,'0')}`;
            }
            return `${timeStr.padStart(2,'0')}:00`;
        }

        const toLocalDateTimeString = (d: Date) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
        }

        const datePart = normalizeDate(eventData.date);
        const timePart = normalizeTime(eventData.hour);

        // build Date from components in local timezone
        const [y, mo, d] = datePart.split('-').map(Number);
        const [hh, mm] = timePart.split(':').map(Number);
        const startDateObj = new Date(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0, 0);

        // default duration: 60 minutes unless provided
        const durationMinutes = Number(eventData.durationMinutes ?? 60);
        const endDateObj = new Date(startDateObj.getTime() + durationMinutes * 60 * 1000);

        const payload = {
            summary: eventData.title,
            description: eventData.description,
            start_datetime: toLocalDateTimeString(startDateObj),
            end_datetime: toLocalDateTimeString(endDateObj),
            allDay: !!eventData.allDay,
        };
        
        const res = await api.put(`/calendar/events/${eventId}`, payload);
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
        checkStatus,
        connectCalendar,
        syncEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        disconnect,
    };
};