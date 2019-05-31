# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## E2E Test Service

End-to-end Test Service (ETS) for Wire's test automation suite.

### Usage in testing environment

First, make sure you have all dependencies installed by running

```
yarn
```

Then run the server with

```
yarn start:dev
```

The ETS will now be running locally and is ready to process requests.

### Testing

```
yarn test
```

### Running in production environment

```
yarn
yarn dist
yarn start
```

## API documentation (Swagger)

- [swagger.md](./docs/swagger.md)
- Swagger UI is available at `/swagger-ui` when the ETS is running.

## API documentation (old)

- [`GET /`](#get-)
- [`GET /log`](#get-log)
- [`GET /commit`](#get-commit)
- [`GET /api/v1/instance/<instanceId>`](#get-apiv1instanceinstanceid)
- [`GET /api/v1/instance/<instanceId>/fingerprint`](#get-apiv1instanceinstanceidfingerprint)
- [`GET /api/v1/instance/<instanceId>/clients`](#get-apiv1instanceinstanceidclients)
- [`GET /api/v1/instances`](#get-apiv1instances)
- [`PUT /api/v1/instance`](#put-apiv1instance)
- [`DELETE /api/v1/instance/<instanceId>`](#delete-apiv1instanceinstanceid)
- [`DELETE /api/v1/clients`](#delete-apiv1clients)
- [`POST /api/v1/instance/<instanceId>/archive`](#post-apiv1instanceinstanceidarchive)
- [`POST /api/v1/instance/<instanceId>/availability`](#post-apiv1instanceinstanceidavailability)
- [`POST /api/v1/instance/<instanceId>/clear`](#post-apiv1instanceinstanceidclear)
- [`POST /api/v1/instance/<instanceId>/delete`](#post-apiv1instanceinstanceiddelete)
- [`POST /api/v1/instance/<instanceId>/deleteEverywhere`](#post-apiv1instanceinstanceiddeleteeverywhere)
- [`POST /api/v1/instance/<instanceId>/getMessages`](#post-apiv1instanceinstanceidgetmessages)
- [`POST /api/v1/instance/<instanceId>/mute`](#post-apiv1instanceinstanceidmute)
- [`POST /api/v1/instance/<instanceId>/sendConfirmationDelivered`](#post-apiv1instanceinstanceidsendconfirmationdelivered)
- [`POST /api/v1/instance/<instanceId>/sendConfirmationRead`](#post-apiv1instanceinstanceidsendconfirmationread)
- [`POST /api/v1/instance/<instanceId>/sendEphemeralConfirmationDelivered`](#post-apiv1instanceinstanceidsendephemeralconfirmationdelivered)
- [`POST /api/v1/instance/<instanceId>/sendEphemeralConfirmationRead`](#post-apiv1instanceinstanceidsendephemeralconfirmationread)
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

### `GET /`

#### Response

```json
{
  "code": "<number in HTTP status format>",
  "commit?": "<string>",
  "instance": {
    "env": {
      "LOG_ERROR?": "<string>",
      "LOG_OUTPUT?": "<string>",
      "NODE_DEBUG?": "<string>"
    },
    "uptime": "<string in HH:mm:ss format>"
  },
  "message": "<string>"
}
```

### `GET /log`

#### Response

```
<complete log as plain text>
```

### `GET /commit`

#### Response

```
<latest commit hash as plain text>
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

#### `BackendData`

```json
{
  "name": "<string>",
  "rest": "<string>",
  "ws": "<string>"
}
```

#### Request

**Notes**:

- You can either set `backend` or `customBackend`. If you set neither, the "staging" backend will be used. If you set both, `backend` takes the precedence.
- `deviceClass` can be set to any string if `backend` is unset and `customBackend` is set.

```json
{
  "backend?": "<'prod'|'production'|'staging'>",
  "customBackend?": "<BackendData>",
  "deviceClass?": "<'desktop'|'phone'|'tablet'>",
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

#### `BackendData`

```json
{
  "name": "<string>",
  "rest": "<string>",
  "ws": "<string>"
}
```

#### Request

**Notes**:

- You can either set `backend` or `customBackend`. If you set neither, the "staging" backend will be used. If you set both, `backend` takes the precedence.

- The device class can be set to any string if `backend` is unset and `customBackend` is set.

```json
{
  "backend?": "<'prod'|'production'|'staging'>",
  "customBackend?": "<BackendData>",
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

### POST `/api/v1/instance/<instanceId>/availability`

#### Request

Type can be `0` (`NONE`), `1` (`AVAILABLE`), `2` (`AWAY`), `3` (`BUSY`).

```json
{
  "teamId": "<string in UUID format>",
  "type": "<0|1|2|3>"
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

Confirmation type can be `0` (Delivered) or `1` (Read).

Legal Hold status type can be `0` (Disabled) or `1` (Enabled).

```json
[
  {
    "content?": {
      "expectsReadConfirmation?": "<boolean>",
      "text": "<string>"
    },
    "confirmations?": [
      {
        "firstMessageId": "<string in UUID format>",
        "from": "<string in UUID format>",
        "moreMessageIds?": "<Array of strings in UUID format>",
        "type": "<0|1>"
      }
    ],
    "conversation": "<string in UUID format>",
    "from": "<string in UUID format>",
    "id": "<string in UUID format>",
    "legalHoldStatus?": "<0|1>",
    "messageTimer": "<number>",
    "state": "<'PayloadBundleState.INCOMING'|'PayloadBundleState.OUTGOING_SENT'>",
    "timestamp": "<number in Unix time stamp format>",
    "type": "<string>"
  }
]
```

### `POST /api/v1/instance/<instanceId>/mute`

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

### `POST /api/v1/instance/<instanceId>/sendConfirmationDelivered`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "firstMessageId": "<string in UUID format>",
  "moreMessageIds?": "<Array of strings in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendConfirmationRead`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "firstMessageId": "<string in UUID format>",
  "moreMessageIds?": "<Array of strings in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendEphemeralConfirmationDelivered`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "firstMessageId": "<string in UUID format>",
  "moreMessageIds?": "<Array of strings in UUID format>"
}
```

#### Response

```json
{
  "instanceId": "<string in UUID format>",
  "name": "<string>"
}
```

### `POST /api/v1/instance/<instanceId>/sendEphemeralConfirmationRead`

#### Request

```json
{
  "conversationId": "<string in UUID format>",
  "firstMessageId": "<string in UUID format>",
  "moreMessageIds?": "<Array of strings in UUID format>"
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

Legal Hold status type can be `0` (Disabled) or `1` (Enabled).

```json
{
  "conversationId": "<string in UUID format>",
  "data": "<string in base64 format>",
  "expectsReadConfirmation?": "<boolean>",
  "fileName": "<string>",
  "legalHoldStatus?": "<0|1>",
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

Legal Hold status type can be `0` (Disabled) or `1` (Enabled).

```json
{
  "conversationId": "<string in UUID format>",
  "data": "<string in base64 format>",
  "expectsReadConfirmation?": "<boolean>",
  "height": "<number>",
  "legalHoldStatus?": "<0|1>",
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

### `POST /api/v1/instance/<instanceId>/sendLocation`

#### Request

Legal Hold status type can be `0` (Disabled) or `1` (Enabled).

```json
{
  "conversationId": "<string>",
  "expectsReadConfirmation?": "<boolean>",
  "latitude": "<number>",
  "legalHoldStatus?": "<0|1>",
  "locationName?": "<string>",
  "longitude": "<number>",
  "messageTimer?": "<number>",
  "zoom?": "<number>"
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

Legal Hold status type can be `0` (Disabled) or `1` (Enabled).

```json
{
  "conversationId": "<string in UUID format>",
  "expectsReadConfirmation?": "<boolean>",
  "legalHoldStatus?": "<0|1>",
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

Legal Hold status type can be `0` (Disabled) or `1` (Enabled).

```json
{
  "conversationId": "<string in UUID format>",
  "expectsReadConfirmation?": "<boolean>",
  "legalHoldStatus?": "<0|1>",
  "linkPreview?": {
    "image?": {
      "data": "<string in base64 format>",
      "height": "<number>",
      "type": "<string>",
      "width": "<number>"
    },
    "permanentUrl?": "<string>",
    "summary?": "<string>",
    "title?": "<string>",
    "tweet?": {
      "author?": "<string>",
      "username?": "<string>"
    },
    "url": "<string>",
    "urlOffset": "<number>"
  },
  "mentions?": [
    {
      "length": "<number>",
      "start": "<number>",
      "userId": "<string in UUID format>"
    }
  ],
  "messageTimer?": "<number>",
  "quote?": {
    "quotedMessageId": "<string in UUID format>",
    "quotedMessageSha256": "<string in SHA256 format>"
  },
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

Legal Hold status type can be `0` (Disabled) or `1` (Enabled).

```json
{
  "conversationId": "<string in UUID format>",
  "expectsReadConfirmation?": "<boolean>",
  "firstMessageId": "<string in UUID format>",
  "legalHoldStatus?": "<0|1>",
  "linkPreview?": {
    "image?": {
      "data": "<string in base64 format>",
      "height": "<number>",
      "type": "<string>",
      "width": "<number>"
    },
    "permanentUrl?": "<string>",
    "summary?": "<string>",
    "title?": "<string>",
    "tweet?": {
      "author?": "<string>",
      "username?": "<string>"
    },
    "url": "<string>",
    "urlOffset": "<number>"
  },
  "mentions?": [
    {
      "length": "<number>",
      "start": "<number>",
      "userId": "<string in UUID format>"
    }
  ],
  "quote?": {
    "quotedMessageId": "<string in UUID format>",
    "quotedMessageSha256": "<string in SHA256 format>"
  },
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
