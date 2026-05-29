import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/i18n/LanguageContext';
import { useNavigate } from '@tanstack/react-router'; // Import pour la redirection

interface CalendarDay {
  date: string;
  day: number;
  available: boolean;
}

interface PriceData {
  nights: number;
  pricePerNight: number;
  totalPrice: number;
}

interface AvailabilityCalendarProps {
  isAdmin?: boolean;
  onUpdate?: () => void;
}

export function AvailabilityCalendar({ isAdmin = false, onUpdate }: AvailabilityCalendarProps) {
  const { lang } = useLang();
  const navigate = useNavigate(); // Hook de navigation
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Correction ici : Utilisation de import.meta.env.VITE_API_URL pour Vite
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await fetch(`${API_BASE}/availability/calendar?year=${year}&month=${month}`);
      const data = await response.json();
      setCalendar(data.data || []);
    } catch (err) {
      setError(lang === 'fr' ? 'Erreur de connexion' : 'Connection error');
    } finally {
      setLoading(false);
    }
  }, [currentDate, API_BASE, lang]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Redirection vers la page Contact avec les dates
  const handleRedirectToContact = () => {
    if (!checkIn || !checkOut) return;
    
    navigate({
      to: '/booking',
      search: {
        checkIn: checkIn,
        checkOut: checkOut,
      },
    });
  };

  const toggleAvailability = async (day: CalendarDay) => {
    const oldCalendar = [...calendar];
    setCalendar(calendar.map(d => d.date === day.date ? { ...d, available: !d.available } : d));

    try {
      const response = await fetch(`${API_BASE}/availability/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: day.date, available: !day.available })
      });
      if (!response.ok) throw new Error();
      if (onUpdate) onUpdate();
    } catch (err) {
      setCalendar(oldCalendar);
      setError("Erreur lors de la mise à jour");
    }
  };

  const handleDateClick = async (day: CalendarDay) => {
    if (isAdmin) return toggleAvailability(day);
    if (!day.available) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day.date);
      setCheckOut(null);
      setPriceInfo(null);
    } else {
      if (new Date(day.date) <= new Date(checkIn)) {
        setCheckIn(day.date);
        return;
      }
      setCheckOut(day.date);
      
      try {
        const res = await fetch(`${API_BASE}/availability/price?checkIn=${checkIn}&checkOut=${day.date}`);
        const data = await res.json();
        if (data.success) setPriceInfo(data.data);
      } catch (err) {
        console.error("Erreur prix:", err);
      }
    }
  };

  const isInRange = (dateStr: string) => {
    if (!checkIn || !checkOut) return false;
    return dateStr > checkIn && dateStr < checkOut;
  };

  const monthName = currentDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
  const weekDays = lang === 'fr' ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className={cn("w-full bg-white", !isAdmin && "max-w-2xl mx-auto p-6 border border-border shadow-sm")}>
      {!isAdmin && (
        <div className="mb-8">
          <h2 className="text-2xl font-display">{lang === 'fr' ? 'Vérifier la disponibilité' : 'Check Availability'}</h2>
        </div>
      )}

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      {/* Rendu du prix et BOUTON DE REDIRECTION */}
      {!isAdmin && priceInfo && checkIn && checkOut && (
        <div className="mb-6 p-4 bg-stone-50 border border-stone-200 animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-center text-sm mb-4 font-bold">
             <span>{priceInfo.nights} {lang === 'fr' ? 'Nuits' : 'Nights'}</span>
             <span className="text-xl">{priceInfo.totalPrice}€</span>
           </div>
           <button 
            onClick={handleRedirectToContact}
            className="w-full bg-stone-950 text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-stone-800 transition-colors"
           >
             {lang === 'fr' ? 'Réserver' : 'Book Now'}
           </button>
        </div>
      )}

      {/* Navigation Calendrier */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-stone-100 rounded-full"><ChevronLeft size={20}/></button>
        <h3 className="text-sm font-bold uppercase tracking-widest">{monthName}</h3>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-stone-100 rounded-full"><ChevronRight size={20}/></button>
      </div>

      <div className="grid grid-cols-7 gap-1 relative">
        {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">Chargement...</div>}
        {weekDays.map(d => <div key={d} className="h-10 flex items-center justify-center text-[10px] font-bold text-stone-400 uppercase">{d}</div>)}
        {Array(firstDay).fill(null).map((_, i) => <div key={i} className="h-12 bg-stone-50/30" />)}
        {calendar.map((day) => (
          <button
            key={day.date}
            onClick={() => handleDateClick(day)}
            className={cn(
              'h-12 flex flex-col items-center justify-center text-xs font-medium rounded-sm transition-all relative',
              day.available ? 'bg-white border border-stone-100 hover:border-stone-900' : 'bg-stone-100 text-stone-300',
              (day.date === checkIn || day.date === checkOut) && 'bg-stone-950 text-white z-10',
              isInRange(day.date) && 'bg-stone-100',
              isAdmin && !day.available && 'bg-red-50 text-red-400 border-red-100'
            )}
          >
            {day.day}
            {!day.available && <span className="absolute w-4 h-[1px] bg-current rotate-45" />}
          </button>
        ))}
      </div>
    </div>
  );
}