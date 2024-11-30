set -e

cd ..
PLUGIN_VERSION=`jq -r ".version" < manifest.json`
PLUGIN_VERSION="${PLUGIN_VERSION//./-}"
PLUGIN_ZIP_NAME="zip/vinted_autofill-${PLUGIN_VERSION}.zip"

if [ -f "$PLUGIN_ZIP_NAME" ]; then
    rm "$PLUGIN_ZIP_NAME"
fi
zip -r $PLUGIN_ZIP_NAME ./ -x "package*" ".*" "venv" "zip/*" "scripts/*" "node_modules/*" "demo/*"

cd scripts
