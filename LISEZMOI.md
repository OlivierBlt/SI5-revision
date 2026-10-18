# Révisions SI5

Ouvrir `index.html` dans le navigateur (double-clic). Aucun serveur ni installation.

## Structure

```
révision/
├── index.html          ← le site central
├── site/
│   ├── contenu.js      ← catalogue des matières et ressources (à éditer)
│   ├── app.js          ← logique (navigation, recherche, progression)
│   └── style.css
└── matieres/
    ├── app-image/          examen-blanc.html
    ├── app-machine/        (vide)
    ├── app-renforcement/   qcm-rl.html
    └── semantic-web/       (vide)
```

## Ajouter une page de révision

1. Déposer le fichier `.html` dans `matieres/<matière>/`.
2. Ajouter une entrée dans `ressources` de la matière, dans `site/contenu.js` :

```js
{
  id: "qcm-sparql",                 // identifiant unique dans la matière
  titre: "QCM SPARQL",
  type: "qcm",                      // examen | qcm | fiche | exercices | flashcards
  fichier: "matieres/semantic-web/qcm-sparql.html",
  description: "…",
  tags: ["CM3", "CM4"]
}
```

Les chapitres de chaque matière (`chapitres: ["CM1", …]`) alimentent la liste « Chapitres revus ».

## Thème clair / sombre

Le site transmet le thème choisi aux pages ouvertes à l'intérieur. Pour qu'une nouvelle page le suive,
coller juste avant `</body>` :

```html
<script>(function(){function a(t){if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme")}var m=location.search.match(/[?&]theme=(light|dark)/);if(m)a(m[1]);addEventListener("message",function(e){if(e.data&&e.data.revisionTheme)a(e.data.revisionTheme)})})();</script>
```

(et définir ses couleurs sombres sous `:root[data-theme="dark"]`, comme les deux pages existantes).

Progression, notes, dates d'examen et pages récentes sont enregistrées dans le navigateur (localStorage).
