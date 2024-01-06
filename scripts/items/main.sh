#!/bin/bash

scripts=(
  "./scripts/items/7d2d.sh"
  "./scripts/items/rust.sh"
)

# Start each script in the background and keep their PIDs
pids=()
for script in "${scripts[@]}"; do
  $script &
  pids+=($!)
done

# Wait for all scripts to complete and check their exit statuses
all_success=true
for pid in "${pids[@]}"; do
  wait $pid
  exit_status=$?
  if [ $exit_status -ne 0 ]; then
    echo "Script with PID $pid failed with exit status $exit_status."
    all_success=false
  fi
done

# Final status
if $all_success; then
  echo "All scripts completed successfully."
else
  echo "One or more scripts failed."
  exit 1
fi
