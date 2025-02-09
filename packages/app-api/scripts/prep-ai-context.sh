#!/bin/sh

OUTPUT_DIR=./dist

find ../lib-modules/src/modules -type f -name "*.js" | while read file; do
  echo -e "\n=== $file ===\n"
  cat "$file"
done >$OUTPUT_DIR/combined_modules.txt

find ../lib-apiclient/src -type f -name "*.js" -o -name "*.ts" | while read file; do
  echo -e "\n=== $file ===\n"
  cat "$file"
done >$OUTPUT_DIR/combined_apiclient.txt

find ../web-docs/docs/advanced -type f -name "*.mdx" -o -name "*.md" | while read file; do
  echo -e "\n=== $file ===\n"
  cat "$file"
done >$OUTPUT_DIR/combined_docs.txt
