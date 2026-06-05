// ============================================
// Dictionnaire de Traduction Bilingue Mis à Jour
// i18n/dict.ts
// ============================================

export type Lang = "fr" | "en";

export const dict = {
  fr: {
    nav: { 
      home: "Accueil", 
      gallery: "Galerie", 
      blog: "Blog", 
      contact: "Contact", 
      booking: "Réservation",
      check: "Vérifier disponibilité", 
      admin: "Admin",
      faq: "FAQ"
    },
    hero: {
      eyebrow: "DAR B&B — Direction de Marque",
      title: "Une Échappée Privée Entre Mer et Montagne",
      sub: "Découvrez une villa d’exception sur les hauteurs de Hammamet, mêlant luxe contemporain, confort intelligent et hospitalité tunisienne raffinée. Des vues panoramiques, des expériences sur mesure et une atmosphère pensée pour ralentir le temps.",
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
        { id: "suite-royale", t: "Suite Royale", d: "Chaleur des matières nobles." },
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
        "suite-royale": {
          title: "Suite Royale",
          tagline: "Lumière dorée & Raffinement",
          description: "La Suite Royale séduit par ses teintes chaleureuses et son atmosphère intimiste. Ses détails en noir mat et bois brûlé contrastent magnifiquement avec la clarté de l'architecture moderne.",
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
    blogTitle: "Blog", blogSub: "Récits, adresses et inspirations.",
    galleryTitle: "Galerie", gallerySub: "Lumière, matières, paysage.",
    
    // SECTION CONTACT CORRIGÉE (Services & Support sans dates de réservation)
    contact: {
      eyebrow: "Assistance & Conciergerie",
      title: "Contact & Services",
      sub: "Une question spécifique, une demande de service particulier ou besoin d'assistance ? Notre équipe vous répond sous 24 heures.",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Adresse Email",
      phone: "Téléphone",
      subject: "Service ou type de demande",
      message: "Votre message",
      messagePlaceholder: "Décrivez votre demande en détail ici...",
      submit: "Envoyer le message",
      success: "Votre message a bien été transmis avec succès.",
      infoTitle: "Dar B&B Hammamet",
      infoDesc: "Besoin d'une réponse immédiate ? Nos lignes téléphoniques et notre support email restent à votre entière disposition.",
      
      // Menu déroulant de l'objet du contact
      subjects: {
        general: "Question générale / Renseignement",
        service: "Demande de service sur-mesure (Chef, Transfert...)",
        partnership: "Partenariat & Événementiel",
        support: "Assistance & Suivi de dossier",
        other: "Autre demande"
      }
    },
     // À ajouter dans la section 'fr'
questions: {
  eyebrow: "Questions ?",
  title: "Besoin d'informations personnalisées ?",
  sub: "Vous avez des questions sur la villa, nos services ou vous souhaitez une offre sur-mesure ? Nous sommes là pour vous répondre.",
  cta: "Nous contacter"
},
philosophy: {
  eyebrow: "La maison",
  title: "DAR B&B n’est pas simplement un hébergement.",
  subtitle: "C’est une parenthèse exclusive conçue pour les voyageurs à la recherche d’intimité, de sérénité et d’expériences personnalisées.",
  points: [
    "Luxe moderne et minimaliste",
    "Atmosphère chaleureuse et élégante",
    "Expérience privée haut de gamme",
    "Vue panoramique exceptionnelle",
    "Services personnalisés",
    "Smart villa & confort absolu"
  ]
},

    // SECTION BOOKING CORRIGÉE (Processus complet sur fond noir)
    booking: {
      eyebrow: "Réservation",
      title: "Mode de réservation",
      sub: "Afin de vous offrir la meilleure expérience possible, veuillez sélectionner votre canal de réservation préféré ci-dessous.",
      
      directTitle: "Réservation Directe",
      directDesc: "Recommandé pour nos clients résidents en Tunisie. Paiement local (Virement bancaire ou TND).",
      airbnbTitle: "Via Airbnb",
      airbnbDesc: "Recommandé pour nos clients internationaux. Paiement sécurisé en devises h24.",
      selected: "Sélectionné",
      
      step1: "1. Sélection de vos dates sur le calendrier direct",
      step2: "2. Informations personnelles & Validation locale",
      checkIn: "Arrivée (Check-in)",
      checkOut: "Départ (Check-out)",
      guests: "Voyageurs",
      guestsPlaceholder: "personne",
      guestsPlaceholderPlural: "personnes",
      specialRequests: "Demandes particulières",
      specialRequestsPlaceholder: "Demandes particulières, horaires d'arrivée ou spécificités locales...",
      submitDirect: "Envoyer ma demande directe",
      submitSending: "Demande envoyée",
      
      airbnbHeading: "— Plateforme Internationale Airbnb —",
      airbnbMainText: "Vous avez choisi la réservation via Airbnb",
      airbnbLongDesc: "Idéal pour nos voyageurs du monde entier. Vous quittez notre interface locale pour réserver sur un espace entièrement sécurisé, avec support client multilingue h24 et gestion transparente de vos devises.",
      airbnbAction: "Ouvrir le calendrier Airbnb",
      
      asideTitle: "Dar B&B",
      asideDesc: "Une équipe à votre écoute 7j/7. Réponse sous 24h.",
      
      // Modales de réponse
      modalClose: "Fermer",
      missingDatesTitle: "Dates manquantes",
      missingDatesDesc: "Veuillez sélectionner une date d'arrivée et de départ sur le calendrier avant de valider.",
      successTitle: "Demande reçue !",
      successDesc: "Votre demande de réservation directe a été enregistrée avec succès. Notre équipe va vérifier les disponibilités et vous recontactera sous 24h pour finaliser le paiement local.",
      errorTitle: "Échec de l'envoi",
      errorConnTitle: "Erreur de connexion",
      errorConnDesc: "Impossible de joindre le serveur. Veuillez vérifier votre connexion internet et réessayer."
    },

    faq: {
      title: "Questions Fréquentes",
      sub: "Tout ce que vous devez savoir pour préparer votre séjour exclusif à la villa.",
      items: [
        { q: "Quels sont les horaires de check-in et check-out ?", a: "Les arrivées s'effectuent à partir de 15h00 et les départs avant 11h00. Des aménagements horaires sont possibles sur demande préalable, selon nos disponibilités." },
        { q: "La villa est-elle partagée avec d'autres clients ?", a: "Non. La villa Dar B&B est louée exclusivement dans son intégralité. Vous bénéficiez d'un accès totalement privé à la maison, aux 4 suites, au jardin et à la piscine." },
        { q: "La piscine est-elle utilisable toute l'année ?", a: "La piscine à débordement est chauffée durant les mois de mi-saison (printemps et automne) pour garantir une baignade idéale. Pour la période hivernale, contactez-nous." },
        { q: "Proposez-vous un service de transfert depuis l'aéroport ?", a: "Oui, notre conciergerie se charge d'organiser vos transferts privés depuis les aéroports de Tunis-Carthage ou d'Enfidha sur simple demande." }
      ]
    },
    footer: { rights: "Tous droits réservés", made: "Conçu avec soin à Hammamet", info: "Informations pratiques" },
  },
  
  en: {
    nav: { 
      home: "Home", 
      gallery: "Gallery", 
      blog: "Blog", 
      contact: "Contact", 
      booking: "Booking",
      check: "Check availability", 
      admin: "Admin",
      faq: "FAQ"
    },
    hero: {
      eyebrow: "Guesthouse · Hammamet",
      title: "A Private Escape Between Sea and Mountain",
      sub: "Discover an exceptional villa on the heights of Hammamet, blending contemporary luxury, smart comfort, and refined Tunisian hospitality. Enjoy panoramic views, bespoke experiences, and an atmosphere designed to slow down time.",
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
        { id: "suite-royale", t: "Royal Suite", d: "Warmth of noble materials." },
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
          specs: ["Size: 40sqm", "Deluxe double bed", "Aromatic guesthouse view", "Freestanding island bathtub"]
        },
        "suite-royale": {
          title: "Royal Suite",
          tagline: "Golden light & Refinement",
          description: "The Royal Suite captivates with its warm tones and intimate atmosphere. Matte black and scorched wood details contrast beautifully with the crisp, modern architectural layout.",
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
    blogTitle: "Blog", blogSub: "Stories, places, inspirations.",
    galleryTitle: "Gallery", gallerySub: "Light, materials, landscape.",
    
    // CONTACT TRANSLATION
    contact: {
      eyebrow: "Support & Concierge",
      title: "Contact & Services",
      sub: "Any specific questions, custom service requests, or need assistance? Our team answers within 24 hours.",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone",
      subject: "Service or Request Type",
      message: "Your Message",
      messagePlaceholder: "Describe your request in detail here...",
      submit: "Send Message",
      success: "Your message has been successfully transmitted.",
      infoTitle: "Dar B&B Hammamet",
      infoDesc: "Need an immediate answer? Our phone lines and email support remain entirely at your disposal.",
      subjects: {
        general: "General Inquiry / Information",
        service: "Custom Service Request (Chef, Transfer...)",
        partnership: "Partnership & Events",
        support: "Assistance & File Follow-up",
        other: "Other Request"
      }
    },
    

   
// À ajouter dans la section 'en'
questions: {
  eyebrow: "Questions?",
  title: "Need personalized information?",
  sub: "Do you have questions about the villa, our services, or would you like a custom offer? We are here to assist you.",
  cta: "Contact us"
},

// --- Dans la section 'en' ---
philosophy: {
  eyebrow: "The house",
  title: "DAR B&B is more than just a stay.",
  subtitle: "It is an exclusive retreat designed for travelers seeking privacy, serenity, and personalized experiences.",
  points: [
    "Modern and minimalist luxury",
    "Warm and elegant atmosphere",
    "Premium private experience",
    "Exceptional panoramic view",
    "Personalized services",
    "Smart villa & absolute comfort"
  ]
},
    // BOOKING TRANSLATION
    booking: {
      eyebrow: "Booking",
      title: "Reservation Method",
      sub: "To provide you with the best possible experience, please select your preferred booking channel below.",
      
      directTitle: "Direct Booking",
      directDesc: "Recommended for Tunisian residents. Local payment (Bank transfer or TND).",
      airbnbTitle: "Via Airbnb",
      airbnbDesc: "Recommended for international guests. Secure 24/7 payment in global currencies.",
      selected: "Selected",
      
      step1: "1. Select your dates on the direct calendar",
      step2: "2. Personal information & Local verification",
      checkIn: "Check-in",
      checkOut: "Check-out",
      guests: "Guests",
      guestsPlaceholder: "person",
      guestsPlaceholderPlural: "guests",
      specialRequests: "Special Requests",
      specialRequestsPlaceholder: "Special requests, arrival times, or local specifications...",
      submitDirect: "Send my direct request",
      submitSending: "Request sent",
      
      airbnbHeading: "— Airbnb International Platform —",
      airbnbMainText: "You chose to book via Airbnb",
      airbnbLongDesc: "Ideal for our global travelers. You leave our local layout to book on an entirely secure workspace, with 24/7 multilingual support and seamless currency processing.",
      airbnbAction: "Open Airbnb Calendar",
      
      asideTitle: "Dar B&B",
      asideDesc: "A team at your service 7 days a week. Response within 24h.",
      
      modalClose: "Close",
      missingDatesTitle: "Missing Dates",
      missingDatesDesc: "Please select a check-in and check-out date on the calendar before submitting.",
      successTitle: "Request Received!",
      successDesc: "Your direct booking request has been successfully saved. Our team will verify availabilities and get back to you within 24 hours to finalize local payment.",
      errorTitle: "Submission Failed",
      errorConnTitle: "Connection Error",
      errorConnDesc: "Unable to reach server. Please check your internet connection and try again."
    },

    faq: {
      title: "Frequently Asked Questions",
      sub: "Everything you need to know to prepare for your exclusive stay at the villa.",
      items: [
        { q: "What are the check-in and check-out times?", a: "Check-in is available from 3:00 PM, and check-out is before 11:00 AM. Flexible timings can be arranged upon request, subject to availability." },
        { q: "Is the villa shared with other guests?", a: "No. Dar B&B is rented strictly on an exclusive basis. You will enjoy complete, private access to the entire estate, its 4 suites, guesthouse, and infinity pool." },
        { q: "Is the pool available year-round?", a: "The infinity pool is heated during mid-season months (spring and autumn) to ensure optimal swimming comfort. For winter requests, please reach out to us." },
        { q: "Do you provide airport transfer services?", a: "Yes, our concierge team can easily arrange private transfers from either Tunis-Carthage or Enfidha airports upon request." }
      ]
    },
    footer: { rights: "All rights reserved", made: "Crafted with care in Hammamet", info: "Practical Information" },
  },
} as const;