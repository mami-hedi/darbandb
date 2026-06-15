import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api') as string;

export interface BookingNotif {
  id: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  status?: string;
  receivedAt: number; // timestamp ms
  read: boolean;
}

// Convertit une notif DB (id numérique, createdAt string) → BookingNotif
function fromDb(n: any): BookingNotif {
  return {
    id:         String(n.id),
    guestName:  n.guestName  ?? n.guest_name  ?? undefined,
    checkIn:    n.checkIn    ?? n.check_in    ?? undefined,
    checkOut:   n.checkOut   ?? n.check_out   ?? undefined,
    guests:     n.guests     ?? undefined,
    status:     n.status     ?? undefined,
    receivedAt: n.createdAt  ? new Date(n.createdAt).getTime() : Date.now(),
    read:       Boolean(n.read),
  };
}

export function useReservationNotifications() {
  const [notifications, setNotifications] = useState<BookingNotif[]>([]);
  const esRef = useRef<EventSource | null>(null);

  // ── Chargement initial depuis la BD ──────────────────────────
  useEffect(() => {
    fetch(`${API}/notifications`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.data.map(fromDb));
        }
      })
      .catch(() => {/* silencieux */});
  }, []);

  // ── SSE : nouvelles réservations en temps réel ───────────────
  useEffect(() => {
    const connect = () => {
      esRef.current?.close();

      const es = new EventSource(`${API}/sse`, { withCredentials: true });
      esRef.current = es;

      es.onopen = () => console.log('[SSE] Connecté');

      es.onmessage = (e) => {
        try {
          const booking = JSON.parse(e.data);
          if (booking.type === 'ping') return;

          const notif: BookingNotif = {
            id:         booking.id ? String(booking.id) : crypto.randomUUID(),
            guestName:  booking.guestName,
            checkIn:    booking.checkIn,
            checkOut:   booking.checkOut,
            guests:     booking.guests,
            status:     booking.status,
            receivedAt: Date.now(),
            read:       false,
          };

          // Ajouter en tête de liste (éviter les doublons par id)
          setNotifications(prev => {
            const exists = prev.some(n => n.id === notif.id);
            if (exists) return prev;
            return [notif, ...prev.slice(0, 49)];
          });

          toast.success('Nouvelle réservation', {
            description: notif.guestName
              ? `${notif.guestName} — En attente de confirmation`
              : "Une nouvelle réservation vient d'arriver",
            duration: 6000,
          });
        } catch {/* message malformé */}
      };

      es.onerror = () => {
        console.warn('[SSE] Déconnecté, reconnexion dans 5s...');
        es.close();
        setTimeout(connect, 5000);
      };
    };

    connect();
    return () => esRef.current?.close();
  }, []);

  // ── Computed ─────────────────────────────────────────────────
  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Actions ──────────────────────────────────────────────────

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch {
      // silencieux — l'UI est déjà à jour
    }
  }, []);

  const markOneRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch {/* silencieux */}
  }, []);

  const deleteOne = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {/* silencieux */}
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      await fetch(`${API}/notifications`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {/* silencieux */}
  }, []);

  return {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
    deleteOne,
    clearAll,
  };
}