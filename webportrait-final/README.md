# Webportrait — loft plain-pied, version 6

Base Three.js locale, sans framework ni installation npm. Sept espaces au même
niveau, avec toit et façade retirés. Aucun contenu personnel ajouté.

## Installer la mise à jour

Si tu n'as pas modifié le code, remplace les fichiers de ton dossier par ceux de
cette archive, puis actualise le navigateur avec Ctrl+F5.
Si tu as personnalisé des fichiers, garde une copie avant de les remplacer.

Pour démarrer : ouvre le dossier qui contient index.html dans l'Explorateur,
écris powershell dans sa barre d'adresse, puis exécute :

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Laisse le terminal ouvert et visite http://localhost:8000. Ctrl+C arrête le serveur.
Ne double-clique pas sur index.html : les modules JavaScript nécessitent HTTP.

## Historique — fichiers modifiés dans la version 3

| Fichier | Changement |
|---|---|
| js/rooms.js | Nouvelle implantation X/Z, tous les Y à zéro, grenier remplacé par archives |
| js/house.js | Dalle continue en L, volumes ouverts, fenêtres, cloisons partielles, réserve et terrasse |
| js/camera.js | Vue trois quarts et cadrage calculé selon largeur ET profondeur |
| js/main.js | Cible de l'éclairage recentrée, portée caméra adaptée |
| index.html | Titre du loft |
| README.md | Guide actualisé |

Les fichiers interactions.js, panel.js et interaction-content.js conservent
leur fonctionnement. Les trois objets exemples gardent leurs identifiants.
CSS, bibliothèque Three.js et médias restent compatibles.

## Implantation des pièces

X : gauche/droite. Y : hauteur. Z : arrière/avant (positif vers la façade ouverte).
Dimensions en unités arbitraires de maquette.

| Espace | ID | Centre X | Y | Centre Z | Largeur | Profondeur |
|---|---|---:|---:|---:|---:|---:|
| Entrée | entree | 5 | 0 | 0,5 | 3,2 | 4,8 |
| Chambre | chambre | −4,8 | 0 | −2,8 | 5,4 | 4,8 |
| Bureau | bureau | 0,7 | 0 | −3 | 5,4 | 4,4 |
| Atelier | atelier | −5,2 | 0 | 2,1 | 4,6 | 4,6 |
| Salon | salon | 0,3 | 0 | 2,4 | 6,2 | 5,4 |
| Réserve | archives | 5 | 0 | −3,6 | 3,2 | 3,2 |
| Jardin | jardin | 7,1 | 0 | 5,5 | 7,6 | 5 |

La chambre et le bureau occupent l'arrière. L'atelier et le salon se prolongent
vers la façade ouverte. L'entrée longe la réserve et donne sur le jardin.
Le parquet et la dalle assurent la continuité ; les tapis, le mobilier et les
cloisons courtes distinguent les usages. Le jardin reste ouvert, avec une terrasse.
La réserve conserve un fond et une bibliothèque plus sombres au même niveau.

## Caméra recommandée (déjà appliquée)

- Perspective : champ vertical de 38°.
- Cible générale : [1.1, 0.7, 1.3].
- Azimut : 0.62 rad, soit 35,5° par rapport à +Z.
- Angle polaire : 0.90 rad, soit une élévation de 38,4° au-dessus du sol.
- Glissement horizontal : azimut de 0.43 à 0.81 rad.
- Glissement vertical : angle polaire de 0.80 à 1.03 rad (élévation 31° à 44°).
- Amortissement exponentiel : 6, indépendant de la fréquence d'affichage.
- Distance calculée selon les huit coins du volume à cadrer, avec 10 % de marge.

Réglages centralisés dans CAMERA_SETTINGS, au début de js/camera.js.
Le cadrage général utilise bounds ; actualise ces limites si tu agrandis le loft.
Chaque zoom utilise les dimensions et la cible de la pièce déclarée dans rooms.js.

## Utilisation

Survol : éclairage léger. Clic sur une pièce : zoom fluide.
Glissement : légère rotation. Vue générale ou Échap : retour.
Un glissement n'est pas interprété comme un clic.

Dans le bureau, clique sur l'ordinateur. Dans la chambre, clique sur le carnet
ou la lampe. Le panneau se ferme avec ×, Échap ou un clic extérieur.
Échap ferme d'abord le panneau ; une deuxième pression revient à la vue générale.
Les petits boutons Objets dans la pièce sélectionnée offrent aussi l'accès au clavier.

## Réutiliser les objets interactifs

Dans house.js, crée un Mesh ou un Group dans le groupe de la pièce, puis ajoute
sa référence AVANT la collecte des matériaux et roomId :

```js
const souvenir = box(g, [.5, .5, .5], [1, .4, 1], '#8eac9c');
objects.set('salon-souvenir', souvenir);
```

Dans le tableau INTERACTIVE_OBJECTS de js/interaction-content.js :

```js
{
  id: 'salon-souvenir',
  roomId: 'salon',
  name: 'Mon objet',
  text: 'Texte temporaire.',
  image: null, // ou {src:'assets/images/photo.jpg', alt:'Description'}
  sound: null, // ou 'assets/sounds/son.mp3'
  action: {
    label: 'Tester',
    run: ({object, setText, close, requestRender}) => {
      setText('Action exécutée.');
    },
  },
}
```

Image, son et action sont facultatifs. Place les médias aux chemins indiqués,
relatifs à index.html. Le son se lance volontairement via Écouter et s'arrête
à la fermeture. Aucun son n'est fourni. Les textes sont affichés comme texte brut.
Les actions peuvent être asynchrones ; requestRender() actualise la scène après
un changement. Le gestionnaire réserve position/scale/emissive à ses animations :
positionne et dimensionne l'objet avant l'inscription. Pour un éclat persistant,
utilise material.userData.baseGlow, comme la lampe de démonstration.

## Performances

Géométries simples, pas de textures photo ni de post-traitement. Ombres 1024 px,
pixel ratio limité à 1,5 et rendu au repos lorsque rien ne bouge. Les préférences
de réduction des mouvements sont respectées. WebGL 2 est requis.
Pour un PC lent, limite le pixel ratio à 1 ou désactive les ombres dans main.js.

Documentation Three.js : https://threejs.org/docs/

## Vérifications réalisées

Chargement dans Chromium avec WebGL, sept étiquettes visibles à 1440 × 960 et
390 × 844, zoom vers le bureau et la chambre, ouverture du panneau ordinateur,
exécution de son action, fermeture avec Échap sans quitter la pièce, retour général,
action allumer la lampe et fermeture avec la croix. Aucune erreur JavaScript
observée pendant ce parcours. Syntaxe contrôlée pour tous les modules.
Le rendu a été inspecté en vue générale, en zoom bureau et sur écran étroit.
Ces tests ne constituent pas une mesure de FPS sur ton PC.

## Version 4 — repérer les interactions

Chaque objet déclaré dans INTERACTIVE_OBJECTS reçoit automatiquement un bouton
« + » au-dessus de son volume. Survoler le bouton ou l'objet affiche la même
indication et met l'objet en valeur ; cliquer ouvre le même panneau.
Les marqueurs sont accessibles avec Tab puis Entrée/Espace.

- Nouveau module `js/markers.js` : projection, boutons et vérification des obstacles.
- `js/main.js` : raccordement à la boucle de rendu et aux interactions existantes.
- `js/interactions.js` : texte de découverte commun aux objets et aux marqueurs.
- `js/interaction-content.js` : indications temporaires des trois objets.
- `css/style.css` : cercles discrets, pulsation légère et curseur main.

La maison, les pièces et le module caméra n'ont pas été modifiés par cette étape.

Champs facultatifs dans une déclaration :

```js
hint: 'Découvrir mon projet', // texte affiché au survol et nom accessible
markerOffset: 0.35,          // distance au-dessus du sommet de l'objet
```

Sans ces champs, le texte est « Découvrir : nom de l'objet » et la hauteur vaut
0,35 unité. La position est calculée à partir du volume du Mesh ou du Group.
Les marqueurs suivent donc aussi l'animation de survol et les changements caméra.

Un marqueur est masqué si son objet est invisible, hors champ ou caché par un
obstacle. Le centre et les bords du marqueur sont également testés contre la
maison : un marqueur peut disparaître près d'un obstacle plutôt que le traverser.
Ils sont temporairement masqués pendant le glissement ou l'ouverture d'un panneau.

La pulsation est en CSS et respecte la réduction des mouvements. Elle ne relance
pas continuellement le rendu WebGL. Les tests d'obstacles sont effectués lors des
rendus nécessaires aux mouvements de caméra, aux survols ou aux redimensionnements.
Aucune dépendance supplémentaire.

Vérifications dans Chromium : trois marqueurs visibles sur ordinateur, clic sur
ordinateur/carnet/lampe, actions et fermetures conservées, déplacement des marqueurs
avec la caméra, aucun panneau ouvert par un glissement, masquage derrière un mur
bas ou haut, réapparition après retrait du mur et masquage d'un objet invisible.

## Version 5 — enrichissement du diorama existant

Cette mise à jour ne déplace aucune pièce et ne modifie ni la caméra ni les
identifiants, contenus, panneaux et marqueurs des trois objets interactifs.

- Entrée : miroir rond, patères, chaussures et vase sur la console.
- Chambre : tapis, plaid, coussins, cadre et détails des tiroirs du chevet.
- Bureau : livres sur les étagères, tasse, crayons, carnet de bureau, tapis et pied de siège.
- Atelier : tapis de découpe, marteau, règle, rouleau, supports du panneau et tabouret.
- Salon : coussins, assises textiles, lampadaire, petit meuble bas, vases et tasse.
- Réserve : montants d'étagères, sangles du coffre et panier de livres.
- Jardin : banc, tasses, jardinière fleurie, lanternes basses et pots coniques.
- Architecture : plinthes et encadrements sur les murs déjà présents.

`js/decor.js` est le nouveau module de décoration appelé par `house.js`.
Les accessoires ne sont pas inscrits dans le registre interactif : aucun nouveau
panneau ou marqueur n'est créé. Cliquer dans ces zones garde la navigation de pièce
existante. Pour modifier un décor, cherche le bloc `def.id` correspondant.

Les petites géométries sont fusionnées par couleur et type de matière dans chaque
pièce. Trois textures de relief procédurales 64 × 64 sont partagées : bois, tissu
et enduit. Elles ne nécessitent aucun téléchargement. La céramique et le métal
utilisent des rugosités différentes ; les matières restent mates et low-poly.

L'exposition a été réduite pour préserver les couleurs ; la lumière principale
est chaude et une lumière d'appoint froide révèle les volumes. Seule la lumière
principale projette des ombres (1024 px), sans post-traitement ni lumières ajoutées
pour chaque lampe. Les lanternes sont des décors, pas des lumières dynamiques.

Une légère oscillation du feuillage fonctionne uniquement dans la vue Jardin.
Elle est interrompue au retour général, pendant un panneau et lorsque l'onglet est
masqué ; elle est désactivée avec la préférence système de réduction des mouvements.
Le rendu retrouve son fonctionnement à la demande hors de cette vue animée.

Vérifications : sept pièces parcourues dans Chromium, trois marqueurs visibles en
vue générale, panneaux et actions de l'ordinateur et de la lampe, ouverture du
carnet, vues générales et zooms inspectés, aucune erreur JavaScript observée.
Scène mesurée : 283 maillages et environ 11 844 triangles, dont 84 lots décoratifs.
L'implantation des pièces, la caméra et le code des interactions/marqueurs ont été
comparés à la version précédente et conservés à l'identique. Les FPS dépendent
de la machine ; aucune mesure de performance sur ton PC n'est présumée.

Fichiers ajoutés/modifiés : `js/decor.js`, `js/house.js`, `js/main.js`, `README.md`.


## Version 6 — les sept supports du portrait PPP

La disposition des pièces et la caméra restent inchangées. Les marqueurs « + »,
le survol et les raccourcis d’objets donnent accès aux mêmes contenus.

| Emplacement | Objet | Présentation |
|---|---|---|
| Entrée | Miroir | Page de présentation |
| Chambre | Carnet sur le lit | Carnet avec sommaire et pages à tourner |
| Bureau | Ordinateur | Écran avec onglets/dossiers |
| Salon | Album sur la table | Page des passions |
| Atelier | Dossier sur l’établi | Page des réalisations |
| Réserve / archives | Carton | Feuilles à parcourir |
| Jardin | Carnet sur la table | Page des projets d’avenir |

Le grenier est représenté par la réserve existante, toujours de plain-pied.
La lampe conserve son ancienne action. Les décorations ne deviennent pas
interactives automatiquement. Aucun renseignement personnel n’est inventé :
les textes vides affichent « À compléter » et une indication.

### Où écrire les textes et ajouter les médias

Tout le contenu PPP se trouve dans **js/portrait-content.js**.
Chaque rubrique utilise `section(titre, indication, texte, medias)`.
Les deux derniers arguments sont facultatifs. Pour remplir une rubrique,
remplace par exemple :

```js
section('Présentation', 'Ton prénom, ton âge et ta ville.'),
```

par :

```js
section(
  'Présentation',
  'Ton prénom, ton âge et ta ville.',
  `Écris ici ta présentation.
Tu peux écrire plusieurs paragraphes.`,
  [
    {
      type: 'image',
      src: 'assets/images/portrait.jpg',
      alt: 'Description de la photo',
      caption: 'Légende de la photo',
      credit: 'Photo personnelle',
    },
    {
      type: 'audio',
      src: 'assets/sounds/extrait.mp3',
      label: 'Écouter cet extrait',
      transcript: 'Transcription facultative',
    },
    { type: 'link', url: 'https://exemple.fr', label: 'Voir mon projet' },
  ],
),
```

Ces noms de fichiers sont des exemples : ajoute tes propres fichiers et adapte
les chemins. Place photos, illustrations et captures dans `assets/images/` et
crée `assets/sounds/` pour les sons. Les chemins sont relatifs à `index.html`.
Toutes les rubriques acceptent les trois types de médias, y compris les pages
du carnet et les onglets de l’ordinateur. Tu peux ajouter des sections : le
nombre de pages s’adapte automatiquement. Les textes sont du texte brut, pas du HTML.

### Navigation et fichiers concernés

- Carnet et archives : boutons Précédente / Suivante ou flèches du clavier.
- Ordinateur : onglets cliquables, flèches du clavier, Début / Fin.
- Fermer : croix, Échap ou clic en dehors de la fenêtre.
- Les sons se lancent volontairement et s’arrêtent au changement de page ou à la fermeture.
- Les animations de lecture respectent la préférence de réduction des mouvements.

`house.js` contient les supports 3D ; `decor.js` retire les doublons décoratifs du
miroir et du carton. `interaction-content.js` relie chaque objet à sa rubrique.
`portrait-content.js` contient les contenus ; `portrait-reader.js` construit les
quatre présentations. `panel.js` les intègre au panneau existant et `style.css`
contient leur habillage responsive. Aucune dépendance supplémentaire.
