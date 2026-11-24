# Plan du projet — Marché Frais

## Maquette fonctionnelle

La page d’accueil présente les catégories et les étals. Les autres vues montrent les parcours client, vendeur et administrateur. La maquette met le panier commun au centre : les articles sont regroupés par boutique et validés dans une commande générale.

## Fonctionnalités illustrées

| Espace | Parcours présenté |
| --- | --- |
| Client | Profil démo, recherche, comparaison des vendeurs, panier multi-vendeurs, retrait ou livraison, suivi local |
| Vendeur | Boutique fictive, ajout de produit et photo, prix, unité, stock, commandes, revenu après 5 % |
| Administration | Vue catalogue, vendeurs, commandes et commissions de démonstration |

Les six catégories, le panier multi-vendeurs et la commission de 5 % reprennent le plan fourni. Le panier calcule les sous-totaux par boutique ; la commission est prélevée sur chaque sous-total produit, et non ajoutée au total client. Les frais de livraison de 2 500 FC par vendeur sont une valeur d’exemple modifiable, pas un tarif réel.

## Étapes proposées après validation de la maquette

Ces durées sont une **estimation de planification**, pas un devis commercial. Elles supposent une petite équipe, un périmètre limité à une première zone de Kinshasa et des décisions rapides sur la livraison et le paiement.

| Étape | Contenu | Durée indicative |
| --- | --- | --- |
| 1. Cadrage et base | Règles, comptes avec rôles, profils vendeurs, catalogue, validation des produits | 2–3 semaines |
| 2. Achat multi-vendeurs | Panier commun, commandes générales et sous-commandes, annulation et stocks | 3–5 semaines |
| 3. Livraison et gestion | Frais réels, livreurs, suivi, réclamations et tableaux de bord | 3–5 semaines |
| 4. Paiements et lancement | Intégration fournisseur Mobile Money choisi, commissions, sécurité, recette et mise en ligne | 3–6 semaines |

**Total indicatif : 11 à 19 semaines**, selon l’accès aux API, la validation des comptes marchands, les règles de livraison et le volume de tests. Un devis détaillé doit être établi après le choix des prestataires et la définition des règles de remboursement, de commission, de livraison et de support.

## Architecture de production à décider

- Interface : HTML, CSS et JavaScript (le prototype actuel).
- Serveur : API JavaScript/Node.js ou autre serveur capable de vérifier les utilisateurs, les stocks, les commandes et les rôles. Le prototype actuel n’en possède pas.
- Données et photos : base de données et stockage de fichiers sécurisés, avec sauvegardes.
- Paiements : Mobile Money à intégrer après sélection du prestataire, ouverture du compte marchand et vérification de ses conditions techniques et commerciales. Aucun opérateur n’est connecté dans la démo.
- Hébergement : GitHub Pages peut publier cette démo statique. Une vraie marketplace demandera un hébergement pour le serveur et la base de données ; le coût dépendra du trafic, du stockage, des sauvegardes et du fournisseur retenu.
- Google : aucun compte, propriété, analytics, carte ou connexion Google n’est utilisé par ce projet.
