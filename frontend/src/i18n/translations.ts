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
  { id: "suite-royale", t: "Royal Suite", d: "Dressing luxe et vue mer." },
  { id: "suite-sunrise", t: "Sunrise Suite", d: "Face au lever du soleil." },
  { id: "suite-chill-1", t: "Chill Suite I", d: "Calme et marbre Calacatta." },
  { id: "suite-chill-2", t: "Chill Suite II", d: "Intimité et ressourcement." },
],
      details: {
  "suite-royale": {
    title: "Royal Suite",
    tagline: "Luxe & Vue Panoramique",
    description: "La pièce maîtresse de la villa. Dispose d'un dressing luxe avec îlot vitré à montres, d'une baignoire îlot majestueuse et d'un accès direct au balcon panoramique offrant une vue imprenable sur la mer.",
    specs: ["Superficie : 50m²", "Lit King Size", "Dressing avec îlot vitré", "Baignoire îlot royale", "Accès balcon panoramique"]
  },
  "suite-sunrise": {
    title: "Sunrise Suite",
    tagline: "Éveil face à la Méditerranée",
    description: "Orientée plein est pour capter les premiers rayons du soleil. Une suite lumineuse et apaisante partageant le balcon panoramique pour des moments de contemplation uniques.",
    specs: ["Superficie : 45m²", "Lit King Size", "Orientation Est", "Accès balcon panoramique", "Salle de bain privative"]
  },
  "suite-chill-1": {
    title: "Chill Suite I",
    tagline: "Nid de quiétude",
    description: "Suite intérieure élégante et parfaitement calme. Finitions en marbre Calacatta et confort king size pour une parenthèse de repos absolu.",
    specs: ["Superficie : 40m²", "Lit King Size", "Environnement calme", "Marbre Calacatta", "Salle de bain privative"]
  },
  "suite-chill-2": {
    title: "Chill Suite II",
    tagline: "Sérénité intérieure",
    description: "Conçue pour se ressourcer loin du bruit, cette suite offre la même exigence de confort et les mêmes finitions luxueuses en marbre Calacatta.",
    specs: ["Superficie : 40m²", "Lit King Size", "Environnement calme", "Marbre Calacatta", "Salle de bain privative"]
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

    // Légendes de la galerie photo, dans le MÊME ORDRE que le tableau `items`
    // du fichier @/routes/gallery.tsx
    gallery: {
      items: [
        "Piscine & Terrasse",
        "Cuisine Équipée",
        "Escalier",
        "Suite",
        "Piscine & Terrasse",
        "Terrasse",
        "Suite",
        "Terrasse",
        "Piscine & Terrasse",
        "Piscine & Terrasse",
        "Piscine & Terrasse",
        "Salon",
        "Salle de Bain",
        "Suite",
        "Cuisine & salon",
        "Suite",
        "Détails & Matières",
        "Suite",
        "Cuisine Équipée",
        "Dressing",
        "Suite",
      ],
    },
    
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
        { q: "La villa est-elle partagée avec d'autres clients ?", a: "Non. Dar B&B est louée exclusivement dans son intégralité. Vous bénéficiez d'un accès totalement privé à la maison, aux 4 suites, au jardin et à la piscine." },
        { q: "La villa est-elle accessible facilement ?", a: "Oui, la villa dispose d'un accès par ascenseur privatif et d'un parking privé sécurisé est inclus pour nos hôtes." },
        { q: "Quelle est la politique concernant le tabac et la musique ?", a: "La villa est strictement non-fumeur à l'intérieur. Pour préserver la quiétude des lieux, la musique extérieure est autorisée jusqu'à 23h." },
        
        { q: "Dois-je présenter une pièce d'identité ?", a: "Oui, une pièce d'identité en cours de validité est requise à votre arrivée pour l'enregistrement des hôtes." },
        { q: "Proposez-vous un service de transfert ?", a: "Oui, notre conciergerie se charge d'organiser vos transferts privés depuis les aéroports de Tunis-Carthage ou d'Enfidha sur simple demande." }
      ]
    },
    newsletter: {
      popup: {
        eyebrow:       "Offres exclusives",
        title:         "Restez au courant\ndes meilleures offres",
        subtitle:      "Recevez nos codes promo, séjours spéciaux et actualités de Dar B&B — directement dans votre boîte mail.",
        placeholder:   "votre@email.com",
        cta:           "S'abonner",
        privacy:       "Pas de spam. Désabonnement en un clic.",
        successTitle:  "Bienvenue !",
        successText:   "Vous êtes abonné(e) aux offres exclusives de Dar B&B.",
        errorInvalid:  "Adresse email invalide.",
        errorDuplicate:"Cette adresse est déjà abonnée.",
        close:         "Fermer",
      },
    },

    amenities: {
  title: "Ce que propose ce logement",
  categories: {
    kitchen: "Cuisine et salle à manger",
    comfort: "Confort et linge",
    entertainment: "Divertissement et travail",
    climate: "Climatisation et chauffage",
    outdoor: "Extérieur et piscine",
    safety: "Sécurité"
  },
  disclaimer: "Note : Des caméras de sécurité sont installées uniquement à l'extérieur (entrée, parking) pour assurer votre tranquillité. Aucune caméra à l'intérieur de la villa."
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
  { id: "suite-royale", t: "Royal Suite", d: "Luxury dressing and sea view." },
  { id: "suite-sunrise", t: "Sunrise Suite", d: "Facing the sunrise." },
  { id: "suite-chill-1", t: "Chill Suite I", d: "Quiet and Calacatta marble." },
  { id: "suite-chill-2", t: "Chill Suite II", d: "Privacy and serenity." },
],
      details: {
  "suite-royale": {
    title: "Royal Suite",
    tagline: "Luxury & Panoramic View",
    description: "The villa's centerpiece. Features a luxury walk-in closet with a glass watch display island, a majestic freestanding bathtub, and direct access to the panoramic balcony with stunning sea views.",
    specs: ["Size: 50sqm", "King Size bed", "Dressing with glass island", "Royal freestanding tub", "Panoramic balcony access"]
  },
  "suite-sunrise": {
    title: "Sunrise Suite",
    tagline: "Waking up to the Mediterranean",
    description: "East-facing to capture the first rays of sunlight. A bright, soothing suite sharing the panoramic balcony for unique moments of contemplation.",
    specs: ["Size: 45sqm", "King Size bed", "East orientation", "Panoramic balcony access", "Private bathroom"]
  },
  "suite-chill-1": {
    title: "Chill Suite I",
    tagline: "Nest of Tranquility",
    description: "An elegant, perfectly quiet interior suite. Featuring Calacatta marble finishes and king-size comfort for an absolute restful getaway.",
    specs: ["Size: 40sqm", "King Size bed", "Quiet environment", "Calacatta marble", "Private bathroom"]
  },
  "suite-chill-2": {
    title: "Chill Suite II",
    tagline: "Interior Serenity",
    description: "Designed to recharge away from the noise, this suite offers the same high standard of comfort and luxurious Calacatta marble finishes.",
    specs: ["Size: 40sqm", "King Size bed", "Quiet environment", "Calacatta marble", "Private bathroom"]
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

    // Gallery captions, in the SAME ORDER as the `items` array
    // in @/routes/gallery.tsx
    gallery: {
      items: [
        "Pool & Terrace",
        "Fitted Kitchen",
        "Staircase",
        "Suite",
        "Pool & Terrace",
        "Terrace",
        "Suite",
        "Terrace",
        "Pool & Terrace",
        "Pool & Terrace",
        "Pool & Terrace",
        "Living Room",
        "Bathroom",
        "Suite",
        "Kitchen & Living Room",
        "Suite",
        "Details & Materials",
        "Suite",
        "Fitted Kitchen",
        "Dressing Room",
        "Suite",
      ],
    },
    
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
        { q: "Is the villa shared with other guests?", a: "No. Dar B&B is rented strictly on an exclusive basis. You will enjoy complete, private access to the entire estate, its 4 suites, and the infinity pool." },
        { q: "Is the villa easily accessible?", a: "Yes, the villa features a private elevator for easy access, and private secure parking is included for our guests." },
        { q: "What is the policy on smoking and noise?", a: "The villa is strictly non-smoking indoors. To maintain the tranquility of the surroundings, outdoor music is allowed until 11:00 PM." },
        
        { q: "Do I need to present an ID?", a: "Yes, a valid ID is required upon arrival for guest registration." },
        { q: "Do you provide airport transfer services?", a: "Yes, our concierge team can easily arrange private transfers from either Tunis-Carthage or Enfidha airports upon request." }
      ]
    },

    newsletter: {
      popup: {
        eyebrow:       "Exclusive offers",
        title:         "Stay ahead of\nthe best deals",
        subtitle:      "Get our promo codes, special stays and Dar B&B news — straight to your inbox.",
        placeholder:   "your@email.com",
        cta:           "Subscribe",
        privacy:       "No spam. Unsubscribe anytime.",
        successTitle:  "Welcome!",
        successText:   "You are now subscribed to exclusive Dar B&B offers.",
        errorInvalid:  "Please enter a valid email address.",
        errorDuplicate:"This email is already subscribed.",
        close:         "Close",
      },
    },

    amenities: {
  title: "What this place offers",
  categories: {
    kitchen: "Kitchen & Dining",
    comfort: "Comfort & Bedding",
    entertainment: "Entertainment & Work",
    climate: "Air Conditioning & Heating",
    outdoor: "Outdoor & Pool",
    safety: "Safety"
  },
  disclaimer: "Note: Security cameras are installed outdoors only (entrance, parking) to ensure your privacy. No cameras inside the villa."
},

    footer: { rights: "All rights reserved", made: "Crafted with care in Hammamet", info: "Practical Information" },
  },
} as const;