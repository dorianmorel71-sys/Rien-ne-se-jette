# Rien ne se jette

Appli anti-gaspillage : choisis un légume pour savoir quoi faire de ses épluchures, fanes, trognon et graines, ou coche tes restes pour trouver des recettes.

## Lancer le projet

```bash
npm install
npm start        # http://localhost:4200
npm test         # tests unitaires (Vitest)
npm run build    # version de production dans dist/
```

## Organisation du code

```
src/
├── index.html
├── styles.scss              styles globaux
├── styles/_tokens.scss      couleurs et polices (thème clair / sombre)
└── app/
    ├── app.ts|html|scss     coquille : titre, onglets, pied de page
    ├── app.routes.ts        #/legume/:id, #/restes, #/frigo et #/favoris
    ├── models/              interfaces Legume, Recette…
    ├── data/                fiches légumes, restes et recettes
    ├── services/            SelectionRestes (ingrédients cochés) + génération des recettes
    ├── pages/
    │   ├── par-legume/      recherche + fiche d'un légume
    │   ├── mes-restes/      restes à cocher + recettes
    │   ├── frigo/           restes mis de côté, les plus urgents d'abord
    │   └── favoris/
    └── components/
        ├── fiche-legume/
        ├── carte-recette/
        └── alerte/          encadré « Attention »
```

Pour ajouter un légume ou une recette, il suffit de compléter `src/app/data/legumes.ts` ou `src/app/data/recettes.ts` (les ingrédients à cocher sont dans `src/app/data/ingredients.ts`, et leur durée au frigo dans `src/app/data/frigo.ts`).

## Comptes (Firebase)

Les comptes sont facultatifs : ils sauvegardent favoris, frigo et compteur pour les retrouver sur tous ses appareils. Tant que `src/app/firebase.config.ts` est vide, ils sont désactivés.

1. Sur [console.firebase.google.com](https://console.firebase.google.com), crée un projet, puis ajoute une **application Web** et copie sa configuration dans `src/app/firebase.config.ts`.
2. **Authentication › Méthodes de connexion** : active « Adresse e-mail/Mot de passe » et « Google ».
3. **Authentication › Paramètres › Domaines autorisés** : ajoute le domaine GitHub Pages (`<utilisateur>.github.io`).
4. **Firestore Database** : crée la base, puis colle le contenu de `firestore.rules` dans l'onglet **Règles** et publie.
