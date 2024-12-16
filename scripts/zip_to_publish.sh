#!/bin/bash
set -e

cd ..
PLUGIN_VERSION=`jq -r ".version" < manifest.json`
echo $PLUGIN_VERSION
PLUGIN_VERSION="${PLUGIN_VERSION//./-}"
echo $PLUGIN_VERSION
PLUGIN_ZIP_NAME="zip/mail_to_event-${PLUGIN_VERSION}.zip"

if [ -f "$PLUGIN_ZIP_NAME" ]; then
    rm "$PLUGIN_ZIP_NAME"
fi
zip -r $PLUGIN_ZIP_NAME ./ -x "package*" ".*" "venv" "zip/*" "scripts/*" "node_modules/*" "bundle_dependencies/*"

cd scripts
