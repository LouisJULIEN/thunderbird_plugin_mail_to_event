#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

bundle() {
    echo "[$(date +%H:%M:%S)] Bundling plugin..."
    "$SCRIPT_DIR/zip_to_publish.sh"
    echo "[$(date +%H:%M:%S)] Done."
}

get_hash() {
    find "$PROJECT_DIR" -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/zip/*' -not -path '*/scripts/*' -type f -printf '%T@\n' 2>/dev/null | sort | md5sum
}

cd "$PROJECT_DIR"
bundle
LAST_HASH=$(get_hash)

echo "Watching for changes (3s debounce)... Press Ctrl+C to stop."
while true; do
    sleep 3
    CURRENT_HASH=$(get_hash)
    if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
        LAST_HASH="$CURRENT_HASH"
        bundle
    fi
done
