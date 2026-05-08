import blog1 from "@/assets/blog1.jpg";
import blog2 from "@/assets/blog2.jpg";
import blog3 from "@/assets/blog3.jpg";

export type BlogPost = {
  slug: string;
  cover: string;
  date: string;
  category: { fr: string; en: string };
  title: { fr: string; en: string };
  excerpt: { fr: string; en: string };
  body: { fr: string; en: string };
};

export const posts: BlogPost[] = [
  {
    slug: "medina-hammamet",
    cover: blog1,
    date: "Mars 2026",
    category: { fr: "À découvrir", en: "Discover" },
    title: { fr: "Flâner dans la médina d'Hammamet", en: "Wandering through Hammamet's medina" },
    excerpt: {
      fr: "Ruelles blanches, portes bleues, parfum de jasmin — l'âme intacte du vieil Hammamet.",
      en: "White alleys, blue doors, jasmine in the air — the untouched soul of old Hammamet.",
    },
    body: {
      fr: "À deux pas de la villa, la médina d'Hammamet est l'un des plus jolis détours de la côte. On s'y perd avec délice entre les ateliers de céramistes, les épiceries chargées d'épices et les terrasses qui dominent la mer.\n\nNotre conseil : y aller tôt le matin, juste après le petit-déjeuner, lorsque les volets s'ouvrent et que la lumière rase les murs blancs.",
      en: "Just a short walk from the villa, the Hammamet medina is one of the prettiest detours along the coast. We love getting lost between ceramic workshops, fragrant grocers and rooftops overlooking the sea.\n\nOur tip: go early in the morning, just after breakfast, when the shutters open and the light grazes the white walls.",
    },
  },
  {
    slug: "petit-dejeuner",
    cover: blog2,
    date: "Février 2026",
    category: { fr: "Table", en: "Table" },
    title: { fr: "Notre petit-déjeuner tunisien", en: "Our Tunisian breakfast" },
    excerpt: {
      fr: "Huile d'olive nouvelle, dattes Deglet Nour, brik à l'œuf et thé à la menthe sur la terrasse.",
      en: "Fresh olive oil, Deglet Nour dates, egg brik and mint tea on the terrace.",
    },
    body: {
      fr: "Nous tenons à un petit-déjeuner généreux, simple et de saison. Tout vient de producteurs voisins — l'huile d'olive est pressée à froid à dix kilomètres.\n\nLe rituel commence à huit heures sur la terrasse, face à la mer.",
      en: "We care about a generous, simple and seasonal breakfast. Everything comes from nearby producers — the olive oil is cold-pressed ten kilometers away.\n\nThe ritual begins at 8am on the terrace, facing the sea.",
    },
  },
  {
    slug: "couchers-de-soleil",
    cover: blog3,
    date: "Janvier 2026",
    category: { fr: "Inspiration", en: "Inspiration" },
    title: { fr: "Les couchers de soleil d'Hammamet", en: "Hammamet sunsets" },
    excerpt: {
      fr: "Ce moment précis, juste avant la nuit, où la mer devient or et le silence absolu.",
      en: "That precise moment, just before night, when the sea turns gold and silence is absolute.",
    },
    body: {
      fr: "On prend l'habitude, ici, de marquer une pause à l'heure dorée. Un verre à la main, sur la terrasse, on regarde la mer changer de couleur.\n\nC'est, sans doute, ce que vous emporterez de plus précieux.",
      en: "Here, we get into the habit of pausing at golden hour. Glass in hand, on the terrace, watching the sea change color.\n\nIt may well be the most precious thing you take home.",
    },
  },
];
