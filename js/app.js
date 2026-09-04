/* Audit d'automatisation — Pilotage de l'interface */

'use strict';

const CONFIG = {
  /* Point de collecte des demandes de rapport (Worker audit-leads). En cas de
     panne, l'application bascule automatiquement sur un envoi par messagerie. */
  endpoint: 'https://audit-leads.contactweb71.workers.dev',
  emailContact: 'contact@generationapp.fr',
  telephone: null,
  version: 'v1'
};

const scene = document.getElementById('scene');
const etat = { index: 0, reponses: {}, resultat: null };

/* ------------------------------------------------------------------ *
 * Rendu
 * ------------------------------------------------------------------ */

function rendre(html) {
  scene.innerHTML = html;
  window.scrollTo(0, 0);
}

function enTeteMarque() {
  return `<div class="marque"><span class="pastille"></span>Génération App</div>`;
}

/* ---------- Écran d'accueil ---------- */

function ecranAccueil() {
  rendre(`
    ${enTeteMarque()}
    <section class="accueil">
      <div class="visuel">
        ${icone3d('chrono', 62)}${icone3d('eclair', 62)}${icone3d('euro', 62)}
      </div>
      <h1>Chaque mois, votre paperasse vous coûte l’équivalent de plusieurs journées de chantier. Combien, chez vous&nbsp;?</h1>
      <p class="chapo">Répondez à 13 questions sur votre quotidien, en 2 minutes. Vous découvrez immédiatement votre chiffre, en heures et en euros, calculé sur votre situation réelle, et les 3 actions qui vous rendront ce temps.</p>
      <ul class="atouts">
        <li><span class="coche">✓</span><span>Votre chiffrage à partir de <b>vos</b> réponses, pas d’une brochure</span></li>
        <li><span class="coche">✓</span><span>Des solutions concrètes, avec ou sans intelligence artificielle</span></li>
        <li><span class="coche">✓</span><span>Gratuit, sans compte, sans carte bancaire, sans engagement</span></li>
      </ul>
      <button class="bouton" id="go">Je découvre ce que je perds</button>
      <p class="mini" style="text-align:center;margin-top:14px">Vos réponses restent sur votre téléphone tant que vous ne demandez rien.</p>
    </section>
  `);
  document.getElementById('go').onclick = () => { etat.index = 0; ecranQuestion(); };
}

/* ---------- Écran de question ---------- */

function ecranQuestion() {
  const q = QUESTIONS[etat.index];
  const total = QUESTIONS.length;
  const pct = Math.round((etat.index / total) * 100);
  const dejaChoisi = etat.reponses[q.id];

  rendre(`
    <div class="entete-q">
      ${etat.index > 0 ? '<button class="retour" id="prec" aria-label="Question précédente">←</button>' : ''}
      <div class="progression">
        <div class="barre"><span style="width:${pct}%"></span></div>
        <div class="compteur">${total - etat.index <= 4
          ? 'Plus que ' + (total - etat.index) + ' question' + (total - etat.index > 1 ? 's' : '') + ', votre chiffre arrive'
          : 'Question ' + (etat.index + 1) + ' sur ' + total}</div>
      </div>
    </div>
    <section class="question">
      <div class="tete">
        ${icone3d(q.icone, 52)}
        <div><h2>${q.titre}</h2></div>
      </div>
      <p class="aide">${q.aide}</p>
      <ul class="choix">
        ${q.options.map((o, i) => `
          <li><button data-v="${i}" class="${String(dejaChoisi) === String(o.v) ? 'actif' : ''}">
            <span class="puce"></span>
            <span class="txt">
              <span class="lab">${o.label}</span>
              ${o.note ? `<span class="note">${o.note}</span>` : ''}
            </span>
          </button></li>`).join('')}
      </ul>
    </section>
  `);

  const prec = document.getElementById('prec');
  if (prec) prec.onclick = () => { etat.index--; ecranQuestion(); };

  scene.querySelectorAll('.choix button').forEach((b) => {
    b.onclick = () => {
      const opt = q.options[Number(b.dataset.v)];
      etat.reponses[q.id] = opt.v;
      scene.querySelectorAll('.choix button').forEach((x) => x.classList.remove('actif'));
      b.classList.add('actif');
      setTimeout(() => {
        if (etat.index < QUESTIONS.length - 1) { etat.index++; ecranQuestion(); }
        else ecranCalcul();
      }, 170);
    };
  });
}

/* ---------- Écran de calcul ---------- */

function ecranCalcul() {
  const etapes = [
    'Lecture de vos réponses…',
    'Chiffrage du temps passé…',
    'Comparaison avec des entreprises de votre taille…',
    'Sélection des pistes les plus rentables…'
  ];
  rendre(`
    ${enTeteMarque()}
    <section class="calcul">
      <div class="rotor"><i></i></div>
      <h2>Nous calculons votre audit</h2>
      <p class="etape-calcul" id="etape">${etapes[0]}</p>
    </section>
  `);

  let i = 0;
  const cible = document.getElementById('etape');
  const minuteur = setInterval(() => {
    i++;
    if (i < etapes.length) { if (cible) cible.textContent = etapes[i]; }
    else {
      clearInterval(minuteur);
      etat.resultat = calculer(etat.reponses);
      ecranResultat();
    }
  }, 550);
}

/* ---------- Écran de résultat ---------- */

function ecranResultat() {
  const r = etat.reponses;
  const c = etat.resultat;
  const lib = libelleScore(c.score);

  /* Exprimé en semaines : plus parlant, et moins invraisemblable qu'un
     nombre de jours qui donne l'impression d'une promesse gonflée. */
  const semainesParAn = Math.round((c.fourchette.basse * 12) / 35);

  rendre(`
    ${enTeteMarque()}
    <section class="resultat">

      <div class="bilan">
        <p class="eyebrow">Votre audit</p>
        <h2>${lib.titre}</h2>
        <p class="sous">${lib.sous}</p>
        <div class="jauge">
          <div class="rail"><span id="rail"></span></div>
          <div class="leg"><span>Tout à la main</span><span>Entièrement outillé</span></div>
        </div>
      </div>

      <div class="chiffres">
        <div class="chiffre">
          <div class="v teal">${c.fourchette.heures}</div>
          <div class="l">récupérables chaque mois, au bas mot</div>
        </div>
        <div class="chiffre">
          <div class="v">${fmtEuro(c.fourchette.eurosBas)}</div>
          <div class="l">de votre temps par mois, au prix où vous le facturez</div>
        </div>
        <div class="chiffre large">
          <div class="v">${semainesParAn} semaine${semainesParAn > 1 ? 's' : ''} de travail par an</div>
          <div class="l">C’est ce que représente la fourchette basse sur douze mois. Et tant que rien ne change, ce compteur repart de zéro chaque mois. La bonne nouvelle : chacune de ces heures est identifiée ci-dessous, avec la solution en face.</div>
        </div>
      </div>

      ${c.top.length === 0 ? blocRienAFaire() : `
        <div class="section-titre">${c.top.length > 1 ? 'Vos ' + (c.top.length === 3 ? 'trois' : 'deux') + ' priorités' : 'Votre priorité'}</div>
        ${c.top.map((p, i) => carteePiste(p, i + 1, r, c)).join('')}`}

      ${c.pistes.length > 3 ? `
        <div class="section-titre">Le reste, à traiter ensuite</div>
        <div class="reste">
          ${c.pistes.slice(3).map((p) => `
            <div class="ligne">${icone3d(p.ref.icone, 34)}<span><b>${p.ref.axe}</b> — ${p.ref.titreCourt.toLowerCase()}</span></div>
          `).join('')}
        </div>` : ''}

      <div class="honnete">
        <h3>${CONTRE_PISTE.titre}</h3>
        <p>${CONTRE_PISTE.texte}</p>
      </div>

      <details class="methode">
        <summary>Comment ces chiffres sont calculés</summary>
        <div class="corps">
          <p>Aucun chiffre n’est inventé, tous viennent de vos réponses. Les hypothèses sont volontairement basses.</p>
          <ul>
            <li>Un mois compte ${HYPOTHESES.joursOuvres} jours travaillés.</li>
            <li>On ne compte comme récupérable qu’une partie du temps de chaque tâche : ${Math.round(GAIN.devis * 100)} % sur les devis, ${Math.round(GAIN.chantiers * 100)} % sur le pilotage des chantiers, ${Math.round(GAIN.compta * 100)} % sur les justificatifs. Le reste demandera toujours votre présence.</li>
            <li>Le résultat est donné en fourchette, et la fourchette basse retire encore 20 %. Le temps est valorisé à ${r.taux} € de l’heure, le taux que vous avez indiqué.</li>
            <li>Les chantiers et les appels gagnés sont comptés à part, car ce sont des estimations commerciales et non du temps mesuré.</li>
          </ul>
        </div>
      </details>

      <div class="cta">
        <h2>Et si, le mois prochain, ces ${fmtEuro(c.fourchette.eurosBas)} restaient dans votre poche&nbsp;?</h2>
        <p>Recevez votre rapport détaillé par courriel, avec le chiffrage poste par poste et par quoi commencer. Puis, quand vous serez prêt, quinze minutes au téléphone suffisent pour voir ce qui est réalisable chez vous. Vous repartez avec des réponses claires, pas avec un engagement.</p>
        <div class="duo">
          <button class="bouton" id="lead">Je reçois mon rapport détaillé</button>
          <button class="bouton secondaire" id="imprimer">J’enregistre mes résultats en PDF</button>
        </div>
        <p class="mini" style="color:#8FB6D4;margin:12px 0 0;text-align:center">Rapport gratuit, sous 24 heures. Pas de démarchage répété : un rapport, un échange si vous le demandez, c’est tout.</p>
      </div>

      <p class="mini" style="margin-top:22px;text-align:center">
        Audit réalisé par Génération App, ${CONFIG.emailContact}<br>
        Les estimations n’ont pas valeur d’engagement contractuel.
      </p>
    </section>
  `);

  /* setTimeout et non requestAnimationFrame : ce dernier ne se déclenche pas
     quand l'onglet n'est pas au premier plan, et la jauge resterait vide. */
  setTimeout(() => {
    const rail = document.getElementById('rail');
    if (rail) rail.style.width = Math.max(4, c.score) + '%';
  }, 60);

  document.getElementById('lead').onclick = ecranFormulaire;
  document.getElementById('imprimer').onclick = () => window.print();
}

/* Aucun poste ne dépasse son seuil : l'entreprise est déjà bien équipée.
   On le dit franchement plutôt que d'inventer un problème pour vendre. */
function blocRienAFaire() {
  const o = OFFRES.surmesure;
  return `
    <div class="section-titre">Notre lecture</div>
    <article class="piste">
      <div class="haut">
        ${icone3d('bouclier', 46)}
        <div>
          <div class="axe">Rien d’urgent</div>
          <h3>Vous êtes mieux équipé que la plupart des entreprises que nous auditons</h3>
        </div>
      </div>
      <p class="solution">Aucun de vos postes ne présente de perte de temps assez importante pour justifier un changement d’outil. Nous n’allons donc rien vous vendre sur cette base.</p>
      <p class="solution">Chez une entreprise à ce niveau, les gains suivants ne viennent plus des outils du marché, mais d’une automatisation taillée sur votre façon de travailler précisément : relier entre eux les outils que vous avez déjà, supprimer les doubles saisies qui restent, ou confier à une intelligence artificielle une tâche répétitive qui vous est propre.</p>
      <a class="offre" href="${o.lien}" target="_blank" rel="noopener">
        ${icone3d(o.icone3d || 'surmesure', 46)}
        <span class="txt">
          <span class="n">${o.nom}</span>
          <span class="d">${o.quoi}</span>
          <span class="p">${o.type} · ${o.prix}</span>
        </span>
      </a>
    </article>`;
}

function carteePiste(p, rang, r, c) {
  const ref = p.ref;
  const offres = ref.offres
    .map((cle) => OFFRES[cle] ? { cle, ...OFFRES[cle] } : null)
    .filter(Boolean);
  const gain = p.gainEuros >= 25
    ? `<span class="etiq gain">≈ ${fmtEuro(p.gainEuros)} par mois</span>` : '';

  return `
    <article class="piste">
      <div class="haut">
        <span class="rang">${rang}</span>
        ${icone3d(ref.icone, 46)}
        <div>
          <div class="axe">${ref.axe}</div>
          <h3>${ref.titreCourt}</h3>
        </div>
      </div>
      <div class="etiqs">
        <span class="etiq ${ref.ia ? 'ia' : 'simple'}">${ref.ia ? 'Avec intelligence artificielle' : 'Automatisation simple'}</span>
        ${gain}
      </div>
      <p class="constat">${ref.constat(r, c)}</p>
      <p class="solution">${ref.solution}</p>
      ${offres.map((o) => `
        <a class="offre" ${o.lien ? `href="${o.lien}" target="_blank" rel="noopener"` : 'href="#" onclick="return false"'}>
          ${o.icone ? `<img src="${o.icone}" alt="" width="46" height="46" decoding="async">` : icone3d(o.icone3d || 'surmesure', 46)}
          <span class="txt">
            <span class="n">${o.nom}</span>
            <span class="d">${o.cle === 'surmesure' && ref.promesse ? ref.promesse : o.quoi}</span>
            <span class="p">${o.type} · ${o.prix}</span>
          </span>
        </a>`).join('')}
    </article>`;
}

/* ---------- Formulaire de contact ---------- */

function ecranFormulaire() {
  rendre(`
    ${enTeteMarque()}
    <section class="resultat">
      <h1>Où envoyons-nous votre rapport&nbsp;?</h1>
      <p class="chapo">Votre audit est prêt. Il ne manque que l’adresse où l’envoyer, avec le détail poste par poste et les solutions correspondantes.</p>
      <form class="carte" id="form" novalidate style="margin-top:18px">
        <div class="champ">
          <label for="f-nom">Votre nom</label>
          <input id="f-nom" name="nom" type="text" autocomplete="name" required>
        </div>
        <div class="champ">
          <label for="f-ese">Le nom de votre entreprise</label>
          <input id="f-ese" name="entreprise" type="text" autocomplete="organization">
        </div>
        <div class="champ">
          <label for="f-mail">Votre adresse électronique</label>
          <input id="f-mail" name="email" type="email" inputmode="email" autocomplete="email" required>
        </div>
        <div class="champ">
          <label for="f-tel">Votre téléphone <span style="color:var(--gris);font-weight:400">(facultatif)</span></label>
          <input id="f-tel" name="telephone" type="tel" inputmode="tel" autocomplete="tel">
        </div>
        <p class="rgpd">Ces informations servent uniquement à vous envoyer ce rapport et à vous recontacter à ce sujet. Elles ne sont ni revendues ni transmises. Vous pouvez demander leur suppression à tout moment en écrivant à ${CONFIG.emailContact}.</p>
        <button class="bouton" type="submit">Je reçois mon rapport</button>
        <button class="bouton secondaire" type="button" id="annuler" style="margin-top:10px">Revenir à mes résultats</button>
      </form>
    </section>
  `);

  document.getElementById('annuler').onclick = ecranResultat;
  document.getElementById('form').onsubmit = (e) => {
    e.preventDefault();
    soumettre(e.target);
  };
}

function soumettre(form) {
  const donnees = {
    nom: form.nom.value.trim(),
    entreprise: form.entreprise.value.trim(),
    email: form.email.value.trim(),
    telephone: form.telephone.value.trim()
  };

  form.querySelectorAll('.err').forEach((x) => x.remove());
  let erreur = false;
  if (!donnees.nom) { marquerErreur(form.nom, 'Merci d’indiquer votre nom.'); erreur = true; }
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(donnees.email)) {
    marquerErreur(form.email, 'Cette adresse ne semble pas valide.'); erreur = true;
  }
  if (erreur) return;

  const bouton = form.querySelector('button[type="submit"]');
  bouton.disabled = true;
  bouton.textContent = 'Envoi en cours…';

  const charge = {
    contact: donnees,
    reponses: etat.reponses,
    /* On transmet exactement ce que le client a vu à l'écran : lui envoyer un
       chiffre différent de celui affiché sèmerait le doute. */
    synthese: {
      score: etat.resultat.score,
      heuresGagnees: etat.resultat.fourchette.heures,
      eurosMois: Math.round(etat.resultat.fourchette.eurosBas),
      priorites: etat.resultat.top.map((p) => p.ref.id)
    },
    version: CONFIG.version
  };

  if (!CONFIG.endpoint) { replisMessagerie(charge); return; }

  fetch(CONFIG.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(charge)
  })
    .then((rep) => { if (!rep.ok) throw new Error('refus'); ecranMerci(false); })
    .catch(() => replisMessagerie(charge));
}

/* Sans point de collecte, on ouvre la messagerie du téléphone avec un message
   déjà rédigé. Le prospect n'est jamais bloqué. */
function replisMessagerie(charge) {
  const sujet = 'Demande de rapport d’audit — ' + (charge.contact.entreprise || charge.contact.nom);
  const corps = [
    'Bonjour,',
    '',
    'Je viens de réaliser l’audit d’automatisation et je souhaite recevoir le rapport détaillé.',
    '',
    'Nom : ' + charge.contact.nom,
    'Entreprise : ' + (charge.contact.entreprise || 'non précisé'),
    'Téléphone : ' + (charge.contact.telephone || 'non précisé'),
    '',
    'Résultat de mon audit :',
    '- Score : ' + charge.synthese.score + ' sur 100',
    '- Temps récupérable : ' + charge.synthese.heuresGagnees + ' par mois',
    '- Soit environ ' + fmtEuro(charge.synthese.eurosMois) + ' par mois',
    '- Priorités : ' + charge.synthese.priorites.join(', '),
    '',
    'Détail des réponses : ' + JSON.stringify(charge.reponses)
  ].join('\n');

  const lien = 'mailto:' + CONFIG.emailContact
    + '?subject=' + encodeURIComponent(sujet)
    + '&body=' + encodeURIComponent(corps);

  /* On n'ouvre pas la messagerie de force : sur beaucoup d'ordinateurs aucune
     application n'est associée, et il ne se passerait rien. On propose le lien,
     et on affiche le message pour qu'il reste copiable dans tous les cas. */
  ecranMerci(true, lien, corps);
}

function marquerErreur(champ, message) {
  const p = document.createElement('div');
  p.className = 'err';
  p.textContent = message;
  champ.parentNode.appendChild(p);
  champ.style.borderColor = 'var(--rouge)';
  champ.focus();
}

/* ---------- Écran de remerciement ---------- */

function ecranMerci(parMessagerie, lien, corps) {
  rendre(`
    ${enTeteMarque()}
    <section class="merci">
      ${icone3d('bouclier', 78)}
      ${parMessagerie ? `
        <h1>Dernière étape</h1>
        <p class="chapo">Votre demande est prête. Envoyez-la par courriel, il ne reste qu’à appuyer.</p>
        <div style="margin-top:24px;text-align:left">
          <a class="bouton" href="${lien}">Ouvrir ma messagerie</a>
          <details class="methode" style="margin-top:14px">
            <summary>Ou copier le message à la main</summary>
            <div class="corps">
              <p>Adresse : <b>${CONFIG.emailContact}</b></p>
              <textarea readonly style="width:100%;min-height:150px;font:inherit;font-size:13px;padding:12px;border-radius:12px;border:1px solid var(--trait)">${corps}</textarea>
            </div>
          </details>
        </div>`
      : `
        <h1>C’est noté, votre rapport est en préparation</h1>
        <p class="chapo">Vous le recevrez sous vingt-quatre heures, préparé à partir de vos réponses. Si vous ne le voyez pas arriver, pensez à regarder dans les indésirables.</p>`}
      <div style="margin-top:26px">
        <button class="bouton secondaire" id="retourres">Revoir mes résultats</button>
      </div>
    </section>
  `);
  document.getElementById('retourres').onclick = ecranResultat;
}

/* ------------------------------------------------------------------ *
 * Démarrage
 * ------------------------------------------------------------------ */

ecranAccueil();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
