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

## API documentation

- Swagger UI is available at `/swagger-ui` when running the ETS, i.e. http://localhost:21080/swagger-ui/

## Deployments

The following ETS deployments are reachable via Wire's VPN:

- [ETS "dev" branch](http://192.168.120.44:27080/swagger-ui/)
- [ETS "master" branch](http://192.168.120.44:28080/swagger-ui/)

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
