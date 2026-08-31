/* ═══════════════════════════════════════════════════════════
   Fuji Sushibar — comportements
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Horaires ─────────────────────────────────────────
     Créneaux en minutes depuis minuit, par jour (0 = dimanche).
     Source : ressources/entreprise.md
  */
  var HORAIRES = {
    0: [[660, 840], [1020, 1260]],  // dimanche  11h–14h · 17h–21h
    1: [[1020, 1290]],              // lundi                17h–21h30
    2: [[660, 840], [1020, 1290]],  // mardi     11h–14h · 17h–21h30
    3: [[660, 840], [1020, 1290]],
    4: [[660, 840], [1020, 1290]],
    5: [[660, 840], [1020, 1320]],  // vendredi  11h–14h · 17h–22h
    6: [[660, 840], [1020, 1320]]   // samedi
  };

  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var INDEX_JOUR = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  // Le restaurant est à Neuchâtel : on raisonne toujours en heure suisse,
  // même si le visiteur consulte le site depuis un autre fuseau.
  function maintenantEnSuisse() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Zurich',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).formatToParts(new Date());

      var lu = {};
      parts.forEach(function (p) { lu[p.type] = p.value; });

      var heure = parseInt(lu.hour, 10) % 24;
      return {
        jour: INDEX_JOUR[lu.weekday],
        minutes: heure * 60 + parseInt(lu.minute, 10)
      };
    } catch (e) {
      var d = new Date();
      return { jour: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function enHeure(minutes) {
    var h = Math.floor(minutes / 60), m = minutes % 60;
    return m === 0 ? h + 'h' : h + 'h' + (m < 10 ? '0' + m : m);
  }

  function etatDuMoment() {
    var t = maintenantEnSuisse();
    var creneaux = HORAIRES[t.jour] || [];

    for (var i = 0; i < creneaux.length; i++) {
      if (t.minutes >= creneaux[i][0] && t.minutes < creneaux[i][1]) {
        return { ouvert: true, reste: creneaux[i][1] - t.minutes, ferme: creneaux[i][1] };
      }
      if (t.minutes < creneaux[i][0]) {
        return { ouvert: false, ouvre: creneaux[i][0], quand: 'aujourdhui' };
      }
    }

    // Plus rien aujourd'hui : on cherche la prochaine ouverture.
    for (var d = 1; d <= 7; d++) {
      var jour = (t.jour + d) % 7;
      var suite = HORAIRES[jour];
      if (suite && suite.length) {
        return {
          ouvert: false,
          ouvre: suite[0][0],
          quand: d === 1 ? 'demain' : JOURS[jour]
        };
      }
    }
    return null;
  }

  function afficherStatut() {
    var boite = document.getElementById('statut');
    var etat = etatDuMoment();
    if (!boite || !etat) return;

    var texte = boite.querySelector('.statut__texte');
    var message;

    if (etat.ouvert) {
      message = etat.reste <= 30
        ? 'Ouvert encore <b>' + etat.reste + ' minutes</b>'
        : 'Ouvert jusqu\'à <b>' + enHeure(etat.ferme) + '</b>';
    } else if (etat.quand === 'aujourdhui') {
      message = 'Ouvert à partir de <b>' + enHeure(etat.ouvre) + '</b>';
    } else if (etat.quand === 'demain') {
      message = 'Ouvert demain dès <b>' + enHeure(etat.ouvre) + '</b>';
    } else {
      message = 'Ouvert ' + etat.quand + ' dès <b>' + enHeure(etat.ouvre) + '</b>';
    }

    if (texte) texte.innerHTML = message;
    boite.setAttribute('data-ouvert', etat.ouvert ? 'oui' : 'non');
    boite.removeAttribute('data-vide');

    var pastille = document.getElementById('barre-statut');
    if (pastille) pastille.setAttribute('data-ouvert', etat.ouvert ? 'oui' : 'non');
  }

  function marquerAujourdhui() {
    var liste = document.getElementById('horaires');
    if (!liste) return;
    var jour = String(maintenantEnSuisse().jour);
    var ligne = liste.querySelector('[data-jour="' + jour + '"]');
    if (ligne) ligne.classList.add('est-aujourdhui');
  }

  function demarrer() {
    afficherStatut();
    marquerAujourdhui();
    // La fabrication est dans js/fabrication.js (scroll épinglé + étapes)
    setInterval(afficherStatut, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
