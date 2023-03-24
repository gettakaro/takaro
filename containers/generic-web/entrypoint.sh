#!/bin/sh

FILE_LOCATION=/usr/share/nginx/html/env.js

# Recreate config file
rm -rf "$FILE_LOCATION"
touch "$FILE_LOCATION"

# Add assignment
echo "window.__env__ = {" >>"$FILE_LOCATION"
echo "  VITE_API: \"$VITE_API\"," >>"$FILE_LOCATION"
echo "  VITE_ORY_URL: \"$VITE_ORY_URL\"," >>"$FILE_LOCATION"
echo "}" >>"$FILE_LOCATION"

nginx -g "daemon off;"
