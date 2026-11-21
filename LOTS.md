# Lots · Pipeline

Découpage d'`INTENT.md` en lots livrables de bout en bout (écran, service, données, base). Un lot = une chose que l'utilisateur fait du début à la fin. Le lot 1 est le plus petit ; chaque lot laisse l'app utilisable.

Règles de travail : `.claude/rules/` (présentation sans couleur en dur ni accès aux données, service testé avant le code, seule la couche données parle à la base).

Hors périmètre (`INTENT.md`) : pas d'authentification, pas de gestion de droits, un seul utilisateur.

## Décisions

- Contact : au moins un email ou un téléphone est obligatoire. Société, date de relance et notes sont facultatives.
- « Aujourd'hui » est la date du serveur, sans gestion de fuseau horaire. En production (Vercel, UTC), entre minuit et 1 h ou 2 h heure de Paris, la date utilisée est encore celle de la veille : c'est accepté.

---

## Lot 1 : Ajouter un prospect et le retrouver dans la liste

Je remplis nom, société, email ou téléphone, puis je valide. Le prospect apparaît dans la liste à l'étape « Nouveau ». Il est enregistré en base SQLite locale et reste là après redémarrage.

- Étant donné une liste vide, quand j'ajoute « Camille Durand » avec un email, alors elle apparaît dans la liste à l'étape « Nouveau ».
- Étant donné un formulaire sans email ni téléphone, quand je valide, alors l'ajout est refusé avec un message qui dit quoi corriger.
- Étant donné un formulaire sans nom, quand je valide, alors l'ajout est refusé.
- Étant donné un prospect ajouté, quand je redémarre l'app en local, alors il est toujours dans la liste.

## Lot 2 : Faire avancer un prospect d'étape

Depuis la liste, je choisis une nouvelle étape pour un prospect parmi les 6 fixes. Le changement est enregistré et visible tout de suite.

- Étant donné un prospect « Nouveau », quand je le passe à « RDV », alors la liste affiche « RDV ».
- Étant donné un prospect « Gagné », quand je le remets à « Contacté », alors le changement est accepté (passage libre).
- Étant donné une étape hors des 6 prévues, quand le service la reçoit, alors il la refuse.
- Étant donné un changement d'étape, quand je redémarre l'app, alors la nouvelle étape est conservée.

## Lot 3 : Voir qui relancer aujourd'hui

Je saisis une date de relance sur un prospect. Une liste « À relancer aujourd'hui » montre exactement ceux dont la date est aujourd'hui ou passée.

- Étant donné un prospect avec relance aujourd'hui, quand j'ouvre la liste des relances, alors il y figure.
- Étant donné un prospect avec relance hier, quand j'ouvre la liste des relances, alors il y figure aussi.
- Étant donné un prospect avec relance demain, quand j'ouvre la liste des relances, alors il n'y figure pas.
- Étant donné un prospect sans date de relance, quand j'ouvre la liste des relances, alors il n'y figure pas.
- Étant donné aucune relance due, quand j'ouvre la liste des relances, alors un état vide l'indique clairement.

## Lot 4 : Modifier un prospect

J'ouvre un prospect, je change ses informations (nom, société, contact, date de relance, notes), j'enregistre. La liste reflète le changement.

- Étant donné un prospect, quand je modifie sa société et que j'enregistre, alors la liste affiche la nouvelle société.
- Étant donné une modification qui retire à la fois l'email et le téléphone, quand j'enregistre, alors elle est refusée.
- Étant donné que j'ajoute des notes, quand je rouvre le prospect, alors les notes sont là.
- Étant donné que je mets la date de relance à aujourd'hui, quand j'ouvre les relances, alors le prospect y apparaît.

## Lot 5 : Supprimer un prospect

Depuis la liste, je supprime un prospect après confirmation. Il disparaît de la liste et des relances.

- Étant donné un prospect, quand je demande sa suppression, alors une confirmation m'est demandée.
- Étant donné la confirmation, quand je valide, alors il disparaît de la liste et de la liste des relances.
- Étant donné la demande de confirmation, quand j'annule, alors rien n'est supprimé.
- Étant donné une suppression, quand je redémarre l'app, alors le prospect n'est pas revenu.

## Lot 6 : Retrouver mes prospects en production

L'app est déployée sur Vercel avec une base Turso. J'ajoute des prospects en ligne et je les retrouve après un redéploiement. Le passage de SQLite à Turso ne modifie que la couche données.

- Étant donné l'app déployée, quand j'ajoute un prospect, alors il apparaît dans la liste en ligne.
- Étant donné un redéploiement, quand je rouvre l'app, alors mes prospects sont toujours là.
- Étant donné la migration vers Turso, quand je regarde les fichiers modifiés, alors seuls `src/data/` et la configuration d'environnement ont changé.
- Étant donné le dépôt git, quand je le parcours, alors aucun identifiant Turso n'y figure (uniquement dans `.env.local` et les variables Vercel).
