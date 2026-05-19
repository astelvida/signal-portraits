#!/usr/bin/env bash
# PreToolUse:Bash hook — refuse any command that reads .env* via grep/cat/less/head/tail/awk/sed.
# Reading .env files directly with the Read tool is fine; shell exfil is not.
set -euo pipefail

cmd="${CLAUDE_TOOL_INPUT:-}"

if echo "$cmd" | grep -qE '(grep|cat|less|more|head|tail|awk|sed|xxd|od)[^|&]*\.env'; then
  echo "BLOCKED: refusing to read .env* via shell. Use the Read tool only when explicitly necessary." >&2
  exit 1
fi

exit 0
