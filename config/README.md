# Configuration

Copy `settings-development.json.sample` to `settings-development.json` and update values matching your configuration

## public:

| Key                                      | Type     | Default value                        | Description                                                                                 |
| ---------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| enableKeycloak                           | boolean  | false                                | If true, keycloak is enabled                                                                |
| keycloakUrl                              | string   | ""                                   | Keycloak URL                                                                                |
| keycloakRealm                            | string   | ""                                   | Keycloak Realm                                                                              |
| theme                                    | string   | "laboite"                            | laboite or rizomo theme                                                                     |
| enableBlog                               | boolean  | false                                | enable all features and links for the blog                                                  |
| laboiteBlogURL                           | string   | ""                                   | Laboite Blog URL                                                                            |
| enableBBB                                | boolean  | true                                 | If true, Big Blue Button is enabled                                                         |
| BBBUrl                                   | string   | ""                                   | Big Blue Button URL                                                                         |
| minioSSL                                 | boolean  | false                                | If true, minio is SSL                                                                       |
| minioPort                                | number   | null                                 | Minio port                                                                                  |
| minioEndPoint                            | string   | ""                                   | Minio End Point                                                                             |
| minioBucket                              | string   | ""                                   | Minio Bucket                                                                                |
| imageFilesTypes                          | [string] | ["svg", "png", "jpg", "gif", "jpeg"] | Allowed file extensions for images                                                          |
| audioFilesTypes                          | [string] | ["wav", "mp3", "ogg"]                | Allowed file extensions for sounds                                                          |
| videoFilesTypes                          | [string] | ["mp4", "webm", "avi", "wmv"]        | Allowed file extensions for videos                                                          |
| textFilesTypes                           | [string] | ["pdf", "odt", "txt", "docx"]        | Allowed file extensions for documents                                                       |
| otherFilesTypes                          | [string] | ["csv"]                              | Allowed file extensions for other files                                                     |
| minioFileSize                            | number   | 500000                               | Maximum file size when uploading services images in admin space                             |
| minioStorageFilesSize                    | number   | 3000000                              | Maximum file size when uploading media in user space                                        |
| maxMinioDiskPerUser                      | number   | 1000000                              | Maximum disk capacity per user                                                              |
| NotificationsExpireDays                  | object   | {}                                   | Number of days to keep notications by type (null or 0 for infinite)                         |
| NotificationsExpireDays.setRole          | number   | null                                 | Number of days to keep setRole notications (null or 0 for infinite)                         |
| NotificationsExpireDays.unsetRole        | number   | null                                 | Number of days to keep unsetRole notications (null or 0 for infinite)                       |
| NotificationsExpireDays.request          | number   | null                                 | Number of days to keep request notications (null or 0 for infinite)                         |
| NotificationsExpireDays.group            | number   | null                                 | Number of days to keep group notications (null or 0 for infinite)                           |
| NotificationsExpireDays.default          | number   | null                                 | Number of days to keep no type notications (null or 0 for infinite)                         |
| groupPlugins                             | object   | {}                                   | External plugins for group                                                                  |
| PLUGINNAME                               | object   | {}                                   | General group plugin settings, see below "nextcloud" and "rocketChat" for specific settings |
| groupPlugins.PLUGINNAME.enable           | boolean  | false                                | If true, the group plugin is enabled                                                        |
| groupPlugins.PLUGINNAME.URL              | string   | ""                                   | Group plugin URL                                                                            |
| groupPlugins.PLUGINNAME.groupURL         | string   | ""                                   | [URL]/group/[GROUPSLUG]" "[URL]/apps/files/?dir=/[GROUPNAME]                                |
| groupPlugins.PLUGINNAME.enableChangeName | boolean  | true                                 | If true, changing the group name for this group plugin is possible                          |

## keycloak:

| Key           | Type     | Default value | Description             |
| ------------- | -------- | ------------- | ----------------------- |
| pubkey        | string   | ""            | Keycloak public key     |
| client        | string   | "sso"         | Keycloak client type    |
| adminEmails   | [string] | []            | Keycloak admin emails   |
| adminUser     | string   | ""            | Keycloak admin user     |
| adminPassword | string   | ""            | Keycloak admin password |

## nextcloud:

| Key               | Type   | Default value | Description        |
| ----------------- | ------ | ------------- | ------------------ |
| nextcloudUser     | string | ""            | Nextcloud user     |
| nextcloudPassword | string | ""            | Nextcloud password |
| nextcloudQuota    | number | "1073741824"  | Nextcloud quota    |

## rocketChat:

| Key                | Type   | Default value | Description         |
| ------------------ | ------ | ------------- | ------------------- |
| rocketChatUser     | string | ""            | RocketChat user     |
| rocketChatPassword | string | ""            | RocketChat password |

## smtp:

| Key       | Type   | Default value                         | Description                       |
| --------- | ------ | ------------------------------------- | --------------------------------- |
| url       | string | "smtps://USERNAME:PASSWORD@HOST:PORT" | SMTP server URI                   |
| fromEmail | string | ""                                    | Contact mail default "from" value |
| toEmail   | string | ""                                    | Contact mail default "to" value   |

## private:

| Key              | Type     | Default value                              | Description                                      |
| ---------------- | -------- | ------------------------------------------ | ------------------------------------------------ |
| fillWithFakeData | boolean  | false                                      | If true, fake datas are generated at start       |
| minioAccess      | string   | ""                                         | Minio user                                       |
| minioSecret      | string   | ""                                         | Minio password                                   |
| apiKeys          | [string] | [""]                                       | API access keys for external services            |
| BBBSecret        | string   | ""                                         | Big Blue Button Secret                           |
| whiteDomains     | [string] | ["^ac-[a-z-]_\\.fr", "^[a-z-]_\\.gouv.fr"] | Emails white domains for user account activation |
