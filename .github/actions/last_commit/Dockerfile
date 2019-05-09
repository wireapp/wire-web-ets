FROM alpine/git:latest

LABEL version="1.0.0"
LABEL repository="https://github.com/wireapp/wire-web-ets/tree/master/.github/actions/last_commit"
LABEL homepage="https://github.com/wireapp/wire-web-ets/tree/master/.github/actions/last_commit"
LABEL maintainer="wireapp"

LABEL com.github.actions.name="GitHub Action for the last commit message"
LABEL com.github.actions.description="Checks if the last commit message matches a pattern"
LABEL com.github.actions.icon="package"
LABEL com.github.actions.color="yellow"

RUN apk add --no-cache git dumb-init

COPY entrypoint.sh .

ENTRYPOINT ["dumb-init", "--", "/bin/sh", "/entrypoint.sh"]
