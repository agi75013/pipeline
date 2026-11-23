---
version: 1
slug: "maquette-pipeline-html"
primary_target: "maquette/pipeline.html"
related_targets: []
---

# Maquette cliquable Pipeline

Scope : prototype autonome (HTML/CSS/JS, données d'exemple synthétiques en mémoire, persistées en localStorage), servant à valider la refonte avant de l'implémenter en lots. Mode : Operate. Ordinateur et mobile à égalité.

Tâches : voir et traiter les relances du jour, glisser un prospect d'étape en étape, ajouter vite dans une colonne, ouvrir une fiche (voir, modifier, notes, supprimer avec confirmation), rechercher et filtrer (étape, relance). Recherche et filtres sont un ajout de périmètre à valider (absent d'INTENT.md).

## Direction contract

THESIS: le kanban que tout le monde a déjà fait au mur, rendu impeccable : une couleur douce par étape, et ce qui est à relancer porte un post-it rouge. Refuse le kanban gris à un accent et la liste-tableau actuelle.
OWN-WORLD: fond papier mat #f7f7f4, encre #23262f ; cartes en couleur pleine par étape (blanc Nouveau, jaune Contacté, abricot Réponse reçue, bleu ciel RDV, menthe Gagné, gris Perdu), coin inférieur droit plus arrondi, ombre courte et douce ; étiquette rouge #ff6b5e légèrement inclinée sur toute fiche à relancer. Nunito Sans, deux tailles et la graisse pour la hiérarchie.
STORY: on comprend en une seconde qui relancer (bandeau rouge en tête) et où en est chaque prospect (6 colonnes) ; on agit d'un geste : glisser, ajouter, ouvrir.
FIRST VIEWPORT: barre blanche en haut (logo, recherche, filtres étape et relance, bouton noir « Nouveau prospect ») ; bandeau « À relancer » de post-its rouges cliquables ; 6 colonnes pleine hauteur, compteur par colonne, « Ajouter ici » en pied. Mobile : onglets d'étapes défilants, une colonne à la fois, bandeau des relances repliable.
FORM: grounded « Mur de post-it », main sage, choisi par l'utilisateur hors rang ; seed:d3608ddb4ea3cb30. Signature : la carte se décolle au glisser (légère rotation, ombre portée longue), la colonne visée s'éclaire et un emplacement pointillé s'ouvre ; au dépôt, la carte se recolle avec un petit rebond.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
