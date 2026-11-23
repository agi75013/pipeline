# Intention · Pipeline

## Produit
Un mini CRM de prospection pour une seule personne.
Je note mes prospects, je les fais avancer d'étape en étape, je sais qui relancer aujourd'hui.

### Prospect
Un prospect a : un nom, une société, un email ou un téléphone, une étape, une date de relance, des notes.

### Étapes
Les étapes sont fixes : Nouveau, Contacté, Réponse reçue, RDV, Gagné, Perdu.
Un prospect peut passer librement d'une étape à n'importe quelle autre.

### Relance
La date de relance est saisie par moi.
Un prospect est à relancer aujourd'hui si sa date de relance est aujourd'hui ou antérieure.

### Gestion des prospects
Je peux ajouter, modifier et supprimer un prospect.

### Recherche
Je peux rechercher un prospect (nom, société, email, téléphone) et filtrer la liste par état de relance (à relancer, en retard, prévue, sans relance).

## Architecture
Une architecture en 3 couches : présentation, service, données.
La présentation affiche et collecte les saisies, sans règle métier.
Le service porte les règles métier : changement d'étape et calcul des prospects à relancer.
Les données assurent la lecture et l'écriture des prospects.
Seule la couche données parle à la base.
Les règles métier ont des tests unitaires.

## Contraintes
Next.js, composants shadcn, déploiement sur Vercel.
Base légère de type SQLite, avec un service managé comme Turso comme cible de migration.
Un seul utilisateur.

## Hors périmètre
Pas d'authentification, pas de gestion de droits, pas de multi-utilisateur.
L'application déployée est donc accessible à toute personne connaissant son adresse, et elle contient des données personnelles : ce risque est assumé.

## Critères d'acceptation
- J'ajoute un prospect, il apparaît dans la liste.
- Après redémarrage de l'app, en local comme en production, mes prospects sont toujours là.
- Je modifie ou je supprime un prospect, la liste reflète le changement.
- La liste des prospects à relancer aujourd'hui contient exactement ceux dont la date de relance est aujourd'hui ou antérieure.
- Passer à une base managée ne modifie que la couche données.
