mkdir -p build_dependencies
cd build_dependencies

git clone git@github.com:wooorm/franc.git
git clone git@github.com:LouisJULIEN/extract-date.git
git clone git@github.com:LouisJULIEN/extract-time.git

set -e

cd franc
git pull
npm i
npm i esbuild
npm run build
npx esbuild packages/franc/index.js --bundle --outfile=../../dependencies/franc.js --format=esm


cd ../extract-date
git pull
npm i
npm run build
npm run bundle
cp bundle/extract-date.js ../../dependencies/extract-date.js

cd ../extract-time
git pull
npm i
npm run build
npm run bundle
cp bundle/extract-time.js ../../dependencies/extract-time.js
