# Média « Fabrication »

Séquence scroll-scrub : frames WebP dans `images/scrub/`, affichées sur un
canvas (pas de `video.currentTime`).

## Fichiers

- Source : `ressources/fabrication.mp4` (copie depuis BLOC NOTES)
- Frames : `images/scrub/frame-0001.webp` … `frame-0193.webp` (~5,2 Mo)
- Poster : `frame-0001.webp` (fallback + `prefers-reduced-motion`)

## Régénérer les frames

```bash
ffmpeg -y -i ressources/fabrication.mp4 -vf "fps=16,scale=960:-1" -c:v libwebp -quality 75 -an website/images/scrub/frame-%04d.webp
```

Puis aligner `FRAME_COUNT` dans `js/fabrication.js` sur le nombre de fichiers.
