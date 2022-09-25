#!/bin/sh

set -e

printHeader() {
    printf '%s\n' ""
    printf '%s\n' "##################"
    printf '%s\n' "$1"
    printf '%s\n' "##################"
    printf '%s\n' ""
}

printHeader "Loaded variables from .env"

export $(cat .env | sed '/^#/d' | xargs)

USER_EMAIL=${USER_NAME}@${DOMAIN_NAME}.local

printHeader "Ensuring database is up to date"

CREATE_DOMAIN_RES=$(curl -s -X POST "${TAKARO_HOST}/domain" -H "Content-Type: application/json" -u admin:${ADMIN_SECRET} --data '{"name": "'${DOMAIN_NAME}'"}')

ROOT_PASSWORD=$(echo $CREATE_DOMAIN_RES | jq -r .data.password)
ROOT_USER=$(echo $CREATE_DOMAIN_RES | jq -r .data.rootUser.email)
ROOT_USER_ID=$(echo $CREATE_DOMAIN_RES | jq -r .data.rootUser.id)
ROOT_ROLE_ID=$(echo $CREATE_DOMAIN_RES | jq -r .data.rootRole.id)

printHeader "Created domain with root user ${ROOT_USER} and password ${ROOT_PASSWORD}"

ROOT_TOKEN=$(curl -s -X POST "${TAKARO_HOST}/login" -H "Content-Type: application/json" --data '{"username": "'${ROOT_USER}'", "password": "'${ROOT_PASSWORD}'"}' | jq -r .data.token)

CREATE_USER_RES=$(curl -s -X POST "${TAKARO_HOST}/user" -H "Content-Type: application/json" -H 'Authorization: Bearer '${ROOT_TOKEN}'' --data '{"name": "'${USER_NAME}'", "email": "'${USER_EMAIL}'", "password": "'${USER_PASSWORD}'"}')

CREATED_USER_ID=$(echo $CREATE_USER_RES | jq -r .data.id)

ASSIGN_ROLE_RES=$(curl -s -X POST "${TAKARO_HOST}/user/${CREATED_USER_ID}/role/${ROOT_ROLE_ID}" -H "Content-Type: application/json" -H 'Authorization: Bearer '${ROOT_TOKEN}'')

printHeader "Created user ${USER_EMAIL} with password '$USER_PASSWORD'"


curl -X POST "${TAKARO_HOST}/gameserver" -H "Content-Type: application/json" -H "Authorization: Bearer $ROOT_TOKEN" --data '{"name": "test-gameserver", "type": "MOCK", "connectionInfo": "{\"eventInterval\": 10000}"}'

