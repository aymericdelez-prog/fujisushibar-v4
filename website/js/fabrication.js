/* Section « Fabrication » — scène sticky (CSS) + textes + scrub canvas. */
(function () {
  'use strict';

  var NB = 6;
  /* Part du palier consacrée au fondu, en entrée comme en sortie */
  var FONDU = 0.12;

  var FRAME_COUNT = 193;
  var FRAME_PAD = 4;
  var FRAME_DIR = 'images/scrub/';
  /* Activer le scrub dès que les premières frames sont là */
  var PRELOAD_MIN = 8;

  function clamp(v, a, b) {
    return v < a ? a : (v > b ? b : v);
  }

  function lisser(x) {
    return x * x * (3 - 2 * x);
  }

  function pad(n) {
    var s = String(n);
    while (s.length < FRAME_PAD) s = '0' + s;
    return s;
  }

  function frameUrl(i) {
    return FRAME_DIR + 'frame-' + pad(i + 1) + '.webp';
  }

  function initFabrication() {
    var section = document.getElementById('fabrication');
    var piste = document.getElementById('fabrication-piste');
    var scene = document.getElementById('fabrication-scene');
    if (!section || !piste || !scene) return;

    var reduit = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    var jauge = document.getElementById('fabrication-jauge');
    var etapes = section.querySelectorAll('.fabrication__etape');
    var cadre = document.getElementById('fabrication-cadre');
    var canvas = document.getElementById('fabrication-media');
    var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

    var frames = new Array(FRAME_COUNT);
    var chargees = 0;
    var pret = false;
    var dernierIndex = -1;
    var derniereExacte = false;
    var indexVoulu = 0;
    var enAttente = false;

    function imagePrete(img) {
      return !!(img && img.complete && img.naturalWidth > 0);
    }

    /* Si la frame exacte n'est pas encore là, prendre la plus proche déjà chargée. */
    function trouverImage(index) {
      if (imagePrete(frames[index])) return frames[index];
      for (var d = 1; d < FRAME_COUNT; d++) {
        var avant = index - d;
        var apres = index + d;
        if (avant >= 0 && imagePrete(frames[avant])) return frames[avant];
        if (apres < FRAME_COUNT && imagePrete(frames[apres])) return frames[apres];
      }
      return null;
    }

    function dessiner(index) {
      if (!ctx || !canvas) return;
      indexVoulu = index;
      var exacte = imagePrete(frames[index]);
      var img = exacte ? frames[index] : trouverImage(index);
      if (!img) return;
      if (index === dernierIndex && exacte && derniereExacte) return;
      dernierIndex = index;
      derniereExacte = exacte;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    function activerScrub() {
      if (pret) return;
      pret = true;
      if (cadre) cadre.classList.add('est-pret');
      dessiner(indexVoulu);
    }

    function chargerFrames() {
      if (!ctx) return;

      for (var i = 0; i < FRAME_COUNT; i++) {
        (function (index) {
          var img = new Image();
          img.onload = function () {
            frames[index] = img;
            chargees += 1;
            if (chargees >= PRELOAD_MIN) activerScrub();
            if (index === indexVoulu || Math.abs(index - indexVoulu) <= 1) {
              dessiner(indexVoulu);
            }
          };
          img.onerror = function () {
            chargees += 1;
            if (chargees >= PRELOAD_MIN) activerScrub();
          };
          img.src = frameUrl(index);
        })(i);
      }
    }

    function progression() {
      var rect = piste.getBoundingClientRect();
      var course = rect.height - scene.getBoundingClientRect().height;
      if (course <= 0) return 0;
      return clamp(-rect.top / course, 0, 1);
    }

    function afficherTextes(etape, frac) {
      var bascule = reduit && reduit.matches;

      for (var i = 0; i < etapes.length; i++) {
        var el = etapes[i];
        var opacite = 0;
        var decale = 0.55;

        if (bascule) {
          opacite = i === etape ? 1 : 0;
          decale = 0;
        } else if (i === etape) {
          if (frac < FONDU) {
            opacite = lisser(frac / FONDU);
            decale = (1 - opacite) * 0.55;
          } else if (etape < NB - 1 && frac > 1 - FONDU) {
            var sortie = lisser((frac - (1 - FONDU)) / FONDU);
            opacite = 1 - sortie;
            decale = sortie * -0.4;
          } else {
            opacite = 1;
            decale = 0;
          }
        } else if (i === etape + 1 && frac > 1 - FONDU) {
          opacite = lisser((frac - (1 - FONDU)) / FONDU);
          decale = (1 - opacite) * 0.55;
        }

        el.style.opacity = String(opacite);
        el.style.transform = 'translateY(' + decale + 'rem)';
        el.classList.toggle('est-active', i === etape && opacite > 0.45);
      }
    }

    function mettreAJour() {
      enAttente = false;

      var p = progression();
      var avance = p * NB;
      var etape = Math.min(Math.floor(avance), NB - 1);

      afficherTextes(etape, avance - etape);

      /* Le scrub est le contenu de la section (comme les textes d'étapes),
         pas une décoration : on l'anime aussi en reduced-motion. */
      if (pret || chargees > 0) {
        var frameIndex = Math.round(p * (FRAME_COUNT - 1));
        dessiner(frameIndex);
      }

      if (jauge) jauge.style.width = (p * 100).toFixed(1) + '%';
    }

    function planifier() {
      if (!enAttente) {
        enAttente = true;
        requestAnimationFrame(mettreAJour);
      }
    }

    window.addEventListener('scroll', planifier, { passive: true });
    window.addEventListener('resize', planifier, { passive: true });
    window.addEventListener('load', planifier);
    if (reduit && typeof reduit.addEventListener === 'function') {
      reduit.addEventListener('change', planifier);
    }

    chargerFrames();
    mettreAJour();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFabrication);
  } else {
    initFabrication();
  }
})();
