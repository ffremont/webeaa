# WebEaa - Visualiseur d'Images Astronomiques

Bienvenue sur **WebEaa**, une application web permettant de visualiser les images astronomiques sauvegardées sur un Raspberry Pi via un hotspot. Cette application surveille un répertoire spécifié pour de nouvelles images .png et les rend accessibles via une interface web.

## Fonctionnalités

- **Visualisation en direct** : Les images sauvegardées dans le répertoire sont affichées sur une page web.
- **Téléchargement d'images** : Les utilisateurs peuvent télécharger la dernière image directement depuis l'interface.
- **Surveillance des fichiers** : L'application surveille les nouvelles images ajoutées au répertoire et les affiche automatiquement.
- **Watermarking** : Un filigrane personnalisé est ajouté aux images affichées.

## Prérequis

- Node.js
- Raspberry Pi configuré avec un hotspot
- Serveur web (optionnel)

## Installation

1. **Cloner le dépôt**

   ```sh
   git clone <url-du-dépôt>
   cd <nom-du-répertoire>
   ```

2. **Installer les dépendances**

   ```sh
   npm install
   ```

3. **Démarrer l'application**

   ```sh
   npm start
   ```

## Utilisation

### Démarrage du serveur

Pour démarrer le serveur, exécutez la commande suivante :

```sh
npm start
```

Le serveur sera accessible à l'adresse `http://localhost:3000/live`.

### Interface Web

Accédez à l'interface web via votre navigateur en entrant l'URL suivante :

```
http://localhost:3000/live
```

### Téléchargement d'images

Un bouton de téléchargement est disponible pour récupérer la dernière image affichée.

## Configuration

### Variables d'environnement

- **PORT** : Le port sur lequel l'application écoute (défaut : 3000).
- **EAA_PATH** : Chemin à scruter (défaut : .).

### Personnalisation du Filigrane

Le filigrane peut être personnalisé en passant une chaîne de caractères en argument lors de l'exécution du script :

```sh
npm start "Votre filigrane personnalisé"
```

Si aucun filigrane n'est spécifié, le texte par défaut suivant sera utilisé :

```
"EAA $at | $name | F. FREMONT | tetesenlair.net"
```

> **$at** correspond à la date et l'heure et **$name** au nom du fichier
