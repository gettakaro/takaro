#!/bin/bash
set -euo pipefail

INPUTS="$(find ./proto -type f -name '*.proto')"

mkdir -p src/generated/client
mkdir -p src/generated/types

# TODO: fetch the .proto files from somewhere

# Generate client
npx grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./src/generated/client/ --grpc_out=grpc_js:./src/generated/client -I=./proto/ $INPUTS 


# Generate TS types
npx proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=src/generated/types/ --defaults $INPUTS -I=./proto/