#!/bin/bash

FEATURE_NAME=$1
TARGET_PACKAGE_NAME=$2
GITHUB_REPO_PROJECT=git@crmgrow.com:teamgrow/$FEATURE_NAME.git

SOURCE_DIRECTORY_IMPORTABLE_PROJECT=projects

# if [ -e modules/$TARGET_PACKAGE_NAME ]
# then
#     echo "You downloaded the folder already"
#     exit 0;
# fi

rm -rf node_modules/$TARGET_PACKAGE_NAME/*
cd node_modules
git clone $GITHUB_REPO_PROJECT $TARGET_PACKAGE_NAME

# code $TARGET_PACKAGE_NAME