---
name: Pipeline
description: Mini CRM de prospection mono-utilisateur, en mur de post-it.
colors:
  papier: "#f7f7f4"
  blanc: "#ffffff"
  encre: "#23262f"
  encre-2: "#4a4f5c"
  filet: "#e4e4dd"
  filet-fort: "#cfd0c8"
  rouge: "#ff6b5e"
  rouge-encre: "#b42318"
  rouge-fond: "#fff0ee"
  e-nouveau: "#ffffff"
  e-nouveau-trait: "#a7abb6"
  e-contacte: "#ffe58a"
  e-contacte-trait: "#e2b900"
  e-reponse: "#ffc79e"
  e-reponse-trait: "#ef8a45"
  e-rdv: "#a9d4ff"
  e-rdv-trait: "#4c9ae8"
  e-gagne: "#b9e8c2"
  e-gagne-trait: "#3fae5c"
  e-perdu: "#e4e4e0"
  e-perdu-trait: "#9a9b95"
typography:
  marque:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 900
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 900
  title:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 900
  body:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: "tnum"
  body-fort:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1.25
  label:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  etiquette:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 900
rounded:
  champ: "8px"
  controle: "10px"
  toast: "12px"
  colonne: "14px"
  dialogue: "16px"
  feuille: "18px"
  carte: "6px 6px 16px 6px"
  postit: "6px 6px 12px 6px"
  etiquette: "4px 4px 8px 4px"
  pilule: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  gouttiere: "24px"
  gouttiere-mobile: "14px"
components:
  button-noir:
    backgroundColor: "{colors.encre}"
    textColor: "{colors.blanc}"
    rounded: "{rounded.controle}"
    padding: "0 16px"
    height: "40px"
  button-neutre:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    rounded: "{rounded.controle}"
    padding: "0 16px"
    height: "40px"
  button-fantome:
    textColor: "{colors.encre}"
    rounded: "{rounded.controle}"
    padding: "0 16px"
    height: "40px"
  button-rouge:
    backgroundColor: "{colors.rouge-encre}"
    textColor: "{colors.blanc}"
    rounded: "{rounded.controle}"
    padding: "0 16px"
    height: "40px"
  carte-contacte:
    backgroundColor: "{colors.e-contacte}"
    textColor: "{colors.encre}"
    rounded: "{rounded.carte}"
    padding: "12px 12px 11px"
    typography: "{typography.body-fort}"
  postit-relance:
    backgroundColor: "{colors.rouge}"
    textColor: "{colors.encre}"
    rounded: "{rounded.postit}"
    padding: "8px 4px 8px 12px"
  etiquette-relance:
    backgroundColor: "{colors.rouge}"
    textColor: "{colors.encre}"
    rounded: "{rounded.etiquette}"
    padding: "2px 8px"
    typography: "{typography.etiquette}"
  champ:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    rounded: "{rounded.champ}"
    padding: "9px 11px"
  pilule:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    rounded: "{rounded.pilule}"
    padding: "0 12px"
    height: "36px"
    typography: "{typography.label}"
---

# Design System: Pipeline

> Source : la maquette cliquable `maquette/pipeline.html`, appliquée à l'application le 2026-11-23 (branche `refonte-post-it`). Les jetons vivent dans `src/app/globals.css` (variables shadcn re-teintées, plus `--postit`, `--encre-fiche` et les couleurs d'étape `--etape-*`, portées par `data-etape` en `--c` et `--trait`). Nunito Sans est chargée par `next/font` dans `src/app/layout.tsx`. Un thème sombre « mur la nuit » complète le monde : fond d'ardoise, fiches qui gardent leurs couleurs de papier.

## Overview

**Creative North Star: "Le mur de post-it"**

Le kanban que tout le monde a déjà fait au mur, rendu net. Un fond de papier mat, une encre presque noire, et des cartes en couleur pleine : chaque étape a sa teinte douce, si bien qu'on lit l'avancement d'un prospect à sa couleur avant de lire son nom. Ce qui est à relancer porte un post-it rouge légèrement de travers, en tête de page et sur la carte elle-même. Le rouge est l'unique signal d'urgence ; tout le reste reste calme.

La densité est celle d'un outil de travail quotidien : six colonnes pleine hauteur sur ordinateur, une colonne à la fois au doigt sur mobile. La matière est du papier posé, pas du verre ni du métal : ombres courtes et douces au repos, longue ombre portée quand une carte se décolle au glisser, petit rebond quand elle se recolle. Le monde refuse le kanban gris à un seul accent et la liste-tableau qui l'a précédé.

**Key Characteristics:**
- Une couleur pleine par étape, fixe et dans l'ordre des 6 étapes.
- Un seul rouge, réservé à la relance due (aujourd'hui ou en retard).
- Une seule famille, Nunito Sans ; la hiérarchie passe par la graisse plus que par la taille.
- Coin inférieur droit plus arrondi sur tout ce qui est un papier (carte, post-it, étiquette, pastille).
- Inclinaison légère comme signe du « posé à la main », jamais sur un contrôle d'interface.
- Le geste principal (glisser) a une physique : décoller, survoler, recoller.

## Colors

Un papier neutre et une encre froide portent l'interface ; six teintes pastel codent les étapes, et un rouge corail unique code l'urgence.

### Primary
- **Rouge post-it** (rouge) : fond des post-its du bandeau « À relancer », de l'étiquette inclinée sur les cartes dues et du compteur de relances. Toujours avec texte encre, jamais blanc.
- **Rouge encre** (rouge-encre) : la version lisible du rouge, pour le texte et les actions destructrices : bouton « Supprimer » de la confirmation, lien de suppression de la fiche, messages d'erreur, état « relance due » dans la fiche, bordure d'un champ invalide.
- **Rouge voile** (rouge-fond) : fond d'un champ invalide, rien d'autre.

### Secondary : les couleurs d'étape
Chaque étape a une couleur de fond (la carte, l'en-tête de fiche, l'onglet actif) et un trait plus soutenu (bordure de sélection, contour de la colonne visée, pointillé de l'emplacement de dépôt).
- **Blanc papier** (e-nouveau, trait e-nouveau-trait) : Nouveau. Seule carte qui reçoit en plus un filet intérieur d'un pixel pour se détacher du fond.
- **Jaune post-it** (e-contacte, trait e-contacte-trait) : Contacté. Sert aussi de couleur de sélection de texte.
- **Abricot** (e-reponse, trait e-reponse-trait) : Réponse reçue.
- **Bleu ciel** (e-rdv, trait e-rdv-trait) : RDV.
- **Menthe** (e-gagne, trait e-gagne-trait) : Gagné. Le trait menthe colore aussi la coche de l'état vide « Tout est à jour ».
- **Gris galet** (e-perdu, trait e-perdu-trait) : Perdu.

### Neutral
- **Papier mat** (papier) : fond de page et du tableau.
- **Blanc** (blanc) : barre du haut, fiche, dialogues, champs, boutons neutres.
- **Encre** (encre) : texte courant, bouton principal noir, filtre actif, toast, anneau de focus.
- **Encre seconde** (encre-2) : texte secondaire (société, ligne de contact, compteurs, placeholders).
- **Filet** (filet) : bordures au repos, séparateurs de la barre et du pied de fiche.
- **Filet fort** (filet-fort) : bordures au survol, pointillé de « aucun résultat », barre de défilement.

### Named Rules
**The Un Seul Rouge Rule.** Le rouge signifie « à relancer » ou « destructeur », rien d'autre. Aucune décoration, aucun accent de marque en rouge.

**The Couleur Égale Étape Rule.** Les six couleurs d'étape ne servent qu'à désigner leur étape (carte, pastille, onglet, en-tête de fiche, colonne visée). On ne les réemploie pas comme palette générale ; toute nouvelle surface qui parle d'une étape prend sa couleur via les variables `--c` et `--trait`.

**The Texte Encre Sur Couleur Rule.** Sur une couleur d'étape ou sur le rouge post-it, le texte est encre ou encre seconde, jamais blanc.

## Typography

**Display Font:** Nunito Sans (repli system-ui, sans-serif), police variable auto-hébergée, graisses 200 à 1000.
**Body Font:** Nunito Sans, même famille.

**Character:** une sans-serif ronde et amicale, au trait d'écolier propre, qui va avec le papier et le feutre. Les chiffres sont tabulaires partout (compteurs, dates).

### Hierarchy
- **Marque** (900, 20px, interlettrage -0.01em ; 18px sur mobile) : le mot « Pipeline » à côté du logo, nulle part ailleurs.
- **Headline** (900, 18px) : titre de la fiche prospect et des dialogues de confirmation.
- **Title** (900, 15px) : en-têtes de colonne et titre du bandeau « À relancer ».
- **Body** (500, 15px, interligne 1.4) : texte courant, champs, paragraphes de dialogue. Notes en interligne 1.5.
- **Body fort** (800, 15px, interligne 1.25) : nom du prospect sur la carte et le post-it ; libellés de bouton (800).
- **Label** (700 à 800, 13px) : société, ligne de contact, compteurs, libellés de champ, pilules de date rapide, onglets mobiles.
- **Étiquette** (900, 12px) : le texte de l'étiquette rouge d'une carte due (« Auj. », « Hier », « Retard 3 j »).

### Named Rules
**The Graisse Avant Taille Rule.** Le corps de l'interface tient en deux tailles, 15px et 13px ; on monte en hiérarchie par la graisse (500, 700, 800, 900). Les tailles 18px et 20px sont réservées aux titres de panneau et à la marque.

## Layout

Application plein écran (hauteur 100dvh) en trois bandes empilées : barre blanche du haut, bandeau des relances, tableau.

- **Ordinateur** : gouttière latérale de 24px. La barre du haut aligne logo, recherche (jusqu'à 440px), deux filtres, puis le bouton noir « Nouveau prospect » à droite. Le tableau est une grille de 6 colonnes égales (minimum 208px, espacement 12px) qui occupe toute la hauteur restante ; chaque colonne fait défiler sa propre pile de cartes (espacement 10px) et finit par « Ajouter ici ».
- **Mobile (760px et moins)** : gouttière de 14px. La recherche passe sur sa propre ligne, les filtres se partagent la suivante, le bouton « Nouveau prospect » devient une icône carrée de 40px. Une rangée d'onglets d'étapes défilants (pilules) remplace les en-têtes ; le tableau devient un carrousel à aimantation où chaque colonne fait la largeur de l'écran moins 28px. Le bandeau des relances se replie. Pendant un glisser, les onglets se transforment en barre de dépôt à 6 cases visibles d'un coup.
- **Fiche** : panneau latéral droit de 440px maximum sur ordinateur ; feuille montante à 92dvh sur mobile. Champs en grille à 16px d'écart ; email et téléphone côte à côte sur ordinateur, empilés sur mobile.
- **Rythme** : pas de 6, 8, 12, 16, 20 et 24px. Les contrôles de la barre font 40px de haut (36px sur mobile).

## Elevation & Depth

Hybride : la page est plate et tonale (papier, blanc, filets), et seuls les objets « papier » portent une ombre. Les ombres sont teintées d'encre (rgba de #23262f), jamais noires pures ; celles des post-its rouges sont teintées de rouge encre.

### Shadow Vocabulary
- **Carte posée** (`box-shadow: 0 1px 1px rgba(35,38,47,.06), 3px 4px 8px -5px rgba(35,38,47,.22)`) : cartes au repos, formulaire d'ajout rapide. Courte, décalée vers le bas à droite comme un papier collé.
- **Carte survolée** (`box-shadow: 0 1px 1px rgba(35,38,47,.06), 0 6px 14px -6px rgba(35,38,47,.22)`) : survol d'une carte.
- **Carte décollée** (`box-shadow: 0 22px 38px -14px rgba(35,38,47,.40), 0 6px 12px -6px rgba(35,38,47,.20)`) : la carte qui suit le pointeur pendant un glisser.
- **Post-it** (`box-shadow: 0 2px 6px -2px rgba(180,35,24,.45)`, survol `0 8px 16px -8px rgba(180,35,24,.6)`) : post-its du bandeau et, en plus court, étiquette des cartes.
- **Panneau** (`box-shadow: -18px 0 48px -24px rgba(35,38,47,.35)`) : fiche latérale.
- **Flottant** (`box-shadow: 0 30px 60px -20px rgba(35,38,47,.5)`) : dialogue de confirmation ; le toast utilise une variante plus courte.

### Named Rules
**The Seul Le Papier Porte Une Ombre Rule.** Barre, colonnes, champs et boutons restent plats ; l'ombre est réservée aux cartes, post-its, étiquettes et aux couches flottantes (fiche, dialogue, toast).

**The Décoller Recoller Rule.** Au glisser, la carte se soulève (ombre longue, rotation de -6 à 6 degrés selon la vitesse, échelle 1.03), la colonne visée s'éclaire à 40 % de sa couleur avec un contour de son trait, et un emplacement pointillé s'ouvre. Au dépôt, la carte se recolle en 450ms avec un léger rebond. Au doigt, le glisser démarre par un appui long et la carte volante est réduite à 60 % et posée au-dessus du doigt.

## Shapes

Des coins doux partout, et une signature : le coin inférieur droit plus arrondi que les trois autres sur tout objet papier (carte en 6/6/16/6px, post-it en 6/6/12/6px, étiquette en 4/4/8/4px, pastille d'étape en 2/2/6/2px, 16 x 14px, remplie du trait de son étape avec un coin replié en dégradé). Les contrôles d'interface gardent des coins réguliers : 8px pour les champs, 10px pour boutons et filtres, pilules entièrement arrondies pour les onglets mobiles et les dates rapides. Les couches flottantes s'arrondissent davantage (toast 12px, dialogue 16px, feuille mobile 18px en haut). Les pointillés de 2px signalent un emplacement où quelque chose peut arriver (dépôt, « Ajouter ici », aucun résultat).

### Named Rules
**The Coin Corné Rule.** Seuls les objets papier ont le coin inférieur droit élargi. Un bouton, un champ ou un panneau n'en a jamais.

**The Inclinaison Posée Rule.** Les objets papier peuvent être légèrement de travers : post-its du bandeau entre -1.2 et 1.1 degrés, étiquette à 3 degrés, pastille d'étape à -5 degrés. Au survol, le post-it se redresse. Aucun contrôle d'interface n'est incliné, et l'inclinaison disparaît en mouvement réduit.

## Components

### Buttons
Francs et compacts, libellé en 800.
- **Shape :** coins réguliers (10px), hauteur 40px, padding horizontal 16px, icône SVG de 18px à 8px du texte.
- **Noir (principal) :** fond encre, texte blanc. Un seul par zone : « Nouveau prospect » dans la barre, « Enregistrer » dans la fiche. Survol en encre éclaircie (#383c48).
- **Neutre :** fond blanc, filet ; survol filet fort sur blanc cassé. Pour « Annuler ».
- **Fantôme :** sans fond ni bordure ; survol d'un voile papier. Pour fermer, supprimer depuis la fiche (texte rouge encre).
- **Rouge :** fond rouge encre, texte blanc, uniquement pour confirmer une suppression.
- **Icône :** carré de 40px.
- **États :** enfoncé de 1px à l'appui, désactivé à 50 % d'opacité. Focus clavier : anneau encre de 2px décalé de 2px, partout.

### Cartes prospect
- **Corner Style :** coin corné (6/6/16/6px).
- **Background :** couleur pleine de l'étape ; filet intérieur d'un pixel en plus pour Nouveau.
- **Shadow Strategy :** carte posée, survolée, décollée (voir Elevation & Depth).
- **Contenu :** nom en body fort, société en label encre seconde, puis une ligne avec icône (email ou téléphone, puis date de relance prévue). Une carte due remplace la ligne de relance par l'étiquette rouge.
- **Internal Padding :** 12px (11px en bas).
- **Comportement :** curseur main, glisser à la souris ou par appui long ; l'original reste à 25 % d'opacité pendant le glisser.

### Étiquette de relance (signature)
Petit morceau de papier rouge épinglé en haut à droite de la carte (7px au-dessus du bord), incliné de 3 degrés, texte étiquette encre : « Auj. », « Hier », « Retard N j ». C'est le seul marqueur d'urgence sur le tableau.

### Bandeau « À relancer » (signature)
Titre en title avec un compteur rond rouge, puis une rangée défilante de post-its rouges inclinés : nom en body fort, puis « Aujourd'hui · Contacté » en label. Chaque post-it ouvre la fiche, et porte à droite un bouton carré de 32px (voile encre à 12 %) pour marquer la relance faite. Sans relance due, il affiche une coche menthe et « Tout est à jour ». Repliable sur mobile.

### Colonnes
En-tête en title avec la pastille d'étape inclinée et le compteur en label à droite. La colonne est transparente au repos ; visée pendant un glisser, elle s'éclaire de sa couleur à 40 % avec un contour intérieur de 2px de son trait ; les autres restent nettes. En pied, « Ajouter ici » est un bouton à bordure pointillée qui se déplie en petit formulaire blanc (champ nom de 36px, deux boutons de 34px).

### Inputs / Fields
- **Style :** fond blanc, filet de 1px, coins de 8px, padding 9px 11px ; libellé en label 800 au-dessus, à 6px.
- **Recherche :** 40px de haut, fond papier creusé (#f1f1ec) sans bordure, icône loupe à gauche, bouton d'effacement à droite quand elle est remplie ; passe en blanc au focus.
- **Focus :** la bordure passe à l'encre.
- **Error :** bordure rouge encre, fond rouge voile, message en label rouge encre sous le champ.
- **Choix d'étape (fiche) :** grille de 3 x 2 boutons de 36px avec pastille ; l'étape cochée prend sa couleur, sa bordure de trait et une graisse 900.
- **Dates rapides :** pilules de 30px (Aujourd'hui, Demain, Dans 1 semaine, Dans 1 mois, Aucune), bordure encre au survol.

### Navigation
- **Barre du haut :** bande blanche avec filet bas, logo en 4 post-its colorés plus un rouge incliné.
- **Filtres :** listes déroulantes de 40px en 700, chevron à droite ; un filtre actif s'inverse (fond encre, texte blanc).
- **Onglets mobiles :** pilules de 36px avec pastille et compteur ; l'onglet courant prend la couleur de son étape. Pendant un glisser ils deviennent 6 cases de dépôt de 52px en couleur pleine, libellés courts, et la case visée grossit à 1.06.

### Fiche, dialogue et toast
- **Fiche :** en-tête teinté de la couleur de l'étape du prospect (la teinte suit le changement d'étape en 300ms), corps blanc, pied avec « Supprimer » à gauche, « Annuler » et « Enregistrer » à droite. Entrée par glissement en 450ms sur la courbe de sortie, voile encre à 28 %.
- **Dialogue de confirmation :** carte blanche de 400px maximum, coins de 16px, titre headline, texte encre seconde, actions à droite (neutre puis rouge). Voile encre à 40 %.
- **Badge « Données d'exemple » (maquette seulement) :** pilule #f1f1ec en 13px/800 dans la barre du haut, suivie d'un bouton fantôme « Réinitialiser » (icône seule sous 760px, avec aria-label). À retirer lors de l'implémentation réelle.
- **Toast :** pastille encre en bas au centre, coins de 12px, texte blanc et bouton « Annuler » sur voile blanc à 14 % ; monte en 400ms et disparaît après 5 secondes.

## Do's and Don'ts

### Do:
- **Do** donner à toute surface liée à une étape sa couleur via `--c` (fond) et `--trait` (trait), dans l'ordre Nouveau, Contacté, Réponse reçue, RDV, Gagné, Perdu.
- **Do** réserver le rouge post-it (#ff6b5e) à la relance due, toujours avec un texte encre ; passer au rouge encre (#b42318) dès que le rouge porte du texte sur fond clair ou une action destructrice.
- **Do** tenir le corps en 15px et 13px et hiérarchiser par la graisse.
- **Do** utiliser le coin corné et la légère inclinaison sur les objets papier uniquement.
- **Do** teinter toutes les ombres d'encre (rgba(35,38,47,...)) et garder la courbe de sortie `cubic-bezier(.16,1,.3,1)` pour les entrées et le recollage.
- **Do** neutraliser transitions, animations et inclinaison des post-its sous `prefers-reduced-motion`.
- **Do** dessiner les icônes en SVG au trait de 2px, bouts arrondis, 18px (14px dans les cartes).

### Don't:
- **Don't** revenir au kanban gris à un seul accent ni à la liste-tableau : les cartes sont en couleur pleine d'étape.
- **Don't** utiliser le rouge comme accent de marque, ni pour autre chose que la relance due ou la suppression.
- **Don't** poser du texte blanc sur une couleur d'étape ou sur le rouge post-it.
- **Don't** incliner ou corner un contrôle d'interface (bouton, champ, filtre, panneau).
- **Don't** ajouter une ombre à la barre, aux colonnes ou aux champs : seul le papier et ce qui flotte en portent.
- **Don't** introduire une seconde famille de caractères.
