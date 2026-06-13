import { useEffect, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
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

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

export function NotificationPanel({
  notifications,
  unreadCount,
  markAllRead,
  open,
  onToggle,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

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
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau — aligné à droite, jamais hors écran */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl z-[300] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-stone-500" />
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} non lu{unreadCount > 1 ? "es" : "e"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllRead();
                  }}
                  title="Tout marquer comme lu"
                  className="flex items-center gap-1 text-xs text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <CheckCheck size={13} />
                  <span>Tout lu</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-stone-400">
                <Bell className="h-8 w-8 opacity-20" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors",
                    !n.read
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800/40"
                  )}
                >
                  {/* Indicateur lu/non-lu */}
                  <span
                    className={cn(
                      "mt-2 w-2 h-2 rounded-full flex-shrink-0 transition-colors",
                      !n.read ? "bg-amber-500" : "bg-stone-200 dark:bg-stone-700"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">
                      {n.guestName ?? "Client"}
                    </p>
                    {(n.checkIn || n.checkOut) && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {n.checkIn ? formatDate(n.checkIn) : ""}
                        {" → "}
                        {n.checkOut ? formatDate(n.checkOut) : ""}
                        {n.guests ? ` · ${n.guests} pers.` : ""}
                      </p>
                    )}
                    {n.status && (
                      <span className="inline-block mt-1 text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        {n.status}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 whitespace-nowrap mt-0.5 flex-shrink-0">
                    {timeAgo(n.receivedAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-center">
              <a
                href="/admin/reservations"
                onMouseDown={(e) => e.stopPropagation()}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline underline-offset-2 transition-colors"
              >
                Voir toutes les réservations →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}