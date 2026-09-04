/* Audit d'automatisation — Service worker
   Cache applicatif simple : l'audit doit s'ouvrir même avec une mauvaise
   connexion sur un chantier. */

const CACHE = 'audit-v4';

const COQUILLE = [
  './',
  'index.html',
  'css/style.css',
  'js/data.js',
  'js/icones.js',
  'js/moteur.js',
  'js/app.js',
  'manifest.webmanifest',
  'icones/clicchantier.png',
  'icones/inventaire-pro.png',
  'icones/radar-google.png',
  'icones/3d/metier.png',
  'icones/3d/equipe.png',
  'icones/3d/euro.png',
  'icones/3d/devis.png',
  'icones/3d/chrono.png',
  'icones/3d/relance.png',
  'icones/3d/facture.png',
  'icones/3d/telephone.png',
  'icones/3d/planning.png',
  'icones/3d/heures.png',
  'icones/3d/stock.png',
  'icones/3d/compta.png',
  'icones/3d/client.png',
  'icones/3d/surmesure.png',
  'icones/3d/site.png',
  'icones/3d/eclair.png',
  'icones/3d/bouclier.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(COQUILLE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Réseau d'abord, cache en filet.
   Le cache d'abord serait plus rapide, mais un prospect qui a déjà ouvert
   l'audit ne recevrait plus jamais nos corrections. Sur un questionnaire
   commercial que l'on ajuste souvent, c'est inacceptable. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then((reseau) => {
        const copie = reseau.clone();
        caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => {});
        return reseau;
      })
      .catch(() => caches.match(req).then((rep) => rep || caches.match('index.html')))
  );
});
