#!/bin/bash
# Copies the sources of the self-authored modules (extract-date, extract-time)
# from their repositories in the parent directory into modules.louis/.
# The Thunderbird add-on review requires self-authored code to be shipped as
# source in the submission, not pulled from npm.
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

for MODULE in extract-date extract-time; do
    SRC="../$MODULE"
    DEST="modules.louis/$MODULE"

    rm -rf "$DEST"
    mkdir -p "$DEST"
    cp -r "$SRC/src" "$SRC/tsconfig.json" "$SRC/LICENSE" "$SRC/README.md" "$DEST/"

    # Keep only what is needed to install and bundle the module from source
    jq '{name, version, description, author, license, repository, homepage, main: "./src/index.ts", dependencies}' \
        "$SRC/package.json" > "$DEST/package.json"

    echo "$MODULE synced from $SRC ($(git -C "$SRC" rev-parse --short HEAD))"
done

# Reinstall the modules' own dependencies (wiped above). extract-time needs a
# nested date-fns v4 while the root one is v2 for extract-date; without it
# esbuild would silently bundle extract-time against the wrong major version.
npm install
