/* Audit d'automatisation — Icônes 3D
   Icônes bitmap premium (PNG 512 × 512, fond transparent) rangées dans
   icones/3d/. Rendues via une balise img dimensionnée : le fichier source est
   net sur tous les écrans, y compris Retina. */

'use strict';

const ICONES_3D = [
  'metier', 'equipe', 'euro', 'devis', 'chrono', 'relance', 'facture',
  'telephone', 'planning', 'heures', 'stock', 'compta', 'client',
  'surmesure', 'site', 'eclair', 'bouclier'
];

/* Construit une icône 3D. taille en pixels affichés. */
function icone3d(nom, taille) {
  const fichier = ICONES_3D.includes(nom) ? nom : 'eclair';
  const t = taille || 64;
  return `<img class="ic3d" src="icones/3d/${fichier}.png" width="${t}" height="${t}" alt="" decoding="async">`;
}
