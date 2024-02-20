#!/bin/bash
set -e

# Custom PostgreSQL configuration for testing
cat >>"$PGDATA/postgresql.conf" <<EOF
synchronous_commit = off
checkpoint_timeout = 1h
max_wal_size = 2GB
max_wal_senders = 0
wal_level = minimal
fsync = off
full_page_writes = off
work_mem = 512MB
maintenance_work_mem = 256MB
shared_buffers = 256MB
autovacuum = off
EOF

echo "Testing PostgreSQL configuration applied."
