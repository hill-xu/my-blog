#!/bin/bash
git reset --hard

git pull origin $1;

hexo g;


