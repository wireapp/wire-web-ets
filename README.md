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
- [`GET /api/v1/instances`](#get-apiv1instances)
- [`PUT /api/v1/instance`](#put-apiv1instance)
- [`DELETE /api/v1/instance/<instanceId>`](#delete-apiv1instanceinstanceid)
- [`POST /api/v1/instance/<instanceId>/delete`](#post-apiv1instanceinstanceidsendimage)
- [`POST /api/v1/instance/<instanceId>/deleteEverywhere`](#post-apiv1instanceinstanceidsendimage)
- [`POST /api/v1/instance/<instanceId>/getMessages`](#post-apiv1instanceinstanceidgetmessages)
- [`POST /api/v1/instance/<instanceId>/sendImage`](#post-apiv1instanceinstanceidsendimage)
- [`POST /api/v1/instance/<instanceId>/sendPing`](#post-apiv1instanceinstanceidsendping)
- [`POST /api/v1/instance/<instanceId>/sendReaction`](#post-apiv1instanceinstanceidsendreaction)
- [`POST /api/v1/instance/<instanceId>/sendSessionReset`](#post-apiv1instanceinstanceidsendsessionreset)
- [`POST /api/v1/instance/<instanceId>/sendText`](#post-apiv1instanceinstanceidsendtext)
- [`POST /api/v1/instance/<instanceId>/typing`](#post-apiv1instanceinstanceidtyping)
- [`POST /api/v1/instance/<instanceId>/updateText`](#post-apiv1instanceinstanceidupdatetext)
- [Planned API](#planned-api)

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
  "deviceName": "<string>",
  "email": "<string in email format>",
  "name": "<string>",
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

`200`

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
  "instanceId": "<string in UUID format>"
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
  "instanceId": "<string in UUID format>"
}
```

### `POST /api/v1/instance/<instanceId>/getMessages`

#### Request

```json
{
  "conversationId": "<string in UUID format>"
}
```

#### Response

```json
[
  {
    "content": {
      "text": "<string>"
    },
    "conversation": "<string in UUID format>",
    "from": "<string in UUID format>",
    "id": "<string in UUID format>",
    "messageTimer": "<number>",
    "state": "<'PayloadBundleState.INCOMING'|'PayloadBundleState.OUTGOING_SENT'>",
    "timestamp": "<number in Unix time stamp format>",
    "type": "text"
  }
]
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

## Planned API

```
POST /clear {"conversationId": "..."}
POST /markEphemeralRead {"conversationId": "...", "messageId": "..."}
POST /sendFile {"conversationId": "...", "payload": "..."}
POST /sendLocation {"conversationId": "...", "longitude":"...", "latitude":"...", "locationName":"...", "zoom":"..."} (not sure about the payload yet)
```
