import { useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Calendar, Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingNotif } from "@/hooks/useReservationNotifications";

interface Props {
  notifications: BookingNotif[];
  unreadCount: number;
  markAllRead: () => void;
  markOneRead?: (id: string) => void;
  deleteOne?: (id: string) => void;
  clearAll?: () => void;
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
  if (diff < 60)    return "à l'instant";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

export function NotificationPanel({
  notifications,
  unreadCount,
  markAllRead,
  markOneRead,
  deleteOne,
  clearAll,
  open,
  onToggle,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermer en cliquant à l'extérieur
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

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div ref={panelRef} className="relative">

      {/* ── Bouton cloche ── */}
      <button
        type="button"
        onClick={onToggle}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <span className="
            absolute -top-0.5 -right-0.5
            min-w-[18px] h-[18px]
            flex items-center justify-center
            bg-amber-500 text-white
            text-[10px] font-bold
            rounded-full px-1
            border-2 border-neutral-950
          ">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panneau ── */}
      {open && (
        <div
          className="
            absolute right-0 top-[calc(100%+10px)]
            w-80 max-w-[calc(100vw-2rem)]
            bg-neutral-900
            border border-neutral-700
            rounded-xl shadow-2xl shadow-black/50
            z-[300] overflow-hidden
          "
        >

          {/* Header */}
          <div className="
            flex items-center justify-between
            px-4 py-3
            border-b border-neutral-800
            bg-neutral-900
          ">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="
                  text-[11px] font-bold
                  bg-amber-500/15 text-amber-400
                  border border-amber-500/30
                  px-2 py-0.5 rounded-full
                ">
                  {unreadCount} non lu{unreadCount > 1 ? "es" : "e"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">

              {/* Tout marquer comme lu */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  title="Tout marquer comme lu"
                  className="
                    flex items-center gap-1
                    text-xs text-neutral-400
                    hover:text-emerald-400
                    px-2 py-1 rounded-lg
                    hover:bg-emerald-500/10
                    transition-colors
                  "
                >
                  <CheckCheck size={13} />
                  <span>Tout lu</span>
                </button>
              )}

              {/* Tout supprimer */}
              {clearAll && notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAll()}
                  title="Vider l'historique"
                  className="
                    p-1.5 rounded-lg
                    text-neutral-600
                    hover:text-rose-400
                    hover:bg-rose-500/10
                    transition-colors
                  "
                >
                  <Trash2 size={13} />
                </button>
              )}

              {/* Fermer */}
              <button
                type="button"
                onClick={onClose}
                className="
                  p-1.5 rounded-lg
                  text-neutral-500
                  hover:text-white
                  hover:bg-neutral-800
                  transition-colors
                "
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-neutral-800/60">

            {notifications.length === 0 ? (

              /* État vide */
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-neutral-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-400">
                    Aucune notification
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Les nouvelles réservations apparaîtront ici
                  </p>
                </div>
              </div>

            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer",
                    !n.read
                      ? "bg-amber-500/5 hover:bg-amber-500/10"
                      : "hover:bg-neutral-800/40"
                  )}
                  onClick={() => markOneRead?.(n.id)}
                >
                  {/* Point lu / non-lu */}
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={cn(
                        "block w-2 h-2 rounded-full transition-colors",
                        !n.read ? "bg-amber-500" : "bg-neutral-700"
                      )}
                    />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">

                    {/* Nom client */}
                    <p className="text-sm font-semibold text-white truncate">
                      {n.guestName ?? "Nouveau client"}
                    </p>

                    {/* Dates + invités */}
                    {(n.checkIn || n.checkOut) && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Calendar className="h-3 w-3 text-neutral-500 flex-shrink-0" />
                        <p className="text-xs text-neutral-400">
                          {n.checkIn  ? formatDate(n.checkIn)  : "—"}
                          {" → "}
                          {n.checkOut ? formatDate(n.checkOut) : "—"}
                        </p>
                        {n.guests && (
                          <>
                            <span className="text-neutral-700">·</span>
                            <Users className="h-3 w-3 text-neutral-500 flex-shrink-0" />
                            <span className="text-xs text-neutral-400">
                              {n.guests} pers.
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Badge statut */}
                    {n.status && (
                      <span className="
                        inline-flex items-center mt-1.5
                        text-[11px] font-medium
                        bg-amber-500/10 text-amber-400
                        border border-amber-500/20
                        px-2 py-0.5 rounded-full
                      ">
                        {n.status}
                      </span>
                    )}
                  </div>

                  {/* Droite : temps + supprimer */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[11px] text-neutral-600 whitespace-nowrap">
                      {timeAgo(n.receivedAt)}
                    </span>
                    {deleteOne && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOne(n.id);
                        }}
                        title="Supprimer"
                        className="
                          opacity-0 group-hover:opacity-100
                          p-0.5 rounded
                          text-neutral-600
                          hover:text-rose-400
                          transition-all
                        "
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="
              px-4 py-2.5
              border-t border-neutral-800
              bg-neutral-950/50
              flex items-center justify-between
            ">
              <span className="text-[11px] text-neutral-600">
                {notifications.length} notification{notifications.length > 1 ? "s" : ""}
              </span>
              <a
                href="/admin/reservations"
                onMouseDown={(e) => e.stopPropagation()}
                className="
                  text-xs text-neutral-500
                  hover:text-amber-400
                  transition-colors
                  underline underline-offset-2
                "
              >
                Voir les réservations →
              </a>
            </div>
          )}

        </div>
      )}

    </div>
  );
}