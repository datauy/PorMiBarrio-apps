#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`
ORIGIN=`git remote -v|grep origin|head -n1|cut -f2|cut -d" " -f1`
TMP=/tmp/.gh-pages-update
CWD=`pwd`

echo Building dist files for $VERSION...
echo Done.

echo Updating dist files on gh-pages...
rm -rf $TMP
git clone -b gh-pages . $TMP
cd $TMP
git remote set-url origin $ORIGIN
git fetch origin gh-pages
git rebase origin/gh-pages

mkdir -p dist
mkdir -p _data
cd $CWD/dist
zip -r $TMP/dist/leaflet-control-geocoder-$VERSION.zip Control.Geocoder* images
cd $TMP
echo -e "- version: $VERSION\n" >>_data/versions.yml

git add -f dist/ _data/
git commit -m "Dist files $VERSION"
git push origin gh-pages
cd $CWD
rm -rf $TMP
