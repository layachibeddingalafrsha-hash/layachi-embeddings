
KEY
46fb9c390c11426faa91fd422316ab25
Token
976f2bf3-72a0-411d-9446-decbfb0e7a85
Attention :  Utilisez ces identifiants exclusivement sur vos propres applications (web, mobile, etc.). Si nous détectons leur utilisation sur des sites malveillants, votre accès API sera désactivé



Ne partagez jamais ces identifiants avec des sites qui ne vous appartiennent pas. Ces sites peuvent espionner vos ventes, voler vos nouvelles commandes ainsi que les informations de vos clients et de leurs achats. En partageant vos clés API avec des tiers non sécurisés, vous exposez votre entreprise à des risques sérieux, tels que :

Perte de données : Les informations sensibles de vos clients peuvent être volées, ce qui peut entraîner une perte de confiance et nuire à votre réputation.
Fraude : Des acteurs malveillants peuvent utiliser vos clés API pour effectuer des transactions frauduleuses, entraînant des pertes financières.
Violation de la vie privée : Les données personnelles de vos clients peuvent être compromises, ce qui peut enfreindre les régulations sur la protection des données.
Temps d’arrêt : Une utilisation abusive de vos clés API peut surcharger nos serveurs et entraîner des interruptions de service et la désactivation définitive de votre API.
Pour votre sécurité et celle de vos clients, ne partagez jamais vos identifiants API avec des sites non autorisés.

Ce tableau contient vos limites ainsi que votre quota consommé par minute, heure et par jour. Le compteur sera réinitialisé chaque minute pour le quota par minute, chaque heure pour le quota par heure et chaque 24 heures pour le quota quotidien

IMPORTANT :   Toute votre activité et les requêtes sont enregistrées. En cas de tentative de nuire au bon fonctionnement du système API, vous perdrez définitivement l’accès à l’API et votre compte sera banni

Quota
Plafond
Utilisées
Restantes
Requêtes par minute
50
0
50
Requêtes par heure
2000
6
1994
Requêtes par jour
20000
107
19893
Lorsque ces limites de débit sont dépassées, vos demandes échoueront et une erreur 429 « Trop de demandes » sera renvoyée. Vous devrez attendre le prochain intervalle de temps pour réessayer. Consultez les en-têtes HTTP pour savoir quand la limite sera réinitialisée



L'API REST (Representational State Transfer) est un style architectural pour la communication entre systèmes via HTTP. Elle repose sur des principes de statelessness, où chaque requête du client contient toute l'information nécessaire pour comprendre et traiter la requête.

BASE URL

https://ecom-dz.net/Api_v1
Pour sécuriser les échanges, on utilise l'authentification basée sur des headers HTTP. Cette méthode implique l'envoi d'un jeton d'authentification dans l'en-tête de chaque requête. Par exemple :

Header

Key : YOU KEY API
Token : YOU TOKEN API
Tester la Connexion API avec Votre Compte

Utilisez l'URL de base, les paramètres, et les en-têtes d'authentification, et vous recevrez une réponse en JSON

GET /Api_v1/Test 

curl  /Test 
-H "Key: YOUR_KEY" 
-H "Token: YOUR_TOKEN"
Response

{
    "Quota": {
        "Consommer_1min": 1,
        "Consommer_1h": 1,
        "Consommer_24h": 1,
        "Limite_1min": 40,
        "Limite_1h": 1500,
        "Limite_24h": 15000
    },
    "Fournisseur": "Boutique31",
    "Ville": 31
}
Les informations qui vous sont fournies lorsque vous générez l’Key API et le TOKEN doivent être protégées comme toutes les informations d’identification sensibles. À aucun moment il ne doit être partagé ou exposé en JavaScript front-end, par exemple.


Ce endpoint permet d'ajouter de nouvelles commandes, que ce soit une ou plusieurs en même temps.

POST /Api_v1/Colis
Header

Key : YOU KEY API
Token : YOU TOKEN API
Body
{
  "Colis": [
    {    // Colis 1
       "Echange"  : 0 ,  //  Si c'est un colis avec échange, il faut mettre 1, sinon laissez tel quel.
      "Stopdesk" : 1 ,    //  Si c'est une livraison à domicile, laissez-le à 0, sinon pour le bureau ( stopdesk ), il faut mettre 1
      "NomComplet":"Mohamed",
      "Mobile_1":"0770707070",
      "Mobile_2":"",
      "Adresse":"Rue Amir abdel Kader",
      "Wilaya":"12",
      "Commune":"Bureau 2 Tebessa",
      "Article":"Mon Article",
       "Ref_Article" :" AX33 ",
      "NoteFournisseur":"",
      "Total": "9600",
      "ID_Externe": "AA6S", //  Un ID personnalisé ajouté par vous-même pour faire un suivi efficace avec votre application.
      "Source": "Facebook"
    },
  {    // Colis 2
      "Echange" : 1 ,
      "Stopdesk" : 0 ,
      "NomComplet":"Mohmaed",
      "Mobile_1":"0550505050",
      "Mobile_2":"0",
      "Adresse":"Rue bahi amar Es Senia",
      "Wilaya":"31",
      "Commune":"Es Senia",
      "Article":"Mon Article",
      "Ref_Article" :"AX33",
      "NoteFournisseur":"",
      "Total": "1000",
      "ID_Externe": "",
      "Source": ""
    }
  ]
}
Response

{
    "Quota": {
        "Consommer_1min": 4,
        "Consommer_1h": 17,
        "Consommer_24h": 68,
        "Limite_1min": 40,
        "Limite_1h": 1500,
        "Limite_24h": 15000
    },
    "Colis": [
        {
            "Date_Création": "13/08/2024 20:24:08",
            "Tracking": "TC317LHJ",
            "ID_Externe": "",
            "Source": "",
            "label": " SiteWeb/SYSTEM2025_WEB/FR/Fournisseur_A/Page.awp?P1=TC317LHJ&P2=f00381f7-7ddc-4349-bc3e-1d7f23d57a84",
            "Stopdesk": 0,
            "IDWilaya": 31,
            "Echange": 1,
            "Total": 1000,
            "NomComplet": "Mohamed",
            " Mobile_1": "0770707070",
            "Adresse": "Adresse Test",
            "Commune_Bureau": "Commune Test",
            "Article": "Article Test" ,
	   "Ref_Article" :"AX33",
            "NoteFournisseur": "",
            "Date_Action_D": "13/08/2024 20:24:08",
            "Avancement": "En Préparation",
            "Situation": "EnCours",
            "Commentaire": "",
            "Date_Livrée": null
        }
    ]
}       
Les informations qui vous sont fournies lorsque vous générez l’Key API et le TOKEN doivent être protégées comme toutes les informations d’identification sensibles. À aucun moment il ne doit être partagé ou exposé en JavaScript front-end, par exemple.



Modifier les informations

Avec ce Endpoint, vous avez la possibilité de modifier les informations d'un colis tant que le colis est en cours de préparation. Sinon, les modifications ne seront pas prises en compte.

PUT /Api_v1/Colis/ {Tracking}
Header

Key : YOU KEY API
Token : YOU TOKEN API
Body
{
  "Colis":
    {
      "NomComplet":"Mohamed",
      "Mobile_1":"0770707070",
      "Mobile_2":"",
      " Adresse":" Maraval Cité ",
      "Commune":"Oran Maraval",
      "Article":"Article",
      "Ref_Article" :"AX33",
      "NoteFournisseur":"Avant 16h",
      "Total": "1000",
      "ID_Externe": "",
      "Source": ""
    }
}
Les colis prêts à être expédiés

Modifier une liste de colis d'une situation 'En Préparation' à une situation 'En Traitement' pour qu'ils soient prêts à être expédiés. 

Note : après cette modification, il sera impossible de modifier les informations ou de revenir en arrière.

PUT /Api_v1/aExpédier
Header

Key : YOU KEY API
Token : YOU TOKEN API
Body
{
  "Colis" : [
    {
      " Tracking" : "TC076AAA"
    },
     {
      "Tracking" : "TC077AAA"
    }
  ]
}
Suppression des colis

PUT /Api_v1/Supprimer
Header

Key : YOU KEY API
Token : YOU TOKEN API
Body
{
  "Colis" : [
    {
      " Tracking" : "TC076AAA"
    },
     {
      "Tracking" : "TC077AAA"
    }
  ]
}
Les informations qui vous sont fournies lorsque vous générez l’Key API et le TOKEN doivent être protégées comme toutes les informations d’identification sensibles. À aucun moment il ne doit être partagé ou exposé en JavaScript front-end, par exemple.



Vous avez plusieurs filtres pour récupérer les informations sur vos colis. Avant tout, ces endpoints sont là pour récupérer les informations afin que vous puissiez les stocker de votre côté dans vos projets ou plateformes, afin d’éviter la surcharge et la limiter le quota API.

GET /Api_v1/Colis        //  Afficher tous les colis
GET /Api_v1/Colis/Date_Creation/{Date}    // Filtrer à partir de la date de création  (depuis)
GET /Api_v1/Colis/Date_Livree/{Date}    //  Filtrer par date de livraison (depuis)
GET /Api_v1/Colis/Date_last_status{Date}    // Filtrer par date de dernière modification de la situation (depuis)
GET /API_v1/Colis/Tracking/{Tracking}    // Récupérer les informations par Tracking
POSTE /API_v1/Colis/Liste   //  Récupérer les informations d’une liste de trackings. {"Colis":[{"Tracking":"AAA555","Tracking":"AAA666"]}
Header

Key : YOU KEY API
Token : YOU TOKEN API
Page : 1
Comme pour tout endpoint sur notre système, il vous faut la clé (KEY) et le token pour tout échange avec l'API. Pour ces endpoints, vous avez la possibilité de lister les colis en fonction du nombre que vous souhaitez (Liste de) avec un maximum de 100 colis. Vous pouvez également accéder directement à une page spécifique, si elle existe (Page : 1)

Response

{
    "Quota": {
        "Consommer_1min": 1,
        "Consommer_1h": 1,
        "Consommer_24h": 1,
        "Limite_1min": 40,
        "Limite_1h": 1500,
        "Limite_24h": 15000
    }
    "Nb_Colis": 1   // Total des Colis 
    "Nb_Page": 1,   // Total des pages
    "Current_Page": 1,   // Page Active
    "Colis": [
        {
            "Date_Création_D": " 01/01/2025 08:00:00",
            "Tracking": "TC033AAA",
            "ID_Externe": "AA96S",
            "label": "SiteWeb/SYSTEM2025_WEB/FR/Fournisseur_A/Page.awp?P1=TC033AAA&P2=f6d5a3ff-a207-4e93-b5b7-26a8554df6f2",
            "Stopdesk": 1,
            "IDWilaya": 31,
            "Echange": 0,
            "Total": 9600,
            "NomComplet": "Mohamed",
            "Mobile_1": "0770707070",
            "Adresse": "39 Rue Bahi Amar Es-Senia",
            "Commune_Bureau": "ORAN 1",
            "Article": "New Balance 500 41.5",
	   "Ref_Article" :"AX33",
            "NoteFournisseur": "",
            "Date_Action_D": "01/01/2025 10:10:10",
            "Avancement": "Au Bureau",
            "Situation": "Ne Réponde pas #1",
            "Commentaire": "",
            "Date_Livrée": null
        }
]
}
Avancements et les Situations

En Préparation
En Traitement
Au Bureau
Sortir en livraison
En livraison
Dispatcher
Retour Fournisseur
Récupérer
Perdu

EnCours
Ne Réponde pas #1
Ne Réponde pas #2
Ne Réponde pas #3
Annuler
Annuler x3
Attend Information
Reporté
Reporté Commune Erronée
Reporté Wilaya Erronée
BIZ
Appel Tel
SMS Envoyé
Recouvert
Les informations qui vous sont fournies lorsque vous générez l’Key API et le TOKEN doivent être protégées comme toutes les informations d’identification sensibles. À aucun moment il ne doit être partagé ou exposé en JavaScript front-end, par exemple.



Vous avez plusieurs filtres pour récupérer les informations sur vos colis. Avant tout, ces endpoints sont là pour récupérer les informations afin que vous puissiez les stocker de votre côté dans vos projets ou plateformes, afin d’éviter la surcharge et la limiter le quota API.

GET /Api_v1/Colis        //  Afficher tous les colis
GET /Api_v1/Colis/Date_Creation/{Date}    // Filtrer à partir de la date de création  (depuis)
GET /Api_v1/Colis/Date_Livree/{Date}    //  Filtrer par date de livraison (depuis)
GET /Api_v1/Colis/Date_last_status{Date}    // Filtrer par date de dernière modification de la situation (depuis)
GET /API_v1/Colis/Tracking/{Tracking}    // Récupérer les informations par Tracking
POSTE /API_v1/Colis/Liste   //  Récupérer les informations d’une liste de trackings. {"Colis":[{"Tracking":"AAA555","Tracking":"AAA666"]}
Header

Key : YOU KEY API
Token : YOU TOKEN API
Page : 1
Comme pour tout endpoint sur notre système, il vous faut la clé (KEY) et le token pour tout échange avec l'API. Pour ces endpoints, vous avez la possibilité de lister les colis en fonction du nombre que vous souhaitez (Liste de) avec un maximum de 100 colis. Vous pouvez également accéder directement à une page spécifique, si elle existe (Page : 1)

Response

{
    "Quota": {
        "Consommer_1min": 1,
        "Consommer_1h": 1,
        "Consommer_24h": 1,
        "Limite_1min": 40,
        "Limite_1h": 1500,
        "Limite_24h": 15000
    }
    "Nb_Colis": 1   // Total des Colis 
    "Nb_Page": 1,   // Total des pages
    "Current_Page": 1,   // Page Active
    "Colis": [
        {
            "Date_Création_D": " 01/01/2025 08:00:00",
            "Tracking": "TC033AAA",
            "ID_Externe": "AA96S",
            "label": "SiteWeb/SYSTEM2025_WEB/FR/Fournisseur_A/Page.awp?P1=TC033AAA&P2=f6d5a3ff-a207-4e93-b5b7-26a8554df6f2",
            "Stopdesk": 1,
            "IDWilaya": 31,
            "Echange": 0,
            "Total": 9600,
            "NomComplet": "Mohamed",
            "Mobile_1": "0770707070",
            "Adresse": "39 Rue Bahi Amar Es-Senia",
            "Commune_Bureau": "ORAN 1",
            "Article": "New Balance 500 41.5",
	   "Ref_Article" :"AX33",
            "NoteFournisseur": "",
            "Date_Action_D": "01/01/2025 10:10:10",
            "Avancement": "Au Bureau",
            "Situation": "Ne Réponde pas #1",
            "Commentaire": "",
            "Date_Livrée": null
        }
]
}
Avancements et les Situations

En Préparation
En Traitement
Au Bureau
Sortir en livraison
En livraison
Dispatcher
Retour Fournisseur
Récupérer
Perdu

EnCours
Ne Réponde pas #1
Ne Réponde pas #2
Ne Réponde pas #3
Annuler
Annuler x3
Attend Information
Reporté
Reporté Commune Erronée
Reporté Wilaya Erronée
BIZ
Appel Tel
SMS Envoyé
Recouvert
Les informations qui vous sont fournies lorsque vous générez l’Key API et le TOKEN doivent être protégées comme toutes les informations d’identification sensibles. À aucun moment il ne doit être partagé ou exposé en JavaScript front-end, par exemple.




Avec ce endpoint, vous avez la possibilité de voir vos tarifs qui sont appliqués à vos colis ainsi que les wilayas qui disposent de la livraison à domicile et au bureau.

GET /Api_v1/Tarification
Header

Key : YOU KEY API
Token : YOU TOKEN API
Response

{
    "Quota": {
        "Consommer_1min": 1,
        "Consommer_1h": 1,
        "Consommer_24h": 1,
        "Limite_1min": 40,
        "Limite_1h": 1500,
        "Limite_24h": 15000
    },
    "Wilaya" : [
        {
            "ID": 1,
            "Libellé": "Adrar",
            "Domicle": true,
            "Stopdesk": true,
            "Tarfi_Domicle": 1600,
            "Tarfi_Stopdesk": 300,
            "Tarfi_Annuler": 150
        },
        {
            "ID": 2,
            "Libellé": "Chlef",
            "Domicle": true,
            "Stopdesk": false,
            "Tarfi_Domicle": 500,
            "Tarfi_Stopdesk": 300,
            "Tarfi_Annuler": 150
        },
        {
            "ID": 3,
            "Libellé": "Laghouat",
            "Domicle": false,
            "Stopdesk": false,
            "Tarfi_Domicle": 500,
            "Tarfi_Stopdesk": 300,
            "Tarfi_Annuler": 150
        },
......
Les informations qui vous sont fournies lorsque vous générez l’Key API et le TOKEN doivent être protégées comme toutes les informations d’identification sensibles. À aucun moment il ne doit être partagé ou exposé en JavaScript front-end, par exemple.