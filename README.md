# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## E2E Test Service

## API v1

* [`PUT /api/v1/instance`](#put-apiv1instance)
* [`GET /api/v1/instance/<id>`](#get-apiv1instanceid)
* [`POST /api/v1/instance/<id>/sendText`](#post-apiv1instanceidsendtext)
* [`POST /api/v1/instance/<id>/sendImage`](#post-apiv1instanceidsendimage)
* [`POST /api/v1/instance/<id>/sendPing`](#post-apiv1instanceidsendping)
* [`GET /api/v1/instance/<id>/fingerprint`](#get-apiv1instanceidfingerprint)
* [`POST /api/v1/instance/<id>/typing`](#post-apiv1instanceidtyping)
* [`POST /api/v1/instance/<id>/updateText`](#post-apiv1instanceidupdatetext)
* [Planned API](#planned-api)

---

### `PUT /api/v1/instance`

#### Request

```json
{
  "backend": "<'staging' or 'production' or 'prod'>",
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

### `GET /api/v1/instance/<id>`

#### Response

```json
{
  "backend": "<string>",
  "clientId": "<string>",
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<id>/sendText`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "payload": "<string>"
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

### `POST /api/v1/instance/<id>/sendImage`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "payload": {
    "data": "<string in base64 format>",
    "height": "<number>",
    "type": "<string>",
    "width": "<number>"
  }
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

### `POST /api/v1/instance/<id>/sendPing`

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

### `GET /api/v1/instance/<id>/fingerprint`

#### Response

```json
{
  "fingerprint": "<string>",
  "instanceId": "<string in UUID format>"
}
```

### `POST /api/v1/instance/<id>/typing`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "payload": "<started|stopped>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<id>/updateText`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "messageId": "<string in UUID format>",
  "payload": "<string>"
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
POST /delete {"conversationId": "...", "messageId":""}
POST /deleteEverywhere {"conversationId": "...", "messageId":""}
POST /markEphemeralRead {"conversationId": "...", "messageId":""}
POST /react {"conversationId": "...", "messageId":"", "reactType":""}
POST /sendEphemeralText {"conversationId": "...", "payload":""}
POST /sendFile {"conversationId": "...", "payload":""}
POST /sendLocation {"conversationId": "...", "longitude":"...", "latitude":"...", "locationName":"...", "zoom":"..."}  (not sure about the payload yet)
```
