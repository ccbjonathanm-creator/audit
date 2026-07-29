/* Audit d'automatisation — Moteur de calcul
   Entrée : les réponses au questionnaire.
   Sortie : temps perdu par poste, gains récupérables, score, pistes classées.

   Deux règles de conception :
   1. On ne mélange jamais le temps mesuré (solide) et l'opportunité
      commerciale (hypothétique). Deux compteurs séparés.
   2. Le résultat principal est une fourchette. Annoncer « 32 h 10 » sur une
      estimation est une fausse précision, et le client le sent. */

'use strict';

function calculer(r) {
  const fe = FACTEUR_EFFECTIF[r.effectif];
  const fa = FACTEUR_ATTENUE[r.effectif];

  /* Une heure administrative est valorisée au taux du client, mais plafonnée :
     ce n'est pas une heure de production. */
  const tauxAdmin = Math.min(r.taux, REALISME.plafondTauxAdmin);

  /* Effet de volume sur les devis : au delà d'une dizaine par mois, ils se
     ressemblent et le temps unitaire baisse forcément. */
  const economie = 1 - REALISME.economieVolumeDevis
    * Math.min(1, Math.max(0, r.nb_devis - 10) / 30);

  /* --- Temps passé aujourd'hui, en heures par mois --- */
  const detail = {
    devis: (r.nb_devis * r.temps_devis * economie) / 60,
    impayes: BAREME.impayes[r.impayes] * fa,
    planning: BAREME.planning[r.planning] * fe,
    suiviHeures: r.effectif === 'seul' ? 0 : BAREME.heures[r.heures] * fe,
    stock: BAREME.stock[r.stock] * fa,
    compta: BAREME.compta[r.compta] * fa
  };

  /* --- Regroupement par réponse possible ---
     Le planning et le suivi des heures relèvent du même outil : les compter
     séparément ferait passer la vraie priorité d'une équipe au second plan. */
  const postes = {
    devis: detail.devis,
    impayes: detail.impayes,
    chantiers: detail.planning + detail.suiviHeures,
    stock: detail.stock,
    compta: detail.compta
  };

  /* --- Part réellement récupérable --- */
  const gains = {};
  let brut = 0;
  for (const cle of Object.keys(postes)) {
    gains[cle] = postes[cle] * GAIN[cle];
    brut += gains[cle];
  }

  /* Plafond de réalisme lié à la taille de l'entreprise. S'il mord, on réduit
     tous les postes dans la même proportion pour rester cohérent. */
  const plafond = REALISME.plafondHeures[r.effectif];
  const heuresGagnees = Math.min(brut, plafond);
  if (heuresGagnees < brut) {
    const ratio = heuresGagnees / brut;
    for (const cle of Object.keys(gains)) gains[cle] *= ratio;
  }

  const heuresPerdues = Object.values(postes).reduce((a, b) => a + b, 0);

  /* Fourchette affichée : volontairement asymétrique vers le bas. */
  const basse = Math.max(1, Math.floor(heuresGagnees * 0.8));
  const haute = Math.ceil(heuresGagnees * 1.05);
  const fourchette = {
    basse, haute,
    heures: basse === haute ? `${basse} heures` : `${basse} à ${haute} heures`,
    eurosBas: basse * tauxAdmin,
    eurosHaut: haute * tauxAdmin
  };

  /* --- Opportunités, exprimées en chantiers et en appels, jamais en euros --- */
  const devisEnPlus = r.relance_devis === 'toujours'
    ? 0
    : Math.max(1, Math.round(r.nb_devis * HYPOTHESES.gainRelance));

  const appelsManques = Math.round(r.appels * HYPOTHESES.joursOuvres);
  const appelsClients = Math.round(appelsManques * HYPOTHESES.partAppelClient);
  const appelsRattrapes = Math.round(appelsClients * HYPOTHESES.partAppelRattrapee);

  const contexte = {
    detail, postes, gains, heuresPerdues, heuresGagnees, fourchette, tauxAdmin,
    plafondAtteint: heuresGagnees < brut,
    euros: heuresGagnees * tauxAdmin,
    devisEnPlus, appelsManques, appelsClients, appelsRattrapes
  };

  /* --- Score de maturité, de 0 à 100 --- *
     100 = déjà très outillé. On affiche la marge de progression, jamais une
     note humiliante : un artisan qui reçoit 12 sur 100 ferme l'application. */
  contexte.score = scoreMaturite(r);
  contexte.marge = 100 - contexte.score;

  /* --- Pistes retenues, classées par gain décroissant --- */
  const retenues = PISTES
    .filter((p) => p.seuil(contexte, r))
    .map((p) => ({
      ref: p,
      gainHeures: gains[p.id] || 0,
      gainEuros: (gains[p.id] || 0) * tauxAdmin,
      poids: poidsPiste(p, contexte, r)
    }))
    .sort((a, b) => b.poids - a.poids);

  contexte.pistes = retenues;
  contexte.top = retenues.slice(0, 3);
  return contexte;
}

/* Le poids sert au classement. Les postes chiffrables passent devant ;
   les opportunités commerciales reçoivent un poids forfaitaire pour ne pas
   écraser un gain de temps réellement mesuré. */
function poidsPiste(p, c, r) {
  if (p.id === 'relance_devis') return c.devisEnPlus * 60;
  if (p.id === 'appels') return c.appelsRattrapes * 55;
  if (p.id === 'clients') return r.clients === 'platefo' ? 190 : 130;
  return (c.gains[p.id] || 0) * c.tauxAdmin;
}

/* Maturité : chaque réponse d'outillage vaut des points. */
function scoreMaturite(r) {
  const points = [
    valeurParmi(r.planning, { tete: 0, papier: 25, excel: 45, agenda: 70, logiciel: 100 }),
    r.effectif === 'seul'
      ? null
      : valeurParmi(r.heures, { aucun: 0, papier: 25, excel: 55, logiciel: 100 }),
    valeurParmi(r.stock, { aucun: 0, papier: 25, excel: 60, logiciel: 100 }),
    valeurParmi(r.compta, { sac: 0, photos: 40, classeur: 55, logiciel: 100 }),
    valeurParmi(r.relance_devis, { jamais: 0, parfois: 45, toujours: 100 }),
    valeurParmi(r.clients, { bouche: 20, platefo: 35, google: 65, site: 100 }),
    tempsDevisEnPoints(r.temps_devis)
  ].filter((v) => v !== null);

  const moyenne = points.reduce((a, b) => a + b, 0) / points.length;
  return Math.round(moyenne);
}

function tempsDevisEnPoints(minutes) {
  if (minutes <= 15) return 100;
  if (minutes <= 35) return 65;
  if (minutes <= 60) return 35;
  return 10;
}

function valeurParmi(cle, table) {
  return Object.prototype.hasOwnProperty.call(table, cle) ? table[cle] : 50;
}

/* Libellé du score, formulé pour donner envie d'agir et non pour blesser. */
function libelleScore(score) {
  if (score >= 75) return { titre: 'Vous êtes déjà bien organisé', sous: 'Les gains restants sont ciblés, mais ils existent, et ce sont souvent les plus rentables.' };
  if (score >= 50) return { titre: 'Vous êtes à mi-chemin', sous: 'Les bases sont là. Ce qui suit montre les tâches qui peuvent encore disparaître de vos semaines.' };
  if (score >= 25) return { titre: 'Beaucoup de choses reposent encore sur vous', sous: 'C’est la situation la plus courante chez les artisans, et celle où chaque changement rapporte le plus.' };
  return { titre: 'Tout repose sur votre mémoire et vos soirées', sous: 'La bonne nouvelle : c’est chez les entreprises comme la vôtre que les premiers changements se voient le plus vite.' };
}
