# !/bin/bash
set -ex

mkdir -p dependencies

# Minify prevents unwanted edits as code can not be read by humans
npx esbuild node_modules/franc/index.js --bundle --outfile=dependencies/franc.js --format=esm --minify
npx esbuild node_modules/@louis.jln/extract-date/index.js --bundle --outfile=dependencies/extract-date.js --format=esm --alias:@=./node_modules/@louis.jln/extract-date  --minify
npx esbuild node_modules/@louis.jln/extract-time/index.js --bundle --outfile=dependencies/extract-time.js --format=esm  --minify
