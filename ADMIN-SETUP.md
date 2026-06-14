# Configuration de l'éditeur du site (admin.html)

Le prêtre se connecte avec **« Se connecter avec GitHub »** : un code à 8 caractères
s'affiche, il l'entre sur github.com/login/device, et c'est tout.
**Aucun jeton, aucun secret** — on utilise le « Device Flow » de GitHub.

Tout est déjà déployé. Il ne reste qu'**une seule case à cocher** côté GitHub.

---

## La seule action restante : activer le Device Flow

1. Ouvrir l'app OAuth GitHub :
   https://github.com/settings/developers → **OAuth Apps** → **Site paroisse**
2. Cocher **« Enable Device Flow »**.
3. **Update application**.

C'est terminé. (La création d'un « client secret » n'est PAS nécessaire avec le Device Flow ;
si un secret a été généré, il est inutile et peut être ignoré.)

---

## Ce qui est déjà en place (rien à faire)

- **OAuth App GitHub** « Site paroisse » — Client ID `Ov23liLIGbad3EG54SvY` (public).
- **Fonction Netlify** (relais sans secret) :
  `https://paroisse-seraphim-montgeron.netlify.app/.netlify/functions/auth`
- **Variables Netlify** : `GITHUB_CLIENT_ID`, `CMS_ORIGIN`.
  (Pas de `GITHUB_CLIENT_SECRET` : inutile en Device Flow.)
- **admin.html** déjà configuré (Client ID + URL de la fonction).

Le site reste publié par GitHub Pages ; Netlify ne sert que la fonction de connexion.

---

## Utilisation (côté prêtre)

1. Ouvrir `https://autumn477.github.io/saint-seraphin-de-sarov_montgeron/admin.html`
2. **« Se connecter avec GitHub »** → un code s'affiche, un onglet GitHub s'ouvre.
3. Entrer le code sur GitHub, **Authorize**. La page se connecte toute seule.
4. Onglet **Textes & fête** : modifier → **Enregistrer**.
   Onglet **Programme de la semaine** : choisir un PDF → **Enregistrer**.
5. En ligne ~1 minute plus tard.

La connexion reste valable le temps de la session du navigateur.
