# E2E Test Service
End-to-end Test Service (ETS) for Wire's test automation suite.

## Version: 1.20.0

### Terms of service
https://wire.com/legal/

**Contact information:**  
opensource@wire.com  

**License:** [GPL-3.0](https://github.com/wireapp/wire-web-ets/blob/master/LICENSE)

### /

#### GET
##### Summary:

Get information about the server

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [ServerInfo](#serverinfo) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /clients

#### DELETE
##### Summary:

Delete all clients

##### Description:

**Note**: You can either set `backend` or `customBackend`. If you set neither, the "staging" backend will be used. If you set both, `backend` takes the precedence.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| body | body | Login data | Yes | [BasicLogin](#basiclogin) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [ [Client](#client) ] |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /commit

#### GET
##### Summary:

Get the latest commit hash as plain text

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | string |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance

#### PUT
##### Summary:

Create a new instance

##### Description:



##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| body | body | Login data | Yes | [Login](#login) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}

#### DELETE
##### Summary:

Delete an instance

##### Description:



##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | object |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

#### GET
##### Summary:

Get information about an instance

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [Instance](#instance) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/archive

#### POST
##### Summary:

Archive a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/availability

#### POST
##### Summary:

Set a user's availability

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body | Type can be `0` (none), `1` (available), `2` (away), `3` (busy). | Yes | [Availability](#availability) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/clear

#### POST
##### Summary:

Clear a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/clients

#### GET
##### Summary:

Get all clients of an instance

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [ [Client](#client) ] |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/delete

#### POST
##### Summary:

Delete a message locally

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/deleteEverywhere

#### POST
##### Summary:

Delete a message for everyone

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/fingerprint

#### GET
##### Summary:

Get the fingerprint from the instance's client

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | object |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/getMessages

#### POST
##### Summary:

Get all messages

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [ [Message](#message) ] |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/mute

#### POST
##### Summary:

Mute a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendConfirmationDelivered

#### POST
##### Summary:

Send a delivery confirmation for a message

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object & [Confirmation](#confirmation) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendConfirmationRead

#### POST
##### Summary:

Send a read confirmation for a message

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendEphemeralConfirmationDelivered

#### POST
##### Summary:

Send a delivery confirmation for an ephemeral message

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendEphemeralConfirmationRead

#### POST
##### Summary:

Send a read confirmation for an ephemeral message

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendFile

#### POST
##### Summary:

Send a file to a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendImage

#### POST
##### Summary:

Send an image to a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | [Image](#image) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendLocation

#### POST
##### Summary:

Send a location to a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object & [Location](#location) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendPing

#### POST
##### Summary:

Send a ping to a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendReaction

#### POST
##### Summary:

Send a reaction to a message

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object & [Reaction](#reaction) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendSessionReset

#### POST
##### Summary:

Send a session reset message

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendText

#### POST
##### Summary:

Send a text message to a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | [TextMessage](#textmessage) & object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) & object |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/sendTyping

#### POST
##### Summary:

Send a typing indicator to a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | [Typing](#typing) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instance/{instanceId}/updateText

#### POST
##### Summary:

Update a text message in a conversation

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| instanceId | path | ID of instance to use | Yes | string (uuid) |
| body | body |  | Yes | [TextMessage](#textmessage) & object |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [InstanceAndName](#instanceandname) |
| 404 | Instance not found | [ErrorMessage](#errormessage) |
| 422 | Validation error | [ErrorMessage](#errormessage) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /instances

#### GET
##### Summary:

Get all instances

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | [Instance](#instance) |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### /log

#### GET
##### Summary:

Get the complete log as plain text

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 |  | string |
| 500 | Internal server error | [ServerErrorMessage](#servererrormessage) |

### Models


#### AudioMetaData

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| durationInMillis | integer |  | No |
| normalizedLoudness | [ integer ] |  | No |

#### Availability

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| teamId | string (uuid) |  | No |
| type | integer |  | No |

#### BackendData

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| name | string |  | Yes |
| rest | string |  | Yes |
| ws | string |  | Yes |

#### BasicLogin

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| backend | string |  | No |
| customBackend | [BackendData](#backenddata) |  | No |
| email | string (email) |  | Yes |
| password | password |  | Yes |

#### Client

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| class | string |  | No |
| cookie | string |  | No |
| id | string (uuid) |  | No |
| location | object |  | No |
| model | string |  | No |
| time | dateTime |  | No |
| type | string |  | No |

#### Confirmation

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| firstMessageId | string (uuid) |  | Yes |
| moreMessageIds | [ string (uuid) ] |  | No |
| type | integer | Type can be `0` (delivered) or `1` (read). | Yes |

#### ConfirmationWithSender

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| ConfirmationWithSender |  |  |  |

#### ErrorMessage

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | integer |  | Yes |
| error | string |  | Yes |

#### Image

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| data | string (base64) |  | Yes |
| expectsReadConfirmation | boolean |  | No |
| height | integer |  | Yes |
| legalHoldStatus | [LegalHoldStatus](#legalholdstatus) |  | No |
| messageTimer | integer |  | No |
| type | string |  | Yes |
| width | integer |  | Yes |

#### Instance

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| Instance |  |  |  |

#### InstanceAndName

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| instanceId | string (uuid) |  | No |
| name | string |  | No |

#### LegalHoldStatus

Type can be `0` (unknown), `1` (disabled) or `2` (enabled).

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| LegalHoldStatus | integer | Type can be `0` (unknown), `1` (disabled) or `2` (enabled). |  |

#### LinkPreview

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| image | [Image](#image) |  | No |
| permanentUrl | string |  | No |
| summary | string |  | No |
| title | string |  | No |
| tweet | object |  | No |
| url | string (url) |  | No |
| urlOffset | integer |  | No |

#### Location

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| expectsReadConfirmation | boolean |  | No |
| latitude | integer |  | Yes |
| legalHoldStatus | [LegalHoldStatus](#legalholdstatus) |  | No |
| locationName | string |  | No |
| longitude | integer |  | Yes |
| messageTimer | integer |  | No |
| zoom | integer |  | No |

#### Login

**Note**: You can either set `backend` or `customBackend`. If you set neither, the "staging" backend will be used. If you set both, `backend` takes the precedence.

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| Login |  | **Note**: You can either set `backend` or `customBackend`. If you set neither, the "staging" backend will be used. If you set both, `backend` takes the precedence. |  |

#### Mention

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| length | integer |  | No |
| start | integer |  | No |
| userId | string (uuid) |  | No |

#### Message

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| confirmations | [ [ConfirmationWithSender](#confirmationwithsender) ] |  | No |
| content | [MessageContent](#messagecontent) |  | No |
| conversation | string (uuid) |  | Yes |
| from | string (uuid) |  | Yes |
| id | string (uuid) |  | Yes |
| messageTimer | integer |  | Yes |
| reactions | [ [ReactionWithSender](#reactionwithsender) ] |  | No |
| state | string |  | Yes |
| timestamp | string |  | Yes |
| type | string |  | Yes |

#### MessageContent

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| expectsReadConfirmation | boolean |  | No |
| legalHoldStatus | [LegalHoldStatus](#legalholdstatus) |  | No |
| text | string |  | Yes |

#### Reaction

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| legalHoldStatus | [LegalHoldStatus](#legalholdstatus) |  | No |
| originalMessageId | string (uuid) |  | Yes |
| type | string |  | Yes |

#### ReactionWithSender

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| ReactionWithSender |  |  |  |

#### ServerErrorMessage

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| ServerErrorMessage |  |  |  |

#### ServerInfo

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | integer |  | Yes |
| commit | string |  | No |
| instance | [ServerInfoInstance](#serverinfoinstance) |  | Yes |
| message | string |  | Yes |

#### ServerInfoInstance

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| env | object |  | Yes |
| uptime | string |  | Yes |

#### TextMessage

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| expectsReadConfirmation | boolean |  | No |
| legalHoldStatus | [LegalHoldStatus](#legalholdstatus) |  | No |
| linkPreview | [LinkPreview](#linkpreview) |  | No |
| mentions | [ [Mention](#mention) ] |  | No |
| messageTimer | integer |  | No |
| quote | object |  | No |
| text | string |  | No |

#### Typing

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| conversationId | string (uuid) |  | No |
| status | string |  | No |

#### VideoMetaData

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| durationInMillis | integer |  | No |
| height | integer |  | No |
| width | integer |  | No |