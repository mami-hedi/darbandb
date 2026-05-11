// ============================================
// Composant: Calendrier Disponibilité
// @/components/AvailabilityCalendar.tsx
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarDay {
  date: string;
  day: number;
  month: number;
  year: number;
  available: boolean;
  dayOfWeek: number;
  dayName: string;
}

interface PriceData {
  nights: number;
  pricePerNight: number;
  totalPrice: number;
}

export function AvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Charger le calendrier au montage et quand le mois change
  useEffect(() => {
    fetchCalendar();
  }, [currentDate]);

  // ============================================
  // RÉCUPÉRER LE CALENDRIER
  // ============================================
  const fetchCalendar = async () => {
    setLoading(true);
    setError(null);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(
        `${API_BASE}/availability/calendar?year=${year}&month=${month}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du calendrier');
      }

      const data = await response.json();
      setCalendar(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setCalendar([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CALCULER LE PRIX
  // ============================================
  const calculatePrice = async (inDate: string, outDate: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/availability/price?checkIn=${inDate}&checkOut=${outDate}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du calcul du prix');
      }

      const data = await response.json();
      if (data.success) {
        setPriceInfo(data.data);
      }
    } catch (err) {
      console.error('Erreur calcul prix:', err);
      setPriceInfo(null);
    }
  };

  // ============================================
  // GESTION DES CLICS SUR LES DATES
  // ============================================
  const handleDateClick = (day: CalendarDay) => {
    // Ne pas pouvoir sélectionner une date non disponible
    if (!day.available) {
      setError('Cette date n\'est pas disponible');
      return;
    }

    setError(null);

    // Si c'est la première sélection (check-in)
    if (!checkIn) {
      setCheckIn(day.date);
      setCheckOut(null);
      setPriceInfo(null);
    }
    // Si check-in est sélectionné et on clique sur une date après
    else if (checkOut === null) {
      const checkInDate = new Date(checkIn);
      const clickedDate = new Date(day.date);

      // Vérifier que la date cliquée est après check-in
      if (clickedDate <= checkInDate) {
        setCheckIn(day.date);
        return;
      }

      // Vérifier si toutes les dates entre checkIn et checkOut sont disponibles
      const allAvailable = isRangeAvailable(checkIn, day.date);
      if (!allAvailable) {
        setError('La plage de dates sélectionnée contient des dates non disponibles');
        return;
      }

      setCheckOut(day.date);
      calculatePrice(checkIn, day.date);
    } else {
      // Réinitialiser
      setCheckIn(day.date);
      setCheckOut(null);
      setPriceInfo(null);
    }
  };

  // ============================================
  // VÉRIFIER SI LA PLAGE EST DISPONIBLE
  // ============================================
  const isRangeAvailable = (start: string, end: string): boolean => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return calendar.every((day) => {
      const dayDate = new Date(day.date);
      if (dayDate >= startDate && dayDate < endDate) {
        return day.available;
      }
      return true;
    });
  };

  // ============================================
  // VÉRIFIER SI UNE DATE EST DANS LA PLAGE
  // ============================================
  const isInRange = (dateStr: string): boolean => {
    if (!checkIn) return false;
    if (!checkOut) return false;

    const date = new Date(dateStr);
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    return date >= start && date <= end;
  };

  // ============================================
  // NAVIGATION MOIS
  // ============================================
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // ============================================
  // FORMATER LA DATE
  // ============================================
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ============================================
  // RENDU
  // ============================================
  const monthName = currentDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const emptyDays = Array(firstDay).fill(null);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-background border border-border">
      {/* TITRE */}
      <div className="mb-8">
        <h2 className="text-2xl font-display mb-2">Vérifier la disponibilité</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez une date d'arrivée, puis une date de départ
        </p>
      </div>

      {/* AFFICHAGE DES DATES SÉLECTIONNÉES */}
      {(checkIn || checkOut) && (
        <div className="mb-6 p-4 bg-accent/20 border border-accent/40">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Arrivée</p>
              <p className="text-sm font-semibold">
                {checkIn ? formatDate(checkIn) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Départ</p>
              <p className="text-sm font-semibold">
                {checkOut ? formatDate(checkOut) : 'Sélectionnez une date'}
              </p>
            </div>
          </div>

          {/* PRIX */}
          {priceInfo && (
            <div className="pt-4 border-t border-accent/40">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Nuits</p>
                  <p className="font-semibold">{priceInfo.nights}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Par nuit</p>
                  <p className="font-semibold">{priceInfo.pricePerNight}€</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{priceInfo.totalPrice}€</p>
                </div>
              </div>

              <button
                onClick={() => {
                  // Rediriger vers le formulaire de réservation
                  window.location.href = `/contact?checkIn=${checkIn}&checkOut=${checkOut}`;
                }}
                className="w-full mt-4 bg-foreground text-background py-2 text-sm font-semibold hover:opacity-90 transition"
              >
                Réserver Maintenant
              </button>
            </div>
          )}
        </div>
      )}

      {/* MESSAGE D'ERREUR */}
      {error && (
        <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* CALENDRIER */}
      <div className="space-y-4">
        {/* EN-TÊTE AVEC NAVIGATION */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-secondary transition"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h3 className="text-lg font-semibold capitalize text-center min-w-[200px]">
            {monthName}
          </h3>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-secondary transition"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : (
          <>
            {/* JOURS DE LA SEMAINE */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-xs font-semibold text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* JOURS DU MOIS */}
            <div className="grid grid-cols-7 gap-1">
              {/* Jours vides au début du mois */}
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="h-10 bg-secondary/20" />
              ))}

              {/* Jours du mois */}
              {calendar.map((day) => {
                const isSelected =
                  day.date === checkIn || day.date === checkOut;
                const isInSelectRange = isInRange(day.date);
                const isToday =
                  day.date === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={day.date}
                    onClick={() => handleDateClick(day)}
                    disabled={!day.available}
                    className={cn(
                      'h-10 flex items-center justify-center text-xs font-semibold rounded transition',
                      // Disponible - vert clair par défaut
                      day.available && !isSelected && !isInSelectRange
                        ? 'bg-green-100 hover:bg-green-200 text-foreground cursor-pointer'
                        : '',
                      // Non disponible - rouge
                      !day.available
                        ? 'bg-destructive/30 text-destructive cursor-not-allowed opacity-60'
                        : '',
                      // Sélectionné (checkIn ou checkOut) - noir
                      isSelected
                        ? 'bg-foreground text-background font-bold'
                        : '',
                      // Dans la plage - bleu clair
                      isInSelectRange && !isSelected
                        ? 'bg-blue-200 text-foreground'
                        : '',
                      // Aujourd'hui - bordure
                      isToday && day.available
                        ? 'border-2 border-foreground'
                        : '',
                    )}
                    title={
                      !day.available ? 'Non disponible' : ''
                    }
                  >
                    {day.day}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* LÉGENDE */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-green-100 rounded border border-green-200" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-destructive/30 rounded border border-destructive/50" />
            <span>Non disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-foreground rounded" />
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-blue-200 rounded border border-blue-300" />
            <span>Sélectionné</span>
          </div>
        </div>
      </div>
    </div>
  );
}