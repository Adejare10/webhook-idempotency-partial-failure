#!/usr/bin/env bash

set -e

echo "Applying reference solution..."

# The reference implementation is already contained in src/.
# The oracle validates the completed implementation through
# the project's build and test commands.

npm run build
npm test -- --runInBand

echo "Reference solution completed successfully."