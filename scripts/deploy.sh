#!/bin/bash
# Deploys the site to the Netlify project `ahaan-gupta`.
#
# Usage: scripts/deploy.sh "<proxy-path URL printed by the Netlify MCP deploy-site tool>"
#
# Netlify uploads the whole project folder and builds it. The original resume
# (source-material/resume-original.pdf) contains a phone number, so it is moved out
# of the folder for the duration of the upload and put back afterwards.
set -uo pipefail

proxy_path="$1"
site_id="36ccd93d-a2a8-4d47-9a9a-20715e27d896"
cd "$(dirname "$0")/.."

private="source-material/resume-original.pdf"
holding="$(mktemp -d)"
if [ -f "$private" ]; then mv "$private" "$holding/"; fi

# Node's built-in fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY is set.
NODE_USE_ENV_PROXY=1 timeout 560 npx -y @netlify/mcp@latest \
  --site-id "$site_id" --proxy-path "$proxy_path" 2>&1 | grep -E "Deploy|Error|fail"
status=${PIPESTATUS[0]}

if [ -f "$holding/resume-original.pdf" ]; then mv "$holding/resume-original.pdf" "$private"; fi
rmdir "$holding" 2>/dev/null
exit "$status"
