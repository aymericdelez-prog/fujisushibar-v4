# Fuji Sushibar — v4

Site vitrine pour Fuji Sushibar, Rue de la Dîme 19, 2000 Neuchâtel.
Reprise du contenu et du ton de la v3, avec une section centrale scroll-driven
(scrub frames canvas de la fabrication d'un maki).

## Fil conducteur

Un homme, un comptoir, des sushis meilleurs qu'ailleurs. Le site montre le geste
plutôt que de s'en expliquer. Ton parlé, court. Une seule action : appeler le
032 558 27 28.

## Structure

```
fujisushibar-v4/
├── ressources/
│   ├── entreprise.md
│   ├── fabrication.mp4
│   └── verif-horaires.mjs
└── website/                    ← racine de déploiement
    ├── index.html
    ├── css/style.css
    ├── js/main.js
    ├── js/fabrication.js       ← scroll + textes + canvas scrub
    └── images/
        ├── logo.svg
        ├── geste/
        └── scrub/frame-*.webp
```

## La surprise UI : fabrication au scroll

Après le hero, la section sombre s'épingle à l'écran. Le scroll avance les
étapes du geste **et** une séquence de 193 frames WebP (16 fps) sur canvas (scrub
robuste, pas de `video.currentTime`). Textes synchronisés :

1. La feuille d'algue
2. Le riz, étalé
3. Saumon et concombre
4. Rouler
5. Couper
6. Les pièces

Source vidéo : `ressources/fabrication.mp4`. Frames : `website/images/scrub/`.

## Prévisualiser

```bash
npx serve websites/fujisushibar-v4/website -l 8080
```

## Reste à faire

- [x] Scrub frames fabrication (canvas + WebP)
- [ ] Logo définitif (webp haute définition)
- [ ] Photo du comptoir
- [ ] Repo GitHub + projet Vercel (Root Directory : `website`)
