#!/usr/bin/bash
pwd
yarn run docs:build
cd src/.vuepress/dist
git init
git remote add origin https://github.com/zmf96/zmf96.github.io
git add .
git commit -m "强制推送当前目录到 gh-pages 分支"
git checkout -b gh-pages
git push origin gh-pages --force
