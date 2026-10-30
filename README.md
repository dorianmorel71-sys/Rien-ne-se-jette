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
