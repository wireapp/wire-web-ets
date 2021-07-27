# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## E2E Test Service

End-to-end Test Service (ETS) for Wire's test automation suite.

### Usage in testing environment

First, make sure you have all dependencies installed by running:

```
yarn
```

Then run the server with:

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

## Creating releases

To create a release, checkout the "dev" branch and execute `yarn release:patch`, `yarn release:minor` or `yarn release:major`. Afterwards, create a PR against the "main" branch with the latest changes.

## API documentation

- Swagger UI is available at `/swagger-ui` when running the ETS, i.e. http://localhost:21080/swagger-ui/

## Implementation

1. Add endpoint description in `swagger.json`
1. Add business logic in `InstanceService.ts`
1. Add endpoint implementation in `conversationRoutes.ts`

## Deployments

The following ETS deployments are reachable via Wire's VPN:

- [ETS "dev" branch](http://192.168.120.44:27080/swagger-ui/)
- [ETS "main" branch](http://192.168.120.44:28080/swagger-ui/)

## How it works

1. Create an instance (POST `/instance`)
1. Use the received `instanceId` to use resources like `sendText`

**Example payload to create an instance**

- http://localhost:21080/swagger-ui/#/Instance/createInstance

```json
{
  "backend": "staging",
  "email": "you@email.com",
  "password": "secret",
  "deviceClass": "desktop",
  "name": "Some Instance Name"
}
```

**Example payload to start a poll**

- http://localhost:21080/swagger-ui/#/Instance/sendText

```json
{
  "buttons": ["A", "B"],
  "text": "Do you like A or B?",
  "conversationId": "b894b2e4-e862-4b55-a97e-56ea3690be20"
}
```

## Common errors

### Invalid JSON provided

```json
{
  "code": "400",
  "error": "Payload is not valid JSON data."
}
```

### Instance or endpoint not found

```json
{
  "code": "404",
  "error": "<string>"
}
```

### JSON data with missing or invalid fields provided

```json
{
  "code": "422",
  "error": "<string>"
}
```

### Internal server error

```json
{
  "code": "500",
  "error": "<string>",
  "stack": "string"
}
```
