export type Reservation = {
  id: string;
  guest: string;
  email: string;
  phone: string;
  arrival: string; // ISO date
  departure: string;
  guests: number;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
  source: "site" | "airbnb";
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  stays: number;
  totalSpent: number;
};

export const reservations: Reservation[] = [
  { id: "R-2026-014", guest: "Sophie Martin", email: "sophie.m@mail.com", phone: "+33 6 12 34 56 78", arrival: "2026-05-12", departure: "2026-05-19", guests: 6, total: 3150, status: "confirmed", source: "site" },
  { id: "R-2026-013", guest: "James O'Brien", email: "james@obrien.uk", phone: "+44 7700 900123", arrival: "2026-05-02", departure: "2026-05-08", guests: 4, total: 2700, status: "confirmed", source: "airbnb" },
  { id: "R-2026-012", guest: "Karim Bouzid", email: "k.bouzid@mail.tn", phone: "+216 22 555 444", arrival: "2026-04-22", departure: "2026-04-25", guests: 8, total: 1350, status: "pending", source: "site" },
  { id: "R-2026-011", guest: "Lucia Rossi", email: "lucia@rossi.it", phone: "+39 333 1234567", arrival: "2026-04-10", departure: "2026-04-17", guests: 5, total: 3150, status: "confirmed", source: "airbnb" },
  { id: "R-2026-010", guest: "Anna Schmidt", email: "anna.s@mail.de", phone: "+49 151 23456789", arrival: "2026-03-28", departure: "2026-04-02", guests: 4, total: 2250, status: "cancelled", source: "site" },
  { id: "R-2026-009", guest: "Hugo Laurent", email: "hugo@laurent.fr", phone: "+33 6 98 76 54 32", arrival: "2026-03-15", departure: "2026-03-22", guests: 7, total: 3150, status: "confirmed", source: "site" },
];

export const clients: Client[] = [
  { id: "C-001", name: "Sophie Martin", email: "sophie.m@mail.com", phone: "+33 6 12 34 56 78", country: "FR", stays: 3, totalSpent: 8400 },
  { id: "C-002", name: "James O'Brien", email: "james@obrien.uk", phone: "+44 7700 900123", country: "UK", stays: 1, totalSpent: 2700 },
  { id: "C-003", name: "Karim Bouzid", email: "k.bouzid@mail.tn", phone: "+216 22 555 444", country: "TN", stays: 2, totalSpent: 2700 },
  { id: "C-004", name: "Lucia Rossi", email: "lucia@rossi.it", phone: "+39 333 1234567", country: "IT", stays: 1, totalSpent: 3150 },
  { id: "C-005", name: "Anna Schmidt", email: "anna.s@mail.de", phone: "+49 151 23456789", country: "DE", stays: 2, totalSpent: 5400 },
  { id: "C-006", name: "Hugo Laurent", email: "hugo@laurent.fr", phone: "+33 6 98 76 54 32", country: "FR", stays: 1, totalSpent: 3150 },
];

export const monthlyRevenue = [
  { m: "Jan", revenue: 4200, nights: 9 },
  { m: "Fév", revenue: 5400, nights: 12 },
  { m: "Mar", revenue: 7800, nights: 17 },
  { m: "Avr", revenue: 9450, nights: 21 },
  { m: "Mai", revenue: 12600, nights: 28 },
  { m: "Jun", revenue: 14400, nights: 32 },
  { m: "Jul", revenue: 18900, nights: 31 },
  { m: "Aoû", revenue: 18900, nights: 31 },
  { m: "Sep", revenue: 13050, nights: 29 },
  { m: "Oct", revenue: 9900, nights: 22 },
  { m: "Nov", revenue: 5850, nights: 13 },
  { m: "Déc", revenue: 7200, nights: 16 },
];

export const sourceMix = [
  { name: "Site direct", value: 58 },
  { name: "Airbnb", value: 42 },
];
