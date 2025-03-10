#!/bin/sh

FILE_LOCATION=/usr/share/nginx/html/env.js

# Recreate config file
rm -rf "$FILE_LOCATION"
touch "$FILE_LOCATION"

# Add assignment
echo "window.__env__ = {" >>"$FILE_LOCATION"
echo "  VITE_API: \"$VITE_API\"," >>"$FILE_LOCATION"
echo "  VITE_ORY_URL: \"$VITE_ORY_URL\"," >>"$FILE_LOCATION"
echo "  VITE_POSTHOG_PUBLIC_API_KEY: \"$VITE_POSTHOG_PUBLIC_API_KEY\"," >>"$FILE_LOCATION"
echo "  VITE_POSTHOG_API_URL: \"$VITE_POSTHOG_API_URL\"," >>"$FILE_LOCATION"
echo "  VITE_TAKARO_VERSION: \"$VITE_TAKARO_VERSION\"," >>"$FILE_LOCATION"
echo "  VITE_BILLING_ENABLED: \"$VITE_BILLING_ENABLED\"," >>"$FILE_LOCATION"
echo "  VITE_BILLING_API_URL: \"$VITE_BILLING_API_URL\"," >>"$FILE_LOCATION"
echo "  VITE_BILLING_MANAGE_URL: \"$VITE_BILLING_MANAGE_URL\"," >>"$FILE_LOCATION"

echo "}" >>"$FILE_LOCATION"

nginx -g "daemon off;"
