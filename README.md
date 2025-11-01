# BookList App 

Application mobile de gestion de bibliothèque développée avec React Native (Expo).

##  Démarrage Rapide

> ** IMPORTANT :** Avant de lancer l'app, vous DEVEZ avoir l'API Express qui tourne !

### 1. Installer et lancer l'API Backend

```bash
# Nouveau terminal
cd /Users/oussama/Desktop/LIVRE-M1
git clone https://github.com/MaDesOcr/API-BOOKS api-backend
cd api-backend
npm install
npm start
```

 Vous devriez voir : ` API démarrée sur http://localhost:3000`

### 2. Lancer l'application

```bash
# Dans le dossier booklist-app
cd booklist-app
npm start
```

Puis appuyez sur `i` (iOS), `a` (Android) ou `w` (Web)

### 3. C'est parti !

L'application communique avec l'API pour gérer vos livres.


---

##  Architecture du projet

Le projet suit les bonnes pratiques React Native avec une architecture modulaire :

```
booklist-app/
├── App.js                           # Point d'entrée principal
├── src/
│   ├── components/                  # Composants réutilisables
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Checkbox.js
│   │   ├── StatusBadge.js
│   │   └── index.js
│   ├── services/                    # Services API
│   │   ├── api.js                   # Configuration axios
│   │   └── bookService.js           # Service livres
│   ├── styles/                      # Thème et styles globaux
│   │   └── theme.js                 # Couleurs, espacements, etc.
│   ├── navigation/                  # Navigation
│   │   └── AppNavigator.js          # Stack navigator
│   └── screens/                     # Écrans de l'application
│       ├── BookListScreen/
│       ├── AddEditBookScreen/
│       └── BookDetailsScreen/
├── assets/                          # Images et ressources
├── package.json
└── README.md
```

##  Fonctionnalités

###  Base CRUD (Complété)

-  Affichage de la liste des livres (GET /books)
-  Ajout d'un livre (POST /books)
-  Modification d'un livre (PUT /books/:id)
- Suppression d'un livre (DELETE /books/:id)
-  Changement du statut "lu / non lu"
-  Navigation entre écrans (Liste, Ajout/Édition, Détails)

###  Intermédiaire 

-  Notes liées à un livre (GET/POST /books/:id/notes)
-  Favoris avec icône cœur
-  UI améliorée avec thème coloré et messages d'état

### Avancé 

-  Rating (0-5 étoiles)
-  Recherche / filtrage / tri
-  Couverture photo (expo-image-picker)

###  Challenge

- ⏳ Mode offline avec AsyncStorage
- ⏳ Statistiques / Dashboard avec graphiques
- ⏳ Intégration API OpenLibrary
- ⏳ Thèmes clair/sombre

##  Configuration de l'API

L'application se connecte à une API Express locale. 

### Important : Configuration de l'URL

Modifier `src/services/api.js` selon votre plateforme :

**iOS Simulator** : `http://localhost:3000` (déjà configuré)

**Android Emulator** :
```javascript
export const API_BASE_URL = 'http://10.0.2.2:3000';
```

**Appareil physique** : Utiliser l'IP de votre machine
```javascript
export const API_BASE_URL = 'http://192.168.1.100:3000';
```

##  Design System

L'application utilise un thème centralisé dans `src/styles/theme.js` :

### Couleurs
- **Primary** : `#6200ee` (Violet)
- **Secondary** : `#03dac5` (Turquoise)
- **Success** : `#4caf50` (Vert)
- **Warning** : `#ff9800` (Orange)
- **Danger** : `#f44336` (Rouge)

### Composants réutilisables
- `Button` : Boutons avec différentes variantes
- `Input` : Champs de saisie avec label
- `Checkbox` : Cases à cocher
- `StatusBadge` : Badges de statut (Lu/Non lu)

##  Dépendances principales

- `expo` - Framework React Native
- `@react-navigation/native` & `@react-navigation/stack` - Navigation
- `axios` - Requêtes HTTP
- `@react-native-async-storage/async-storage` - Stockage local
- `expo-image-picker` - Sélection d'images
- `react-native-chart-kit` - Graphiques
- `react-native-svg` - Support SVG

##  Documentation supplémentaire

- **QUICK_START.md** - Guide de démarrage rapide
- **SETUP_API.md** - Installation détaillée de l'API
- **API_COMMUNICATION.md** - Architecture et flux de données

## API

L'API Express est fournie ici : https://github.com/MaDesOcr/API-BOOKS

Pour toute question ou bug, contactez votre enseignant.

##  Notes de développement

### Service Pattern
Tous les appels API sont centralisés dans `src/services/` pour faciliter la maintenance.

### Composants réutilisables
Les composants UI sont isolés dans `src/components/` pour favoriser la réutilisation.

### Navigation
La navigation est configurée dans `src/navigation/AppNavigator.js`.

### Styles
Le thème global assure la cohérence visuelle de l'application.
