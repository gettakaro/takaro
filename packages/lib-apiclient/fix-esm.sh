#!/bin/sh

# This script is used to fix the ESM imports in the generated
# TypeScript files. This is required because the generator
# does not add the .js extension to the imports.
# This .js extension is required for the ESM imports to work.

DIRECTORY="./src/generated"
OS=$(uname -s)

sub() {
	if [ "$OS" = "Darwin" ]; then
		sed -i '' "$@"
	else
		sed -i "$@"
	fi
}

for file in "$DIRECTORY"/*.ts; do
	echo $file

	# sed command that replaces the import statement
	# from './configuration';
	# to './configuration.js';
	sub 's/from '\''\.\/configuration'\''/from '\''\.\/configuration\.js'\''/g' $file
	sub 's/from '\''\.\/common'\''/from '\''\.\/common\.js'\''/g' $file
	sub 's/from '\''\.\/base'\''/from '\''\.\/base\.js'\''/g' $file
	sub 's/from '\''\.\/api'\''/from '\''\.\/api\.js'\''/g' $file

	# Do the same for double quotes
	sub 's/from "\.\/configuration"/from "\.\/configuration\.js"/g' $file
	sub 's/from "\.\/common"/from "\.\/common\.js"/g' $file
	sub 's/from "\.\/base"/from "\.\/base\.js"/g' $file
	sub 's/from "\.\/api"/from "\.\/api\.js"/g' $file
done
