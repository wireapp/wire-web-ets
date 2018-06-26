#!/usr/bin/env sh

# Change to script's directory to ensure we're in the correct folder.
cd "${0%/*}" || exit 1

yarn start "$@" >> error.log 2>&1
