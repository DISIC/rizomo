# Ajout de plugins de groupe


## Configuration

- Une section est dédiée dans le fichier `config/settings.development.json`.
Par exemple :
```
    "groupPlugins": {
      "rocketChat": {
        "enable": true,
        "URL": "https://chat.appseducation.fr",
        "groupURL": "[URL]/group/[GROUPSLUG]",
        "enableChangeName": true
      },
      "nextcloud": {
        "enable": true,
        "URL": "https://nextcloud.appseducation.fr",
        "groupURL": "[URL]/apps/files/?dir=/[GROUPNAME]",
        "enableChangeName": false
      }
    }
```
- `enable` permet de préciser si le plugin est activé ou non dans laboite
- Lors de l'utilisation de la chaine `groupURL`, des remplacements de chaines interviendront :
  - la partie `[URL]` sera remplacée par l'`URL` du plugin.
  - la partie `[GROUPNAME]` sera remplacée par le nom du groupe.
  - la partie `[GROUPSLUG]` sera remplacée par le slug du groupe.
- `enableChangeName` détermine si on peut renommer le nom d'un goupe qui utilise ce plugin. Si plusieurs plugins sont associés à un groupe, la possibilité de changer le nom du groupe sera calculée à partir de tous les `enableChangeName` concernés.
- TODO: envisager d'avoir une icone spécifique pour le bouton d'accès au plugin


## Fichiers de Hook

- Les fichiers de Hook sont à placer dans le répertoire `app/imports/api/appclients`.
- Ils utilisent les possibilités offertes par le projet : https://atmospherejs.com/seba/method-hooks (https://github.com/Meteor-Community-Packages/meteor-method-hooks).


## Chaine de caractères à rajouter dans les traductions

Les fichiers de traduction `app/i18n/*.i18n.json` comportent une section `api` dans laquelle doivent être placées les chaines de caractères suivantes :
```
    "nextcloud": {
        ...
      "enablePluginForGroup": "Créer le groupe dans Nextcloud",
      "buttonLinkPlugin": "Accéder au partage Nextcloud"
    },
    "rocketChat": {
        ...
      "enablePluginForGroup": "Créer le groupe dans RocketChat",
      "buttonLinkPlugin": "Discuter dans RocketChat"
    },
```

## Modifications d'interface utilisateur apportées par les plugins de groupe

- Page de création/modification d'un groupe : ajout de case à cocher pour chaque plugin de groupe activé (`enable`) pour préciser si le groupe en question utilisera le plugin.
- Page de consultation d'un groupe (en tant que membre ou animateur) : ajout de bouton de lien vers les services du plugins (`groupURL`)