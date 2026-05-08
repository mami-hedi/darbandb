export type Lang = "fr" | "en";

export const dict = {
  fr: {
    nav: { home: "Accueil", gallery: "Galerie", blog: "Journal", contact: "Contact", check: "Vérifier disponibilité", admin: "Admin" },
    hero: {
      eyebrow: "Maison d'hôte · Hammamet",
      title: "L'art de séjourner\nface à la Méditerranée",
      sub: "Une villa privative pensée pour la lenteur, la lumière et le silence. Location en exclusivité, sans partage.",
      cta: "Réserver le séjour",
      cta2: "Voir la galerie",
    },
    intro: {
      eyebrow: "La maison",
      title: "Une parenthèse, rien qu'à vous",
      body: "Située à quelques pas de la médina d'Hammamet, notre maison d'hôte se loue dans son intégralité — quatre chambres, piscine à débordement, terrasse vue mer. Un seul tarif, un seul groupe à la fois.",
    },
    features: [
      { t: "Location exclusive", d: "Toute la villa pour vous, jusqu'à 8 personnes." },
      { t: "Piscine privée", d: "Bassin chauffé avec vue mer ouverte." },
      { t: "Petit-déjeuner inclus", d: "Produits du marché, recettes du pays." },
      { t: "Conciergerie", d: "Transferts, chef privé, excursions sur demande." },
    ],
    suites: {
      eyebrow: "Hébergement",
      title: "Quatre suites d'exception",
      sub: "Chaque chambre est une invitation au calme, mêlant matériaux bruts et confort moderne.",
      viewDetails: "Voir les détails",
      items: [
        { id: "suite-azur", t: "Suite Azur", d: "Vue panoramique sur le golfe." },
        { id: "suite-olive", t: "Suite Olive", d: "Sérénité et tons organiques." },
        { id: "suite-jasmin", t: "Suite Jasmin", d: "Lumière et accès patio." },
        { id: "suite-ambre", t: "Suite Ambre", d: "Chaleur des matières nobles." },
      ]
    },
    wine: {
      eyebrow: "Expérience",
      title: "Cave & Sélection",
      sub: "Une sélection rigoureuse de vins locaux et internationaux pour accompagner vos soirées face au couchant.",
      cta: "Voir la carte des vins",
      modalTitle: "Carte des Boissons",
      close: "Fermer",
      disclaimer: "L'abus d'alcool est dangereux pour la santé."
    },
    pricing: { eyebrow: "Tarifs", title: "Un prix pour la villa entière", from: "À partir de", price: "450 €", per: "/ nuit · villa entière", note: "3 nuits minimum · Petit-déjeuner inclus", cta: "Demander une date" },
    blogTitle: "Journal", blogSub: "Récits, adresses et inspirations.",
    galleryTitle: "Galerie", gallerySub: "Lumière, matières, paysage.",
    contact: {
      title: "Réserver votre séjour", sub: "Indiquez vos dates et nous revenons vers vous sous 24h.",
      name: "Nom complet", email: "Email", phone: "Téléphone", arrival: "Arrivée", departure: "Départ", guests: "Voyageurs", message: "Message", submit: "Envoyer la demande",
      ok: "Demande envoyée. À très vite.",
      localTitle: "Réservation Directe",
      localDesc: "Recommandé pour nos clients résidents en Tunisie (Paiement local).",
      airbnbTitle: "Clients Internationaux",
      airbnbDesc: "Pour une réservation simplifiée avec carte internationale, veuillez passer par Airbnb.",
      airbnbAction: "Réserver via Airbnb",
    },
    footer: { rights: "Tous droits réservés", made: "Conçu avec soin à Hammamet" },
  },
  en: {
    nav: { home: "Home", gallery: "Gallery", blog: "Journal", contact: "Contact", check: "Check availability", admin: "Admin" },
    hero: {
      eyebrow: "Guesthouse · Hammamet",
      title: "The art of staying\nby the Mediterranean",
      sub: "A private villa designed for slowness, light, and silence. Whole-villa rental — never shared.",
      cta: "Book the stay",
      cta2: "View gallery",
    },
    intro: {
      eyebrow: "The house",
      title: "A retreat, just for you",
      body: "A short walk from the Hammamet medina, our guesthouse is rented in full — four bedrooms, infinity pool, sea-view terrace. One price, one group at a time.",
    },
    features: [
      { t: "Exclusive rental", d: "The entire villa for you, up to 8 guests." },
      { t: "Private pool", d: "Heated infinity pool with open sea view." },
      { t: "Breakfast included", d: "Market produce, local recipes." },
      { t: "Concierge", d: "Transfers, private chef, excursions on request." },
    ],
    suites: {
      eyebrow: "Accommodation",
      title: "Four exceptional suites",
      sub: "Each room is an invitation to peace, blending raw materials with modern comfort.",
      viewDetails: "View details",
      items: [
        { id: "suite-azur", t: "Azur Suite", d: "Panoramic views of the gulf." },
        { id: "suite-olive", t: "Olive Suite", d: "Serenity and organic tones." },
        { id: "suite-jasmin", t: "Jasmin Suite", d: "Light and patio access." },
        { id: "suite-ambre", t: "Amber Suite", d: "Warmth of noble materials." },
      ]
    },
    wine: {
      eyebrow: "Experience",
      title: "Cellar & Selection",
      sub: "A rigorous selection of local and international wines to accompany your sunset evenings.",
      cta: "View wine list",
      modalTitle: "Drinks Menu",
      close: "Close",
      disclaimer: "Alcohol abuse is dangerous for your health."
    },
    pricing: { eyebrow: "Rates", title: "One price for the whole villa", from: "From", price: "€450", per: "/ night · whole villa", note: "3-night minimum · Breakfast included", cta: "Request dates" },
    blogTitle: "Journal", blogSub: "Stories, places, inspirations.",
    galleryTitle: "Gallery", gallerySub: "Light, materials, landscape.",
    contact: {
      title: "Book your stay", sub: "Tell us your dates and we'll get back within 24h.",
      name: "Full name", email: "Email", phone: "Phone", arrival: "Arrival", departure: "Departure", guests: "Guests", message: "Message", submit: "Send request",
      ok: "Request sent. See you soon.",
      localTitle: "Direct Booking",
      localDesc: "Best for local residents and bank transfers within Tunisia.",
      airbnbTitle: "International Guests",
      airbnbDesc: "For a seamless booking experience with international cards, please use Airbnb.",
      airbnbAction: "Book on Airbnb",
    },
    footer: { rights: "All rights reserved", made: "Crafted with care in Hammamet" },
  },
} as const;