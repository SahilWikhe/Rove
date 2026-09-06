#!/usr/bin/env bash
set -euo pipefail

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)
    asset=actionlint_1.7.12_linux_amd64.tar.gz
    checksum=8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8
    ;;
  Darwin-arm64)
    asset=actionlint_1.7.12_darwin_arm64.tar.gz
    checksum=aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f
    ;;
  *) echo 'Unsupported platform; install actionlint 1.7.12 manually.' >&2; exit 1 ;;
esac
tool_dir="$(mktemp -d "${TMPDIR:-/tmp}/rove-actionlint.XXXXXX")"
curl --fail --silent --show-error --location \
  "https://github.com/rhysd/actionlint/releases/download/v1.7.12/$asset" \
  --output "$tool_dir/$asset"
actual="$(shasum -a 256 "$tool_dir/$asset" | cut -d ' ' -f 1)"
test "$actual" = "$checksum" || { echo 'actionlint archive checksum mismatch' >&2; exit 1; }
tar -xzf "$tool_dir/$asset" -C "$tool_dir" actionlint
printf '%s\n' "$tool_dir/actionlint"
