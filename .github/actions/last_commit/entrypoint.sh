#!/usr/bin/env sh

# All arguments are used as pattern for grep.

set -e

PATTERN="$*"
LAST_COMMIT="$(git log -1 --pretty=%B | head -n 1)"

if echo "$LAST_COMMIT" | awk "$PATTERN{f=1} END {exit !f}"; then
  echo "\"$LAST_COMMIT\" matches \"$PATTERN\""
  exit 0
fi

echo "\"$LAST_COMMIT\" does not match \"$PATTERN\""
exit 78
