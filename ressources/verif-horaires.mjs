/* Vérification de l'algorithme de statut d'ouverture.
   Reprend à l'identique la table et la logique de website/js/main.js,
   et les rejoue sur une semaine entière. Fichier de contrôle, non déployé. */

const HORAIRES = {
  0: [[660, 840], [1020, 1260]],
  1: [[1020, 1290]],
  2: [[660, 840], [1020, 1290]],
  3: [[660, 840], [1020, 1290]],
  4: [[660, 840], [1020, 1290]],
  5: [[660, 840], [1020, 1320]],
  6: [[660, 840], [1020, 1320]]
};
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const enHeure = (m) => (m % 60 === 0) ? `${Math.floor(m / 60)}h`
  : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;

function etat(jour, minutes) {
  const creneaux = HORAIRES[jour] || [];
  for (const [debut, fin] of creneaux) {
    if (minutes >= debut && minutes < fin) return { ouvert: true, reste: fin - minutes, ferme: fin };
    if (minutes < debut) return { ouvert: false, ouvre: debut, quand: 'aujourdhui' };
  }
  for (let d = 1; d <= 7; d++) {
    const j = (jour + d) % 7;
    if (HORAIRES[j]?.length) {
      return { ouvert: false, ouvre: HORAIRES[j][0][0], quand: d === 1 ? 'demain' : JOURS[j] };
    }
  }
  return null;
}

function message(e) {
  if (!e) return 'AUCUN ÉTAT';
  if (e.ouvert) {
    return e.reste <= 30 ? `Ouvert encore ${e.reste} minutes`
                         : `Ouvert — ça ferme à ${enHeure(e.ferme)}`;
  }
  if (e.quand === 'aujourdhui') return `Fermé — ça rouvre à ${enHeure(e.ouvre)}`;
  if (e.quand === 'demain')     return `Fermé — demain dès ${enHeure(e.ouvre)}`;
  return `Fermé — ${e.quand} dès ${enHeure(e.ouvre)}`;
}

// 1. Aperçu lisible à quelques moments clés
const moments = [
  [1, 9 * 60],      [1, 12 * 60],     [1, 18 * 60],     [1, 21 * 60 + 20],
  [3, 11 * 60],     [3, 13 * 60 + 50], [3, 15 * 60],    [3, 23 * 60],
  [5, 21 * 60 + 45], [6, 22 * 60 + 5], [0, 13 * 60],    [0, 21 * 60 + 10]
];
console.log('— Aperçu —');
for (const [j, m] of moments) {
  console.log(`${JOURS[j].padEnd(9)} ${enHeure(m).padStart(6)}  →  ${message(etat(j, m))}`);
}

// 2. Contrôles automatiques
let echecs = 0;
const verifier = (nom, condition) => {
  if (!condition) { echecs++; console.log(`ÉCHEC : ${nom}`); }
};

for (let j = 0; j < 7; j++) {
  for (let m = 0; m < 1440; m++) {
    const e = etat(j, m);
    verifier(`état défini (${JOURS[j]} ${m})`, e !== null);
    if (!e) continue;
    if (e.ouvert) {
      verifier(`reste positif (${JOURS[j]} ${m})`, e.reste > 0 && e.reste <= 300);
    } else {
      verifier(`heure d'ouverture connue (${JOURS[j]} ${m})`, Number.isInteger(e.ouvre));
    }
    verifier(`message non vide (${JOURS[j]} ${m})`, message(e).length > 8);
  }
}

// 3. Cas limites précis
verifier('lundi 11h00 est fermé (pas de service de midi)', etat(1, 660).ouvert === false);
verifier('lundi 11h00 annonce 17h', etat(1, 660).ouvre === 1020);
verifier('mardi 11h00 pile est ouvert', etat(2, 660).ouvert === true);
verifier('mardi 14h00 pile est fermé', etat(2, 840).ouvert === false);
verifier('mardi 14h00 annonce 17h le jour même', etat(2, 840).quand === 'aujourdhui');
verifier('mardi 21h30 pile est fermé', etat(2, 1290).ouvert === false);
verifier('mardi 21h30 renvoie à demain', etat(2, 1290).quand === 'demain');
verifier('dimanche 22h renvoie à lundi 17h', etat(0, 1320).ouvre === 1020 && etat(0, 1320).quand === 'demain');
verifier('samedi minuit renvoie à dimanche 11h', etat(6, 0).ouvre === 660);
verifier('vendredi 21h50 est ouvert', etat(5, 1310).ouvert === true);
verifier('formatage 21h30', enHeure(1290) === '21h30');
verifier('formatage 17h', enHeure(1020) === '17h');
verifier('compte à rebours sous 30 min', message(etat(2, 1275)).includes('encore 15 minutes'));

console.log(echecs === 0 ? '\nTous les contrôles passent.' : `\n${echecs} échec(s).`);
