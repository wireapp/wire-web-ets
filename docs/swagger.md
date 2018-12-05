# E2E Test Service

End-to-end Test Service (ETS) for Wire's test automation suite.

**Version:** 1.0.0

**Terms of service:**  
https://wire.com/legal/

**Contact information:**  
opensource@wire.com

**License:** [GPL-3.0](https://github.com/wireapp/wire-web-ets/blob/master/LICENSE)

### /clients

---

##### **_DELETE_**

**Summary:** Delete all clients

**Description:**

**Parameters**

| Name | Located in | Description | Required | Schema                    |
| ---- | ---------- | ----------- | -------- | ------------------------- |
| body | body       | Login data  | Yes      | [BasicLogin](#basiclogin) |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | object                              |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance

---

##### **_PUT_**

**Summary:** Create a new instance

**Description:**

**Parameters**

| Name | Located in | Description | Required | Schema          |
| ---- | ---------- | ----------- | -------- | --------------- |
| body | body       | Login data  | Yes      | [Login](#login) |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}

---

##### **_DELETE_**

**Summary:** Delete an instance

**Description:**

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | object                              |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

##### **_GET_**

**Summary:** Get information about an instance

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |

**Responses**

| Code | Description | Schema                          |
| ---- | ----------- | ------------------------------- |
| 200  |             | [Instance](#instance)           |
| 404  | Not found   | [NotFoundError](#notfounderror) |

### /instance/{instanceId}/archive

---

##### **_POST_**

**Summary:** Archive a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/availability

---

##### **_POST_**

**Summary:** Set a user's availability

**Parameters**

| Name       | Located in | Description                                                      | Required | Schema        |
| ---------- | ---------- | ---------------------------------------------------------------- | -------- | ------------- |
| instanceId | path       | ID of instance to return                                         | Yes      | string (uuid) |
| body       | body       | Type can be 0 (`NONE`), 1 (`AVAILABLE`), 2 (`AWAY`), 3 (`BUSY`). | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/clear

---

##### **_POST_**

**Summary:** Clear a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/clients

---

##### **_GET_**

**Summary:** Get all clients of an instance

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |

**Responses**

| Code | Description | Schema                          |
| ---- | ----------- | ------------------------------- |
| 200  |             | [ [Client](#client) ]           |
| 404  | Not found   | [NotFoundError](#notfounderror) |

### /instance/{instanceId}/delete

---

##### **_POST_**

**Summary:** Delete a message locally

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/deleteEverywhere

---

##### **_POST_**

**Summary:** Delete a message for everyone

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/fingerprint

---

##### **_GET_**

**Summary:** Get the fingerprint from the instance's client

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |

**Responses**

| Code | Description | Schema                          |
| ---- | ----------- | ------------------------------- |
| 200  |             | object                          |
| 404  | Not found   | [NotFoundError](#notfounderror) |

### /instance/{instanceId}/getMessages

---

##### **_POST_**

**Summary:** Get all messages

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [ [Message](#message) ]             |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/mute

---

##### **_POST_**

**Summary:** Mute a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendConfirmationDelivered

---

##### **_POST_**

**Summary:** Send a delivery confirmation for a message

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendConfirmationRead

---

##### **_POST_**

**Summary:** Send a read confirmation for a message

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendEphemeralConfirmationDelivered

---

##### **_POST_**

**Summary:** Send a delivery confirmation for an ephemeral message

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendEphemeralConfirmationRead

---

##### **_POST_**

**Summary:** Send a read confirmation for an ephemeral message

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendFile

---

##### **_POST_**

**Summary:** Send a file to a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendImage

---

##### **_POST_**

**Summary:** Send an image to a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendLocation

---

##### **_POST_**

**Summary:** Send a location to a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendPing

---

##### **_POST_**

**Summary:** Send a ping to a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendReaction

---

##### **_POST_**

**Summary:** Send a reaction to a message

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendSessionReset

---

##### **_POST_**

**Summary:** Send a session reset message

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      | object        |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendText

---

##### **_POST_**

**Summary:** Send a text message to a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema                      |
| ---------- | ---------- | ------------------------ | -------- | --------------------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid)               |
| body       | body       |                          | Yes      | [TextMessage](#textmessage) |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/sendTyping

---

##### **_POST_**

**Summary:** Send a typing indicator to a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema        |
| ---------- | ---------- | ------------------------ | -------- | ------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid) |
| body       | body       |                          | Yes      |               |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  | [InstanceAndName](#instanceandname) |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instance/{instanceId}/updateText

---

##### **_POST_**

**Summary:** Update a text message in a conversation

**Parameters**

| Name       | Located in | Description              | Required | Schema                      |
| ---------- | ---------- | ------------------------ | -------- | --------------------------- |
| instanceId | path       | ID of instance to return | Yes      | string (uuid)               |
| body       | body       |                          | Yes      | [TextMessage](#textmessage) |

**Responses**

| Code | Description      | Schema                              |
| ---- | ---------------- | ----------------------------------- |
| 200  |                  |                                     |
| 404  | Not found        | [NotFoundError](#notfounderror)     |
| 422  | Validation error | [ValidationError](#validationerror) |

### /instances

---

##### **_GET_**

**Summary:** Get all instances

**Responses**

| Code | Description | Schema                          |
| ---- | ----------- | ------------------------------- |
| 200  |             | object                          |
| 404  | Not found   | [NotFoundError](#notfounderror) |

### /log

---

##### **_GET_**

**Summary:** Get the ETS log as plain text

**Responses**

| Code | Description           |
| ---- | --------------------- |
| 200  | The log as plain text |

### Models

---

### BasicLogin

| Name     | Type           | Description | Required |
| -------- | -------------- | ----------- | -------- |
| backend  | string         |             | No       |
| email    | string (email) |             | No       |
| password | password       |             | No       |

### Client

| Name     | Type          | Description | Required |
| -------- | ------------- | ----------- | -------- |
| class    | string        |             | No       |
| cookie   | string        |             | No       |
| id       | string (uuid) |             | No       |
| location | object        |             | No       |
| model    | string        |             | No       |
| time     | dateTime      |             | No       |
| type     | string        |             | No       |

### Instance

| Name     | Type | Description | Required |
| -------- | ---- | ----------- | -------- |
| Instance |      |             |          |

### InstanceAndName

| Name       | Type          | Description | Required |
| ---------- | ------------- | ----------- | -------- |
| instanceId | string (uuid) |             | No       |
| name       | string        |             | No       |

### LinkPreview

| Name         | Type            | Description | Required |
| ------------ | --------------- | ----------- | -------- |
| image        | object          |             | No       |
| permanentUrl | string          |             | No       |
| summary      | string          |             | No       |
| title        | string          |             | No       |
| tweet        | object          |             | No       |
| url          | string (url)    |             | No       |
| urlOffset    | string (number) |             | No       |

### Login

| Name  | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| Login |      |             |          |

### Mention

| Name   | Type            | Description | Required |
| ------ | --------------- | ----------- | -------- |
| length | string (number) |             | No       |
| start  | string (number) |             | No       |
| userId | string (uuid)   |             | No       |

### Message

| Name                    | Type               | Description | Required |
| ----------------------- | ------------------ | ----------- | -------- |
| content                 | object             |             | No       |
| conversation            | string (uuid)      |             | Yes      |
| expectsReadConfirmation | boolean            |             | No       |
| from                    | string (uuid)      |             | Yes      |
| id                      | string (uuid)      |             | Yes      |
| messageTimer            | string (number)    |             | Yes      |
| state                   | undefined (string) |             | Yes      |
| type                    | undefined (string) |             | Yes      |

### NotFoundError

| Name  | Type   | Description | Required |
| ----- | ------ | ----------- | -------- |
| error | string |             | No       |
| stack | string |             | No       |

### TextMessage

| Name                    | Type                        | Description | Required |
| ----------------------- | --------------------------- | ----------- | -------- |
| conversationId          | string (uuid)               |             | No       |
| expectsReadConfirmation | boolean                     |             | No       |
| linkPreview             | [LinkPreview](#linkpreview) |             | No       |
| mentions                | [ [Mention](#mention) ]     |             | No       |
| messageTimer            | string (number)             |             | No       |
| quote                   | object                      |             | No       |
| text                    | string                      |             | No       |

### ValidationError

| Name  | Type   | Description | Required |
| ----- | ------ | ----------- | -------- |
| error | string |             | No       |
