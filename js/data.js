/* Audit d'automatisation — Données et barème
   Toutes les valeurs de temps sont en HEURES PAR MOIS.
   Les hypothèses sont volontairement prudentes et affichées au client. */

'use strict';

/* ------------------------------------------------------------------ *
 * 1. QUESTIONNAIRE
 * ------------------------------------------------------------------ */

const QUESTIONS = [
  {
    id: 'metier',
    icone: 'metier',
    titre: 'Quel est votre métier ?',
    aide: 'Pour adapter les exemples à votre quotidien.',
    options: [
      { v: 'plombier', label: 'Plomberie, chauffage' },
      { v: 'electricien', label: 'Électricité' },
      { v: 'macon', label: 'Maçonnerie, gros œuvre' },
      { v: 'peintre', label: 'Peinture, revêtements' },
      { v: 'menuisier', label: 'Menuiserie, agencement' },
      { v: 'couvreur', label: 'Couverture, charpente' },
      { v: 'carreleur', label: 'Carrelage, sols' },
      { v: 'multi', label: 'Multi-services, rénovation' },
      { v: 'autre', label: 'Un autre métier du bâtiment' }
    ]
  },
  {
    id: 'effectif',
    icone: 'equipe',
    titre: 'Combien êtes-vous dans l’entreprise ?',
    aide: 'Vous compris, salariés et apprentis.',
    options: [
      { v: 'seul', label: 'Je travaille seul', note: 'Artisan indépendant' },
      { v: 'petit', label: '2 à 3 personnes' },
      { v: 'moyen', label: '4 à 9 personnes' },
      { v: 'grand', label: '10 personnes ou plus' }
    ]
  },
  {
    id: 'taux',
    icone: 'euro',
    titre: 'Combien vaut une heure de votre temps ?',
    aide: 'Votre taux horaire facturé au client, pas votre salaire. C’est ce qui sert à chiffrer le temps perdu.',
    options: [
      { v: 35, label: 'Environ 35 €' },
      { v: 45, label: 'Environ 45 €', note: 'Le plus fréquent' },
      { v: 60, label: 'Environ 60 €' },
      { v: 80, label: '80 € ou plus' }
    ]
  },
  {
    id: 'nb_devis',
    icone: 'devis',
    titre: 'Combien de devis sortez-vous par mois ?',
    aide: 'Une estimation suffit.',
    options: [
      { v: 3, label: 'Moins de 5' },
      { v: 10, label: 'Entre 5 et 15' },
      { v: 22, label: 'Entre 15 et 30' },
      { v: 40, label: 'Plus de 30' }
    ]
  },
  {
    id: 'temps_devis',
    icone: 'chrono',
    titre: 'Combien de temps pour sortir un devis ?',
    aide: 'Du relevé des mesures jusqu’à l’envoi au client, le soir compris.',
    options: [
      { v: 15, label: 'Moins de 15 minutes', note: 'Vous êtes déjà bien outillé' },
      { v: 35, label: 'Environ une demi-heure' },
      { v: 60, label: 'Environ une heure' },
      { v: 90, label: 'Plus d’une heure' }
    ]
  },
  {
    id: 'relance_devis',
    icone: 'relance',
    titre: 'Relancez-vous les devis sans réponse ?',
    aide: 'Un devis sans réponse n’est pas un refus, c’est souvent un client qui a oublié.',
    options: [
      { v: 'jamais', label: 'Jamais, je passe à autre chose' },
      { v: 'parfois', label: 'Quand j’y pense' },
      { v: 'toujours', label: 'Systématiquement, c’est un réflexe' }
    ]
  },
  {
    id: 'impayes',
    icone: 'facture',
    titre: 'Vos factures sont-elles payées en retard ?',
    aide: 'Et si oui, combien de temps passez-vous à courir après ?',
    options: [
      { v: 'rare', label: 'Rarement, mes clients payent bien' },
      { v: 'souvent', label: 'Souvent, je dois relancer' },
      { v: 'toujours', label: 'Très souvent, c’est une bataille' }
    ]
  },
  {
    id: 'appels',
    icone: 'telephone',
    titre: 'Combien d’appels ratez-vous par jour ?',
    aide: 'Quand vous avez les mains prises sur le chantier.',
    options: [
      { v: 0.5, label: 'Presque aucun' },
      { v: 2.5, label: 'Deux à quatre' },
      { v: 6, label: 'Cinq ou plus', note: 'Le téléphone sonne sans arrêt' }
    ]
  },
  {
    id: 'planning',
    icone: 'planning',
    titre: 'Comment organisez-vous les chantiers ?',
    aide: 'Qui va où, quel jour.',
    options: [
      { v: 'tete', label: 'Dans ma tête, au téléphone' },
      { v: 'papier', label: 'Sur un carnet ou un tableau' },
      { v: 'excel', label: 'Dans un fichier Excel' },
      { v: 'agenda', label: 'Un agenda partagé' },
      { v: 'logiciel', label: 'Un logiciel de planning' }
    ]
  },
  {
    id: 'heures',
    icone: 'heures',
    titre: 'Comment suivez-vous les heures ?',
    aide: 'Les heures passées par chantier et par personne.',
    options: [
      { v: 'aucun', label: 'Je ne les suis pas vraiment' },
      { v: 'papier', label: 'Fiches papier, recopiées ensuite' },
      { v: 'excel', label: 'Un tableur' },
      { v: 'logiciel', label: 'Un logiciel dédié' }
    ]
  },
  {
    id: 'stock',
    icone: 'stock',
    titre: 'Comment gérez-vous le matériel ?',
    aide: 'Le stock du camion et du dépôt.',
    options: [
      { v: 'aucun', label: 'Aucun suivi, j’achète au besoin' },
      { v: 'papier', label: 'De tête ou sur papier' },
      { v: 'excel', label: 'Un tableur' },
      { v: 'logiciel', label: 'Un logiciel de stock' }
    ]
  },
  {
    id: 'compta',
    icone: 'compta',
    titre: 'Comment transmettez-vous vos justificatifs ?',
    aide: 'Les factures d’achat, les tickets, les notes de frais.',
    options: [
      { v: 'sac', label: 'Une boîte à chaussures en fin de trimestre' },
      { v: 'photos', label: 'Je prends des photos au fur et à mesure' },
      { v: 'classeur', label: 'Un classeur rangé chaque semaine' },
      { v: 'logiciel', label: 'Un outil connecté à mon comptable' }
    ]
  },
  {
    id: 'clients',
    icone: 'client',
    titre: 'D’où viennent vos clients ?',
    aide: 'La source principale.',
    options: [
      { v: 'bouche', label: 'Le bouche-à-oreille, uniquement' },
      { v: 'google', label: 'Ma fiche Google' },
      { v: 'site', label: 'Mon site internet' },
      { v: 'platefo', label: 'Des plateformes qui prennent une commission' }
    ]
  }
];

/* ------------------------------------------------------------------ *
 * 2. BARÈME
 * Heures perdues par mois, avant automatisation.
 * ------------------------------------------------------------------ */

/* Multiplicateur d'effectif : plus il y a de monde, plus la coordination coûte. */
const FACTEUR_EFFECTIF = { seul: 0.6, petit: 1, moyen: 1.7, grand: 2.6 };

/* Multiplicateur atténué, pour les tâches qui ne grossissent pas avec l'équipe. */
const FACTEUR_ATTENUE = { seul: 0.8, petit: 1, moyen: 1.3, grand: 1.7 };

const BAREME = {
  planning: { tete: 2.5, papier: 2, excel: 3, agenda: 1.5, logiciel: 0.5 },
  heures: { aucun: 1.5, papier: 3, excel: 3.5, logiciel: 0.5 },
  stock: { aucun: 3.5, papier: 2.5, excel: 2, logiciel: 0.8 },
  compta: { sac: 4.5, photos: 2.5, classeur: 3, logiciel: 0.8 },
  impayes: { rare: 0.5, souvent: 2.5, toujours: 5 }
};

/* Part du temps qui peut réellement être supprimée par un outil.
   Volontairement en dessous des promesses du marché : mieux vaut un chiffre
   que le client reconnaît qu'un chiffre spectaculaire qu'il ne croit pas. */
const GAIN = {
  devis: 0.35,
  impayes: 0.7,
  chantiers: 0.55,
  stock: 0.4,
  compta: 0.6
};

/* Garde-fous de réalisme. Sans eux, une grosse entreprise très manuelle
   produit un total spectaculaire, donc invendable : le client n'y croit pas. */
const REALISME = {
  /* Une heure de paperasse ne vaut pas une heure de production. On la valorise
     au taux du client, mais sans dépasser ce plafond. */
  plafondTauxAdmin: 60,
  /* Au delà d'une dizaine de devis par mois, ils se ressemblent : on a forcément
     des modèles, et le temps unitaire baisse. Réduction maximale appliquée. */
  economieVolumeDevis: 0.3,
  /* Temps récupérable maximal par mois, selon la taille. Une personne ne peut
     pas récupérer plus d'heures administratives qu'elle n'en fait. */
  plafondHeures: { seul: 18, petit: 26, moyen: 34, grand: 45 }
};

/* Hypothèses affichées au client dans le rapport. */
const HYPOTHESES = {
  joursOuvres: 21,
  /* Part des devis relancés qui se signent en plus. Estimation basse. */
  gainRelance: 0.08,
  /* Part des appels manqués qui étaient un client potentiel. */
  partAppelClient: 0.25,
  /* Part de ces appels qu'un accueil automatisé rattrape. */
  partAppelRattrapee: 0.6
};

/* ------------------------------------------------------------------ *
 * 3. CATALOGUE DES RÉPONSES
 * ------------------------------------------------------------------ */

const OFFRES = {
  fichegoogle: {
    nom: 'Votre fiche Google Business',
    type: 'Prestation',
    prix: '99 € une fois',
    icone: null,
    icone3d: 'client',
    lien: 'https://generationapp.fr/services/fiche-google-business/',
    quoi: 'La fiche que les gens voient en premier quand ils cherchent votre métier dans votre ville : remplie, photos, horaires, avis.'
  },
  site: {
    nom: 'Un site internet qui fait appeler',
    type: 'Prestation',
    prix: 'dès 299 €',
    icone: null,
    icone3d: 'site',
    lien: 'https://generationapp.fr/mon-site/',
    quoi: 'Un site rapide et clair, avec le bouton d’appel toujours visible, pensé pour un artisan et pas pour un concours de design.'
  },
  surmesure: {
    nom: 'Une automatisation sur mesure',
    type: 'Étude puis abonnement',
    prix: 'à chiffrer ensemble',
    icone: null,
    icone3d: 'surmesure',
    /* Cette offre n'a pas de page produit, puisqu'elle se chiffre au cas par
       cas. Elle DOIT quand meme mener quelque part : sans lien, le rapport
       affichait un bouton mort sur cinq pistes sur huit. */
    lien: 'https://generationapp.fr/contact/',
    quoi: 'On part de votre façon de travailler et on automatise la tâche précise qui vous coûte le plus cher, avec ou sans intelligence artificielle.'
  }
};

/* ------------------------------------------------------------------ *
 * 4. PISTES
 * Chaque piste sait se déclencher, se chiffrer et se vendre.
 * ------------------------------------------------------------------ */

const PISTES = [
  {
    id: 'devis',
    promesse: 'On construit votre bibliothèque de prestations et votre circuit de devis, adaptés à votre façon de chiffrer. Vous gardez la main, la machine fait la mise en page et la rédaction.',
    axe: 'Les devis',
    icone: 'devis',
    ia: true,
    titreCourt: 'Sortir vos devis deux fois plus vite',
    constat: (r, c) => `Vous passez environ ${fmtH(c.detail.devis)} par mois à rédiger des devis, soit ${fmtEuro(c.detail.devis * c.tauxAdmin)} de votre temps.`,
    solution: 'Imaginez le même devis composé en dix minutes depuis le camion : votre bibliothèque de prestations, vos prix, une mise en page impeccable à chaque fois. L’intelligence artificielle rédige le descriptif des travaux à partir de trois mots et de vos photos. Le client reçoit son devis le soir même, avant vos concurrents.',
    offres: ['surmesure'],
    seuil: (c) => c.detail.devis >= 3
  },
  {
    id: 'relance_devis',
    promesse: 'On met en place vos relances automatiques, écrites avec vos mots à vous, branchées sur votre façon d’envoyer les devis.',
    axe: 'Les devis sans réponse',
    icone: 'relance',
    ia: false,
    titreCourt: 'Ne plus laisser un devis mourir',
    constat: (r, c) => `Vous envoyez environ ${r.nb_devis} devis par mois et vous ne relancez ${r.relance_devis === 'jamais' ? 'jamais' : 'que quand vous y pensez'}. Une relance simple à sept jours ferait signer environ ${c.devisEnPlus} chantier${c.devisEnPlus > 1 ? 's' : ''} de plus par mois.`,
    solution: 'Pendant que vous êtes sur le chantier, une relance polie part toute seule à sept jours, puis à quinze. Vous ne faites rien : vous recevez seulement les réponses, et les signatures qui seraient parties chez un concurrent.',
    offres: ['surmesure'],
    seuil: (c, r) => r.relance_devis !== 'toujours' && r.nb_devis >= 5
  },
  {
    id: 'impayes',
    promesse: 'On installe vos rappels de règlement, branchés sur votre facturation actuelle. Rien à changer dans vos habitudes.',
    axe: 'Les impayés',
    icone: 'facture',
    ia: false,
    titreCourt: 'Arrêter de courir après l’argent',
    constat: (r, c) => `Courir après les règlements vous prend environ ${fmtH(c.detail.impayes)} par mois, soit ${fmtEuro(c.detail.impayes * c.tauxAdmin)}.`,
    solution: 'À partir de maintenant, c’est le rappel automatique qui joue le mauvais rôle : la veille de l’échéance, puis à trois et à dix jours de retard. Le ton monte tout seul, vous restez le gentil, et vous gardez la main pour arrêter la séquence à tout moment.',
    offres: ['surmesure'],
    seuil: (c) => c.detail.impayes >= 1.5
  },
  {
    id: 'appels',
    promesse: 'On met en place votre accueil téléphonique intelligent, qui parle comme vous et vous transmet chaque demande par message.',
    axe: 'Les appels manqués',
    icone: 'telephone',
    ia: true,
    titreCourt: 'Ne plus perdre un client parce que vous étiez sous un évier',
    constat: (r, c) => `Vous ratez environ ${Math.round(r.appels * HYPOTHESES.joursOuvres)} appels par mois. En comptant large, ${c.appelsClients} étaient des clients potentiels, et la plupart appellent le concurrent suivant.`,
    solution: 'Un accueil automatique qui répond en votre nom, note la demande, l’adresse et le besoin, puis vous envoie la fiche par message. Vous rappelez le soir en sachant déjà de quoi il s’agit. C’est ici que l’intelligence artificielle sert vraiment.',
    offres: ['surmesure'],
    seuil: (c, r) => r.appels >= 2
  },
  {
    /* Le planning et les heures sont volontairement traités ensemble : c'est le
       même geste quotidien, et la même réponse. Les séparer ferait passer à côté
       du poste le plus lourd d'une équipe. */
    id: 'chantiers',
    promesse: 'On met en place votre planning partagé et le pointage des heures par chantier, sur le téléphone de chacun, adaptés à la taille de votre équipe.',
    axe: 'Le pilotage des chantiers',
    icone: 'planning',
    ia: false,
    titreCourt: 'Un planning et des heures que toute l’équipe voit',
    constat: (r, c) => {
      const org = `Organiser qui va où, puis saisir et recopier les heures, vous prend environ ${fmtH(c.detail.planning + c.detail.suiviHeures)} par mois`;
      if (r.heures === 'aucun' && r.effectif !== 'seul') {
        return org + '. Et comme les heures ne sont pas suivies par chantier, vous ne savez pas lesquels vous rapportent vraiment.';
      }
      return org + ', sans compter les appels pour rattraper les malentendus.';
    },
    solution: 'Visualisez votre semaine : le planning est sur le téléphone de chacun, un changement se voit immédiatement par toute l’équipe, et le pointage se range tout seul par chantier. Fini les « tu étais où mardi ? ». Vous voyez enfin, chiffres à l’appui, quels chantiers vous rapportent et lesquels vous coûtent.',
    offres: ['surmesure'],
    seuil: (c) => c.postes.chantiers >= 2
  },
  {
    id: 'stock',
    promesse: 'On installe un inventaire à la voix avec un seuil d’alerte par référence, à partir de votre liste de pièces actuelle.',
    axe: 'Le matériel',
    icone: 'stock',
    ia: false,
    titreCourt: 'Moins d’allers-retours au fournisseur',
    constat: (r, c) => `Le matériel manquant vous coûte environ ${fmtH(c.detail.stock)} par mois en allers-retours et en recherches, soit ${fmtEuro(c.detail.stock * c.tauxAdmin)}.`,
    solution: 'Un inventaire qui se compte à la voix, les mains libres, et un seuil d’alerte par référence pour commander avant d’être à sec.',
    offres: ['surmesure'],
    seuil: (c) => c.detail.stock >= 2
  },
  {
    id: 'compta',
    promesse: 'On automatise la lecture et le classement de vos justificatifs, du ticket photographié jusqu’au dossier remis à votre comptable.',
    axe: 'La comptabilité',
    icone: 'compta',
    ia: true,
    titreCourt: 'La fin de la boîte à chaussures',
    constat: (r, c) => `Rassembler et trier vos justificatifs vous prend environ ${fmtH(c.detail.compta)} par mois, souvent le week-end.`,
    solution: 'Vous photographiez le ticket au moment de l’achat, et c’est terminé : il est lu, classé et rangé au bon endroit tout seul. Votre comptable reçoit un dossier complet sans vous relancer, et vos dimanches redeviennent des dimanches.',
    offres: ['surmesure'],
    seuil: (c) => c.detail.compta >= 2
  },
  {
    id: 'clients',
    axe: 'Trouver des clients',
    icone: 'client',
    ia: false,
    titreCourt: 'Ne plus dépendre que du bouche-à-oreille',
    constat: (r) => r.clients === 'platefo'
      ? 'Vos clients viennent de plateformes qui prennent une commission sur chaque chantier. Vous payez pour des clients qui devraient être les vôtres.'
      : 'Vos clients viennent presque tous du bouche-à-oreille. C’est solide, mais cela ne se pilote pas : les mois creux, vous n’avez aucun levier.',
    solution: 'Le jour où quelqu’un tape votre métier et votre ville dans Google, c’est vous qu’il trouve : une fiche soignée et un site simple qui répond aux questions que les gens se posent vraiment, avec le bouton d’appel toujours sous le pouce. Vos clients viennent à vous, sans commission au passage.',
    /* La solution parle d'une « fiche soignée » AVANT le site : l'offre la
       moins chere et la plus rapide doit donc arriver en premier. */
    offres: ['fichegoogle', 'site'],
    seuil: (c, r) => r.clients === 'bouche' || r.clients === 'platefo'
  }
];

/* Ce qu'il ne faut PAS acheter. Une piste d'honnêteté, volontairement. */
const CONTRE_PISTE = {
  titre: 'Et ce sur quoi vous n’avez rien à dépenser',
  texte: 'La facturation électronique devient obligatoire, et beaucoup vont essayer de vous vendre un logiciel pour cela. Ce n’est pas nécessaire : plusieurs outils agréés par l’État le font gratuitement pour une petite entreprise. Nous ne vous vendrons pas ce que vous pouvez obtenir sans payer.'
};

/* ------------------------------------------------------------------ *
 * Utilitaires de formatage
 * ------------------------------------------------------------------ */

/* Une estimation ne s'affiche jamais à la minute près : on arrondit au quart
   d'heure. Une fausse précision décrédibilise tout le reste du rapport. */
function fmtH(h) {
  const q = Math.round(h * 4) / 4;
  if (q < 1) return Math.round(q * 60) + ' minutes';
  const ent = Math.floor(q);
  const min = Math.round((q - ent) * 60);
  if (min === 0) return ent + (ent > 1 ? ' heures' : ' heure');
  return ent + ' h ' + min;
}

/* Les euros sont arrondis à la dizaine, et à la centaine au delà de mille. */
function fmtEuro(v) {
  const pas = v >= 1000 ? 100 : 10;
  const arrondi = Math.round(v / pas) * pas;
  return arrondi.toLocaleString('fr-FR') + ' €';
}
