#!/usr/bin/env bash
set -euo pipefail

# Both the release and archive hashes are pinned; no unverified installer runs.
case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)
    asset=gitleaks_8.30.1_linux_x64.tar.gz
    checksum=551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb
    ;;
  Darwin-arm64)
    asset=gitleaks_8.30.1_darwin_arm64.tar.gz
    checksum=b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5
    ;;
  *) echo 'Unsupported scanner platform; install Gitleaks 8.30.1 manually.' >&2; exit 1 ;;
esac
tool_dir="$(mktemp -d "${TMPDIR:-/tmp}/rove-gitleaks.XXXXXX")"
curl --fail --silent --show-error --location \
  "https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/$asset" \
  --output "$tool_dir/$asset"
actual="$(shasum -a 256 "$tool_dir/$asset" | cut -d ' ' -f 1)"
test "$actual" = "$checksum" || { echo 'Gitleaks archive checksum mismatch' >&2; exit 1; }
tar -xzf "$tool_dir/$asset" -C "$tool_dir" gitleaks
printf '%s\n' "$tool_dir/gitleaks"
