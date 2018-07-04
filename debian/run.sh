#!/usr/bin/env sh

# Change to script's directory to ensure we're in the correct folder.
cd "${0%/*}" || exit 1

export NODE_DEBUG="@wireapp/*"

yarn start "$@" >> output.log 2>&1
