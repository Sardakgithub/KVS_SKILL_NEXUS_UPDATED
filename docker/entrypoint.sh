#!/bin/sh
set -e

echo "Waiting for database..."
python - <<'PYCODE'
import os
import sys
import time

import psycopg

for attempt in range(30):
    try:
        psycopg.connect(
            dbname=os.environ.get("DB_NAME"),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            host=os.environ.get("DB_HOST", "localhost"),
            port=os.environ.get("DB_PORT", "5432"),
        ).close()
        sys.exit(0)
    except Exception:
        time.sleep(1)
else:
    print("Database never became available")
    sys.exit(1)
PYCODE

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

exec "$@"
