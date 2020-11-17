# Notifications Rest API

Used to send a notification to a single user or a group.

**URL** : `/api/notifications`

**Method** : `POST`

**X-API-KEY required** : YES

**Data constraints for single user notification**

```json
{
  "userId": "[string : user ID]",
  "title": "[string : notification title]",
  "content": "[string : notification content]",
  "type": "[optionnal string : notification type, can be info, group, request, setRole, unsetRole]"
}
```

**Data example for single user notification**

```json
{
  "userId": "MvSficML8rXEJjFMq",
  "title": "Information importante",
  "content": "Les clés sont sous le paillasson",
  "type": "info"
}
```

**Curl example for group notification**

```bash
curl -X POST -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" \
     -H "Content-Type: application/json" \
     -d '{"userId":"MvSficML8rXEJjFMq", "title":"Information importante", "content":"Les clés sont sous le paillasson", "type": "info"}' \
     http://localhost:3000/api/notifications
```

---

**Data constraints for group notification**

```json
{
  "groupId": "[string : group ID]",
  "title": "[string : notification title]",
  "content": "[string : notification content]"
}
```

**Data example for group notification**

```json
{
  "groupId": "ps8DGazDdrQGL3d4q",
  "title": "Réunion cruciale",
  "content": "Préparer des supports de communication percutants"
}
```

**Curl example for group notification**

```bash
curl -X POST -H "X-API-KEY: 849b7648-14b8-4154-9ef2-8d1dc4c2b7e9" \
     -H "Content-Type: application/json" \
     -d '{"groupId":"ps8DGazDdrQGL3d4q", "title":"Réunion cruciale", "content":"Préparer des supports de communication percutants"}' \
     http://localhost:3000/api/notifications
```

## Success Response

- **Code** : `200 OK`
- **Content example for single user notification** : `"PccR79WRYYM8HBgFT"` (newly created notification ID)
- **Content example for group notification** : `"Group Notification for [groupName] sent by API"`

## Error Responses

- **Condition** : If no or bad API-KEY.
- **Code** : `401 Unauthorized`
- **Content** : `API_KEY is required.`

---

- **Condition** : If bad userId.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: User does not exist. [restapi.notifications.addNotifications.unknownUser]`

---

- **Condition** : If bad groupId.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: Group does not exist. [restapi.notifications.addNotifications.unknownGroup]`

---

- **Condition** : If no field userId or groupId.
- **Code** : `500 Internal Server Error`
- **Content** : `Error: Notification sent by API with neither userId nor groupId [restapi.notifications.addNotifications.dataWithoutuserIdNorGroupId]`
