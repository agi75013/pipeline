# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Une seule personne : un founder solo qui prospecte lui-même. Il utilise Pipeline autant sur ordinateur (sessions de prospection au bureau) que sur mobile (entre deux rendez-vous, au doigt). Son travail : noter un prospect, le faire avancer d'étape, savoir chaque matin qui relancer.

## Product Purpose

Un mini CRM de prospection personnel. Il remplace le tableur ou la mémoire : chaque prospect a une étape et une date de relance, et la liste « À relancer aujourd'hui » dit quoi faire maintenant. Réussite : aucune relance oubliée, et une vue d'ensemble du pipeline en un coup d'œil.

## Positioning

Volontairement minimal : 6 étapes fixes, un seul utilisateur, aucune configuration. Là où les CRM du marché demandent paramétrage et équipe, Pipeline s'utilise dès la première minute.

## Operating Context

- Rituel quotidien : ouvrir l'app, traiter les relances dues (aujourd'hui ou en retard), faire avancer les prospects.
- Usage en double contexte : écran large (vue d'ensemble des 6 étapes) et téléphone (consultation et mise à jour rapide).
- Données personnelles de prospects (noms, emails, téléphones).

## Capabilities and Constraints

- Prospect : nom (obligatoire), société, email ou téléphone (au moins un), étape, date de relance, notes.
- Étapes fixes, dans l'ordre : Nouveau, Contacté, Réponse reçue, RDV, Gagné, Perdu. Passage libre d'une étape à n'importe quelle autre.
- À relancer : date de relance aujourd'hui ou antérieure, date du serveur sans fuseau.
- Ajouter, modifier, supprimer (avec confirmation) un prospect.
- Stack : Next.js 16, shadcn/ui sur Base UI, Tailwind v4, SQLite local puis Turso, déploiement Vercel. Architecture 3 couches (présentation, service, données).
- Hors périmètre : authentification, droits, multi-utilisateur.
- Recherche et filtres par relance : validés par l'utilisateur le 2026-11-23 et inscrits dans `INTENT.md`.

## Brand Commitments

Nom : Pipeline. Interface et textes en français.

## Evidence on Hand

Aucun témoignage, client ou chiffre. Les données d'exemple (`[Exemple]` dans les notes de `pipeline.db`) sont fictives.

## Product Principles

1. Ce qu'il faut faire aujourd'hui passe avant tout le reste.
2. Changer d'étape doit coûter un geste, sur ordinateur comme au doigt.
3. Zéro configuration : les 6 étapes sont un fait, pas un réglage.
4. Saisie minimale : nom et un moyen de contact suffisent.
