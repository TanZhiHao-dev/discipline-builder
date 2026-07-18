#!/usr/bin/env bash
# One-shot deploy for Discipline Builder onto a VPS that already runs Coolify.
# It piggybacks on Coolify's Traefik proxy (docker network "coolify") so the app
# gets HTTPS + a stable URL and stays always-on, without the Coolify dashboard.
#
# Run on the VPS as root:
#   curl -fsSL https://raw.githubusercontent.com/TanZhiHao-dev/discipline-builder/main/deploy/vps-deploy.sh | bash
#
# Re-run any time to update to the latest main. Your data lives on the mounted
# volume /data/discipline-builder and survives rebuilds.
set -euo pipefail

REPO="https://github.com/TanZhiHao-dev/discipline-builder.git"
APP_DIR="/opt/discipline-builder"
DATA_DIR="/data/discipline-builder"
NETWORK="coolify"
HOST="discipline.202.155.13.83.sslip.io"
NAME="discipline-builder"

echo "==> [1/4] Fetching source"
command -v git >/dev/null 2>&1 || { command -v dnf >/dev/null 2>&1 && dnf install -y -q git || apt-get install -y -q git; }
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth 1 origin main && git -C "$APP_DIR" reset --hard origin/main
else
  rm -rf "$APP_DIR"; git clone --depth 1 "$REPO" "$APP_DIR"
fi
mkdir -p "$DATA_DIR"

echo "==> [2/4] Building image (a few minutes on a small VPS)"
cd "$APP_DIR"
docker build -t "${NAME}:latest" .

echo "==> [3/4] (Re)starting container on the '${NETWORK}' network"
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --restart=always --network "$NETWORK" \
  -v "${DATA_DIR}:/data" \
  --env-file "${DATA_DIR}/app.env" \
  -l "traefik.enable=true" \
  -l "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https" \
  -l "traefik.http.middlewares.gzip.compress=true" \
  -l "traefik.http.routers.${NAME}-http.entryPoints=http" \
  -l "traefik.http.routers.${NAME}-http.middlewares=redirect-to-https" \
  -l "traefik.http.routers.${NAME}-http.rule=Host(\`${HOST}\`) && PathPrefix(\`/\`)" \
  -l "traefik.http.routers.${NAME}-http.service=${NAME}-svc" \
  -l "traefik.http.routers.${NAME}-https.entryPoints=https" \
  -l "traefik.http.routers.${NAME}-https.middlewares=gzip" \
  -l "traefik.http.routers.${NAME}-https.rule=Host(\`${HOST}\`) && PathPrefix(\`/\`)" \
  -l "traefik.http.routers.${NAME}-https.service=${NAME}-svc" \
  -l "traefik.http.routers.${NAME}-https.tls=true" \
  -l "traefik.http.routers.${NAME}-https.tls.certresolver=letsencrypt" \
  -l "traefik.http.services.${NAME}-svc.loadbalancer.server.port=3000" \
  "${NAME}:latest"

echo "==> [4/4] Done:"
docker ps --filter "name=${NAME}" --format 'table {{.Names}}\t{{.Status}}'
echo
echo "Live in ~30s (first HTTPS cert can take a minute) at: https://${HOST}"
