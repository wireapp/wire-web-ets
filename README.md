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

## API documentation

- [swagger.md](./docs/swagger.md)
- Swagger is available at `/api-docs` when the ETS is running.
