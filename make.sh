#!/bin/bash
version=`grep Version= extension.vsixmanifest |tail -n1|awk -F"Version=" {'print $2'}|awk {'print $1'}|sed 's/"//g'`
mkdir build/extension -p
cp '[Content_Types].xml' build/
cp extension.vsixmanifest build/
cp LICENSE build/extension/LICENSE.txt
cp README.md build/extension
cp package.json build/extension
cp extension.js build/extension
cp logo.png build/extension
cp CHANGELOG.md build/extension
cd build
zip fastdrop-${version}.vsix -r *
