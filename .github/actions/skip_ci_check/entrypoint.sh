#!/usr/bin/env sh

set -e

PATTERN='!/\[ci skip|skip ci\]/'
LAST_COMMIT="$(git log -1 --pretty=%B | head -n 1)"

if echo "$LAST_COMMIT" | awk "$PATTERN{f=1} END {exit !f}"; then
  echo "\"$LAST_COMMIT\" matches \"$PATTERN\""
  exit 0
fi

echo "\"$LAST_COMMIT\" does not match \"$PATTERN\""
exit 78
