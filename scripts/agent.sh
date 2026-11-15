#!/bin/bash
# Runs one of the project subagents (.claude/agents/<name>.md) as a headless
# Claude Code process and prints its report plus the model that actually served it.
#
# Why this exists: a running session only discovers .claude/agents/ if the
# directory existed when the session started. In a session that can already see
# the agents, delegate with the Agent tool instead.
#
# Usage: scripts/agent.sh <agent-name> <prompt-file> [output-json]
# Set RESUME=<session-id> (printed by an earlier run) to continue that agent's
# conversation with its context intact.
set -euo pipefail

agent="$1"
prompt_file="$2"
out="${3:-.agent-runs/${agent}-$(date +%Y%m%d-%H%M%S).json}"

cd "$(dirname "$0")/.."
mkdir -p "$(dirname "$out")"

resume=()
if [ -n "${RESUME:-}" ]; then resume=(--resume "$RESUME"); fi

claude -p "$(cat "$prompt_file")" \
  --agent "$agent" \
  "${resume[@]}" \
  --permission-mode auto \
  --output-format json > "$out" || echo "claude exited with status $?" >&2

python3 -I - "$out" "$agent" <<'EOF'
import json, sys
path, agent = sys.argv[1], sys.argv[2]
try:
    data = json.load(open(path))
except Exception as exc:
    print(f"[{agent}] could not parse output ({exc}); raw file: {path}")
    print(open(path).read()[:2000])
    sys.exit(1)
models = ", ".join(
    f"{name} (out {usage.get('outputTokens', '?')} tok)"
    for name, usage in (data.get("modelUsage") or {}).items()
)
print(f"=== {agent} | session={data.get('session_id')} | error={data.get('is_error')} | turns={data.get('num_turns')} "
      f"| cost=${data.get('total_cost_usd', 0):.2f} | models: {models}")
print(data.get("result") or "(no result text)")
EOF
