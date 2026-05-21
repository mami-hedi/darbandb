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
      back: "Retour aux suites",
      bookCta: "Réserver cette suite",
      amenitiesTitle: "Équipements de la suite",
      items: [
        { id: "suite-azur", t: "Suite Azur", d: "Vue panoramique sur le golfe." },
        { id: "suite-olive", t: "Suite Olive", d: "Sérénité et tons organiques." },
        { id: "suite-jasmin", t: "Suite Jasmin", d: "Lumière et accès patio." },
        { id: "suite-ambre", t: "Suite Ambre", d: "Chaleur des matières nobles." },
      ],
      details: {
        "suite-azur": {
          title: "Suite Azur",
          tagline: "Vue mer & Sérénité",
          description: "Plongez dans un havre de paix aux nuances méditerranéennes. La Suite Azur offre des volumes généreux, une lumière naturelle traversante et des finitions haut de gamme alliant le bois noble à la pureté du blanc.",
          specs: ["Superficie : 45m²", "Lit King Size double", "Terrasse privée vue piscine", "Salle de bain en marbre"]
        },
        "suite-olive": {
          title: "Suite Olive",
          tagline: "Douceur & Authenticité",
          description: "Inspirée des oliviers centenaires de la région, cette suite associe des textures organiques à des lignes contemporaines épurées. Un espace chaleureux propice à la détente absolue.",
          specs: ["Superficie : 42m²", "Lit King Size double", "Espace salon intégré", "Douche à l'italienne en pierre"]
        },
        "suite-jasmin": {
          title: "Suite Jasmin",
          tagline: "Élégance & Parfum d'Orient",
          description: "Véritable hommage à la fleur emblématique d'Hammamet, la Suite Jasmin marie subtilement touches artisanales locales et confort moderne absolu. Un cocon de douceur très lumineux.",
          specs: ["Superficie : 40m²", "Lit de luxe double", "Vue jardin aromatique", "Baignoire îlot autoportante"]
        },
        "suite-ambre": {
          title: "Suite Ambre",
          tagline: "Lumière dorée & Raffinement",
          description: "La Suite Ambre séduit par ses teintes chaleureuses et son atmosphère intimiste. Ses détails en noir mat et bois brûlé contrastent magnifiquement avec la clarté de l'architecture moderne.",
          specs: ["Superficie : 50m²", "Lit King Size", "Salon privé indépendant", "Accès direct solarium"]
        }
      }
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
      back: "Back to suites",
      bookCta: "Book this suite",
      amenitiesTitle: "Suite Amenities",
      items: [
        { id: "suite-azur", t: "Azur Suite", d: "Panoramic views of the gulf." },
        { id: "suite-olive", t: "Olive Suite", d: "Serenity and organic tones." },
        { id: "suite-jasmin", t: "Jasmin Suite", d: "Light and patio access." },
        { id: "suite-ambre", t: "Amber Suite", d: "Warmth of noble materials." },
      ],
      details: {
        "suite-azur": {
          title: "Azur Suite",
          tagline: "Sea view & Serenity",
          description: "Immerse yourself in a haven of peace with Mediterranean hues. The Azur Suite offers generous volumes, ambient natural light, and high-end finishes blending noble wood with pure whites.",
          specs: ["Size: 45sqm", "Double King Size bed", "Private terrace with pool view", "Marble bathroom"]
        },
        "suite-olive": {
          title: "Olive Suite",
          tagline: "Softness & Authenticity",
          description: "Inspired by the region's century-old olive trees, this suite pairs organic textures with sleek contemporary lines. A warm, welcoming space designed for pure relaxation.",
          specs: ["Size: 42sqm", "Double King Size bed", "Integrated lounge area", "Walk-in stone shower"]
        },
        "suite-jasmin": {
          title: "Jasmin Suite",
          tagline: "Elegance & Eastern scent",
          description: "A true tribute to the iconic flower of Hammamet, the Jasmin Suite subtly blends local craftsmanship touches with absolute modern comfort. A very bright and soft cocoon.",
          specs: ["Size: 40sqm", "Deluxe double bed", "Aromatic garden view", "Freestanding island bathtub"]
        },
        "suite-ambre": {
          title: "Amber Suite",
          tagline: "Golden light & Refinement",
          description: "The Amber Suite captivates with its warm tones and intimate atmosphere. Matte black and scorched wood details contrast beautifully with the crisp, modern architectural layout.",
          specs: ["Size: 50sqm", "King Size bed", "Independent private lounge", "Direct solarium access"]
        }
      }
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