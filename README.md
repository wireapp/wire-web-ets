# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## E2E Test Service

End-to-end Test Service (ETS) for Wire's test automation suite.

## API v1

- [`GET /log`](#get-log)
- [`GET /api/v1/instance/<instanceId>`](#get-apiv1instanceinstanceid)
- [`GET /api/v1/instance/<instanceId>/fingerprint`](#get-apiv1instanceinstanceidfingerprint)
- [`GET /api/v1/instance/<instanceId>/clients`](#get-apiv1instanceinstanceidclients)
- [`GET /api/v1/instances`](#get-apiv1instances)
- [`PUT /api/v1/instance`](#put-apiv1instance)
- [`DELETE /api/v1/instance/<instanceId>`](#delete-apiv1instanceinstanceid)
- [`DELETE /api/v1/clients`](#delete-apiv1clients)
- [`POST /api/v1/instance/<instanceId>/archive`](#post-apiv1instanceinstanceidarchive)
- [`POST /api/v1/instance/<instanceId>/clear`](#post-apiv1instanceinstanceidclear)
- [`POST /api/v1/instance/<instanceId>/delete`](#post-apiv1instanceinstanceiddelete)
- [`POST /api/v1/instance/<instanceId>/deleteEverywhere`](#post-apiv1instanceinstanceiddeleteeverywhere)
- [`POST /api/v1/instance/<instanceId>/getMessages`](#post-apiv1instanceinstanceidgetmessages)
- [`POST /api/v1/instance/<instanceId>/markEphemeralRead`](#post-apiv1instanceinstanceidmarkephemeralread)
- [`POST /api/v1/instance/<instanceId>/mute`](#post-apiv1instanceinstanceidmute)
- [`POST /api/v1/instance/<instanceId>/mutedStatus`](#post-apiv1instanceinstanceidmutedstatus)
- [`POST /api/v1/instance/<instanceId>/sendConfirmation`](#post-apiv1instanceinstanceidsendconfirmation)
- [`POST /api/v1/instance/<instanceId>/sendFile`](#post-apiv1instanceinstanceidsendfile)
- [`POST /api/v1/instance/<instanceId>/sendImage`](#post-apiv1instanceinstanceidsendimage)
- [`POST /api/v1/instance/<instanceId>/sendLocation`](#post-apiv1instanceinstanceidsendlocation)
- [`POST /api/v1/instance/<instanceId>/sendPing`](#post-apiv1instanceinstanceidsendping)
- [`POST /api/v1/instance/<instanceId>/sendReaction`](#post-apiv1instanceinstanceidsendreaction)
- [`POST /api/v1/instance/<instanceId>/sendSessionReset`](#post-apiv1instanceinstanceidsendsessionreset)
- [`POST /api/v1/instance/<instanceId>/sendText`](#post-apiv1instanceinstanceidsendtext)
- [`POST /api/v1/instance/<instanceId>/typing`](#post-apiv1instanceinstanceidtyping)
- [`POST /api/v1/instance/<instanceId>/updateText`](#post-apiv1instanceinstanceidupdatetext)

---

### `GET /log`

#### Response

```
<complete log as plain text>
```

### `GET /api/v1/instance/<instanceId>`

#### Response

```json
{
  "backend": "<string>",
  "clientId": "<string>",
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `GET /api/v1/instance/<instanceId>/fingerprint`

#### Response

```json
{
  "fingerprint": "<string>",
  "instanceId": "<string in UUID format>"
}
```

### `GET /api/v1/instance/<instanceId>/clients`

#### Response

```json
[
  {
    "class": "<desktop>",
    "cookie": "<string>",
    "id": "<string>",
    "location": {
      "lat": "<float>",
      "lon": "<float>"
    },
    "model": "<string>",
    "time": "<Date>",
    "type": "<string>"
  }
]
```

### `GET /api/v1/instances`

#### Response

```json
{
  "<instance id>": {
    "backend": "<string>",
    "clientId": "<string>",
    "instanceId": "<string in UUID format>",
    "name": "<string>"
  }
}
```

### `PUT /api/v1/instance`

#### Request

```json
{
  "backend": "<'prod'|'production'|'staging'>",
  "deviceLabel?": "<string>",
  "deviceName?": "<string>",
  "email": "<string in email format>",
  "name?": "<string>",
  "password": "<string>"
}
```

#### Response

```json
{
  "instanceId": "<string>",
  "name": "<string>"
}
```

### `DELETE /api/v1/instance/<instanceId>`

#### Response

```json
{}
```

### `DELETE /api/v1/clients`

#### Request

```json
{
  "backend": "<'prod'|'production'|'staging'>",
  "email": "<string in email format>",
  "password": "<string>"
}
```

#### Response

```json
{}
```

### `POST /api/v1/instance/<instanceId>/archive`

#### Request

```json
{
  "archive": "<boolean>",
  "conversationId": "<string in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/clear`

#### Request

```json
{
  "conversationId": "<string in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/delete`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "messageId": "<string in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/deleteEverywhere`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "messageId": "<string in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/getMessages`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "name": "<string>"
}
```

#### Response

```json
[
  {
    "content?": {
      "text": "<string>"
    },
    "conversation": "<string in UUID format>",
    "from": "<string in UUID format>",
    "id": "<string in UUID format>",
    "messageTimer": "<number>",
    "state": "<'PayloadBundleState.INCOMING'|'PayloadBundleState.OUTGOING_SENT'>",
    "timestamp": "<number in Unix time stamp format>",
    "type": "<string>"
  }
]
```

### `POST /api/v1/instance/<instanceId>/markEphemeralRead`

```json
{
  "conversationId": "<string in UUID format>",
  "messageId": "<string in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/mute`

⚠️ **Deprecated**

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "mute": "<boolean>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/mutedStatus`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "mutedStatus": "<'ALL_NOTIFICATIONS' | 'NO_NOTIFICATIONS' | 'ONLY_MENTIONS'>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendConfirmation`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "messageId": "<string in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendFile`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "data": "<string in base64 format>",
  "fileName": "<string>",
  "messageTimer?": "<number>",
  "type": "<string>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendImage`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "data": "<string in base64 format>",
  "height": "<number>",
  "messageTimer?": "<number>",
  "type": "<string>",
  "width": "<number>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendLinkPreview`

#### Request

```json
{
  "conversationId": "<string>",
  "image?": {
    "data": "<string>",
    "height": "<number>",
    "type": "<string>",
    "width": "<number>"
  },
  "mentions?": [
    {
      "end": "<number>",
      "start": "<number>",
      "userId": "<string in UUID format>"
    }
  ],
  "permanentUrl?": "<string>",
  "summary?": "<string>",
  "text": "<string>",
  "title?": "<string>",
  "tweet?": {
    "author": "<string>",
    "username": "<string>"
  },
  "url": "<string>",
  "urlOffset": "<number>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendLocation`

#### Request

```json
{
  "conversationId": "<string>",
  "latitude": "<number>",
  "locationName": "<string>",
  "longitude": "<number>",
  "messageTimer?": "<number>",
  "zoom": "<number>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendPing`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "messageTimer?": "<number>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendReaction`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "originalMessageId": "<string in UUID format>",
  "type": "<'❤️'|''>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendSessionReset`

#### Request

```json
{
  "conversationId": "<string in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendText`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "linkPreview?": {
    "image?": {
      "data": "<string>",
      "height": "<number>",
      "type": "<string>",
      "width": "<number>"
    },
    "permanentUrl?": "<string>",
    "summary?": "<string>",
    "title?": "<string>",
    "url": "<string>",
    "urlOffset": "<number>",
    "tweet?": {
      "author?": "<string>",
      "username?": "<string>"
    }
  },
  "mentions?": [
    {
      "length": "<number>",
      "start": "<number>",
      "userId": "<string in UUID format>"
    }
  ],
  "messageTimer?": "<number>",
  "text": "<string>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendTyping`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "status": "<'started'|'stopped'>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/updateText`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "firstMessageId": "<string in UUID format>",
  "linkPreview?": {
    "image?": {
      "data": "<string>",
      "height": "<number>",
      "type": "<string>",
      "width": "<number>"
    },
    "permanentUrl?": "<string>",
    "summary?": "<string>",
    "title?": "<string>",
    "url": "<string>",
    "urlOffset": "<number>",
    "tweet?": {
      "author?": "<string>",
      "username?": "<string>"
    }
  },
  "mentions?": [
    {
      "length": "<number>",
      "start": "<number>",
      "userId": "<string in UUID format>"
    }
  ],
  "text": "<string>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "messageId": "<string>"
}
```
