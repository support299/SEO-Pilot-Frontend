#!/usr/bin/env bash
# Build the frontend locally and sync dist/ to the EC2 box. Run via: npm run deploy
# Override any of these by exporting them first, e.g. SSH_KEY=~/keys/x.pem npm run deploy
set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/Downloads/service-pilot.pem}"
SSH_HOST="${SSH_HOST:-ubuntu@ec2-3-137-47-166.us-east-2.compute.amazonaws.com}"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/seopilot-frontend}"

cd "$(dirname "$0")/.."

[ -f "$SSH_KEY" ] || { echo "SSH key not found: $SSH_KEY (set SSH_KEY=...)" >&2; exit 1; }

echo "==> Building (VITE_API_BASE_URL from .env.production)"
npm run build

echo "==> Uploading dist/ to $SSH_HOST:$REMOTE_DIR"
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p '$REMOTE_DIR'"
rsync -az --delete -e "ssh -i $SSH_KEY" dist/ "$SSH_HOST:$REMOTE_DIR/"

echo "==> Done: https://seopilot.theservicepilot.com"
