import { useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { BookingNotif } from "@/hooks/useReservationNotifications";

interface Props {
  notifications: BookingNotif[];
  unreadCount: number;
  markAllRead: () => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}
// Ajouter cette fonction en haut du fichier
function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

export function NotificationPanel({ notifications, unreadCount, markAllRead, open, onToggle, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  

  // Fermer en cliquant dehors
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div ref={panelRef} className="relative">
      {/* Bouton cloche */}
      <button
        onClick={onToggle}
        className="relative p-2 hover:bg-background/10 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-foreground" />
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl z-[300] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline underline-offset-2 transition-colors"
                >
                  Tout marquer lu
                </button>
              )}
              <button onClick={onClose} className="p-0.5 hover:text-stone-700 dark:hover:text-stone-200">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-stone-400 py-8">Aucune notification</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-default transition-colors",
                    !n.read
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/40"
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                      !n.read ? "bg-amber-500" : "bg-transparent"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                      {n.guestName ?? "Client"}
                    </p>
                    {(n.checkIn || n.checkOut) && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
  {n.checkIn ? formatDate(n.checkIn) : ''} → {n.checkOut ? formatDate(n.checkOut) : ''}
  {n.guests ? ` · ${n.guests} pers.` : ''}
</p>
                    )}
                    {n.status && (
                      <span className="inline-block mt-1 text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        {n.status}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 whitespace-nowrap mt-0.5">
                    {timeAgo(n.receivedAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-stone-100 dark:border-stone-800 text-center">
  
    <a href="/admin/reservations"
  onMouseDown={(e) => e.stopPropagation()}
  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline underline-offset-2 transition-colors"
>
  Voir toutes les réservations →
</a>
</div>
        </div>
      )}
    </div>
  );
}