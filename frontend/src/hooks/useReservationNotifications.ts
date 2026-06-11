import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface BookingNotif {
  id: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  status?: string;
  receivedAt: number; // timestamp
  read: boolean;
}

export function useReservationNotifications() {
  const [notifications, setNotifications] = useState<BookingNotif[]>([]);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
    const es = new EventSource(`${API}/sse`, { withCredentials: true });

    es.onmessage = (e) => {
      try {
        const booking = JSON.parse(e.data);
        const notif: BookingNotif = {
          ...booking,
          id: booking.id ?? crypto.randomUUID(),
          receivedAt: Date.now(),
          read: false,
        };
        setNotifications((prev) => [notif, ...prev]);
        toast.success(`Nouvelle réservation — ${notif.guestName ?? 'Client'}`);
      } catch {}
    };

    return () => es.close();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return { notifications, unreadCount, markAllRead };
}