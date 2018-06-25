# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## E2E Test Service

End-to-end Test Service (ETS) for Wire's test automation suite.

## API v1

- [`PUT /api/v1/instance`](#put-apiv1instance)
- [`GET /api/v1/instance/<instanceId>`](#get-apiv1instanceinstanceid)
- [`GET /api/v1/instance/<instanceId>/fingerprint`](#get-apiv1instanceinstanceidfingerprint)
- [`POST /api/v1/instance/<instanceId>/sendImage`](#post-apiv1instanceinstanceidsendimage)
- [`POST /api/v1/instance/<instanceId>/sendPing`](#post-apiv1instanceinstanceidsendping)
- [`POST /api/v1/instance/<instanceId>/sendSessionReset`](#post-apiv1instanceinstanceidsendsessionreset)
- [`POST /api/v1/instance/<instanceId>/sendText`](#post-apiv1instanceinstanceidsendtext)
- [`POST /api/v1/instance/<instanceId>/typing`](#post-apiv1instanceinstanceidtyping)
- [`POST /api/v1/instance/<instanceId>/updateText`](#post-apiv1instanceinstanceidupdatetext)
- [Planned API](#planned-api)

---

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
POST /delete {"conversationId": "...", "messageId": "..."}
POST /deleteEverywhere {"conversationId": "...", "messageId": "..."}
POST /markEphemeralRead {"conversationId": "...", "messageId": "..."}
POST /react {"conversationId": "...", "messageId":"", "reactType": "..."}
POST /sendFile {"conversationId": "...", "payload": "..."}
POST /sendLocation {"conversationId": "...", "longitude":"...", "latitude":"...", "locationName":"...", "zoom":"..."} (not sure about the payload yet)
```
