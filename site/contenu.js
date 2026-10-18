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
      description: "Les fondamentaux de l'apprentissage automatique, des modèles classiques à l'évaluation.",
      chapitres: [],
      ressources: []
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
