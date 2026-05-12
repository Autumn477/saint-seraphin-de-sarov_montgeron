# Saint-Séraphim-de-Sarov — Montgeron

Site bilingue (FR / RU) de la paroisse orthodoxe russe Saint-Séraphim-de-Sarov à Montgeron.

## Stack

Site statique pur — HTML / CSS / JavaScript, sans build.

- `index.html` … `saint.html` — pages FR
- `ru-accueil.html`, `istoriya.html`, `bogoslujeniya.html`, `pozhertvovaniya.html`, `kontakty.html` — pages RU
- `style.css` — styles principaux + 12 palettes de couleurs (data-palette)
- `site.css` — overlay design (mode jour/nuit, hero variants)
- `main.js` — animations, scroll reveals, lightbox, parallax
- `site.js` — palette switcher + localStorage settings

## Lancer en local

```bash
python3 .claude/serve-nocache.py 8080
```

Le serveur sert le site sur http://localhost:8080/ avec des headers `Cache-Control: no-store` (utile pour voir les changements CSS/JS sans hard-reload).

Alternative basique : `python3 -m http.server 8080`.

## Palette de couleurs (dev preview)

Un `<select>` dans la nav permet de basculer entre 12 palettes (or, bleu, bordeaux, vert, pourpre, noir, terre, nuit, sauge, marine, lavande, charbon). Le choix est persisté dans `localStorage` (`sssarov.settings.v1`).

Les palettes sont définies dans `style.css` sous `html[data-palette="..."]` et overrident les variables CSS de `style.css` ET `site.css`.

## Synchronisation FR ↔ RU

Le hook `.claude/settings.json` (PostToolUse) déclenche `.claude/sync-fr-to-ru.py` à chaque édition d'une page FR et rappelle à Claude Code de répliquer les changements structurels dans la page RU correspondante.

| FR | RU |
|---|---|
| `index.html` | `ru-accueil.html` |
| `histoire.html` | `istoriya.html` |
| `offices.html` | `bogoslujeniya.html` |
| `dons.html` | `pozhertvovaniya.html` |
| `contact.html` | `kontakty.html` |
| `saint.html` | (partagée) |

Les assets `style.css`, `site.css`, `main.js`, `site.js`, `assets/`, `uploads/` sont partagés entre les deux versions.

## Déploiement

Site statique → GitHub Pages (compatible) ou tout hébergeur statique.

## Contact

Recteur : hiéromoine Nicodim Pavlinchuk — `nikodim2003@gmail.com`
