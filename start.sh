#!/usr/bin/env bash
set -euo pipefail

# Start the backend FastAPI app. Railway sets $PORT for you.
PORT=${PORT:-8000}

echo "Starting backend on port $PORT"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
