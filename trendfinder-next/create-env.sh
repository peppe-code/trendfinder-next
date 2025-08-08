#!/usr/bin/env bash
set -euo pipefail
if [ -f .env ]; then
  echo ".env già presente"; exit 0;
fi
read -p "SERPAPI_API_KEY (lascia vuoto per mock): " SERP
read -p "NEXT_PUBLIC_SUPABASE_URL (opzionale): " SUPA_URL
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY (opzionale): " SUPA_KEY
cat > .env <<EOF
SERPAPI_API_KEY=${SERP}
NEXT_PUBLIC_SUPABASE_URL=${SUPA_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPA_KEY}
EOF
echo "Creato .env"
