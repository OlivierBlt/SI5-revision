/*
  Catalogue du site de révision.
  Pour ajouter une ressource : déposer la page .html dans matieres/<id-matiere>/
  puis ajouter une entrée dans le tableau "ressources" de la matière.

  Types possibles : "examen" (examen blanc), "qcm", "fiche" (fiche de cours),
                    "exercices", "flashcards"
*/
window.REVISION = {
  titre: "Révisions SI5",
  matieres: [
    {
      id: "app-image",
      court: "App. Image",
      nom: "Apprentissage pour l'image",
      couleur: "#2F6FDB",
      motif: "grid",
      description: "CNN, PyTorch, transfer learning, distillation, explicabilité, transformers et détection.",
      chapitres: ["CM1", "CM2", "CM3", "CM4", "CM5", "CM6"],
      ressources: [
        {
          id: "examen-blanc",
          titre: "Examen blanc",
          type: "examen",
          fichier: "matieres/app-image/examen-blanc.html",
          description: "Entraînement complet sur les CM1 à CM6 et les TD1 à TD6, dans le style du partiel : cours, code, calculs, QCM, corrigé à déplier.",
          tags: ["CM1–CM6", "TD1–TD6", "Corrigé"]
        }
      ]
    },
    {
      id: "app-machine",
      court: "App. Machine",
      nom: "Apprentissage machine",
      couleur: "#C2410C",
      motif: "dots",
      description: "Régression linéaire et logistique, métriques et classes déséquilibrées, arbres et ensembles, KNN, texte avant les transformers.",
      chapitres: ["CM1", "CM2", "CM3", "CM4", "CM5", "Labs"],
      ressources: [
        {
          id: "fiche-synthese",
          titre: "Fiche de synthèse",
          type: "fiche",
          fichier: "matieres/app-machine/fiche-synthese.html",
          description: "Toutes les notions des 5 CM : formules à savoir utiliser, pièges, coquilles des CM corrigées, tableau pour choisir et justifier un modèle.",
          tags: ["CM1–CM5", "Formules", "Choix de modèle"]
        },
        {
          id: "qcm-ml",
          titre: "Grand QCM d'apprentissage machine",
          type: "qcm",
          fichier: "matieres/app-machine/qcm-ml.html",
          description: "172 questions sur les 5 CM, les labs et la méthode, corrigées immédiatement avec explication. Calculs, associations, code sklearn. Mode examen blanc de 30 questions.",
          tags: ["CM1–CM5", "Labs", "Mode examen"]
        },
        {
          id: "examen-blanc",
          titre: "Examen blanc",
          type: "examen",
          fichier: "matieres/app-machine/examen-blanc.html",
          description: "11 problèmes type examen (Anscombe, prix immobilier, cancer rare, fraude, boosting, KNN, KD-tree, texte, choix de modèle), questions de cours, code sklearn et calculs, corrigé à déplier.",
          tags: ["CM1–CM5", "Problèmes", "Corrigé"]
        }
      ]
    },
    {
      id: "app-renforcement",
      court: "App. Renforcement",
      nom: "Apprentissage par renforcement",
      couleur: "#0F8A6A",
      motif: "states",
      description: "MDP, TD-learning, Q-learning, politiques et labs.",
      chapitres: ["CM1", "CM2", "CM3", "CM4", "CM5", "CM6", "Labs"],
      ressources: [
        {
          id: "qcm-rl",
          titre: "Grand QCM de RL",
          type: "qcm",
          fichier: "matieres/app-renforcement/qcm-rl.html",
          description: "Environ 150 questions sur les 6 CM et les labs, corrigées immédiatement avec explication. Mode examen blanc de 30 questions.",
          tags: ["CM1–CM6", "Labs", "Mode examen"]
        }
      ]
    },
    {
      id: "semantic-web",
      court: "Semantic Web",
      nom: "Web sémantique",
      couleur: "#7C3AED",
      motif: "graph",
      description: "RDF, ontologies, SPARQL et raisonnement sur les graphes de connaissances.",
      chapitres: [],
      ressources: []
    }
  ]
};
