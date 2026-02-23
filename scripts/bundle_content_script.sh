#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"
npx esbuild content_scripts/highlight_dates/highlight_dates.js \
    --bundle \
    --outfile=content_scripts/highlight_dates/bundle/highlight_dates.bundle.js \
    --format=iife
cp create_event_button/pop_up_button.css content_scripts/highlight_dates/pop_up_button.css