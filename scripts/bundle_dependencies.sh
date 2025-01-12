npx esbuild node_modules/franc/index.js --bundle --outfile=dependencies/franc.js --format=esm
npx esbuild node_modules/@louis.jln/extract-date/index.js --bundle --outfile=dependencies/extract-date.js --format=esm
npx esbuild node_modules/@louis.jln/extract-time/index.js --bundle --outfile=dependencies/extract-time.js --format=esm
