#!/usr/bin/env bash

# Helper script for VSCode .code-workspace navigation
# Usage:
#   ./workspaces.sh ls
#   ./workspaces.sh cd <id>
#
# Requires: node, workspaces.js (from previous answer) in the same directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
    ls)
        node "$SCRIPT_DIR/workspaces.js" ls
        ;;
    cd)
        if [ -z "$2" ]; then
            echo "Usage: $0 cd <id>"
            exit 1
        fi

        dir="$(node "$SCRIPT_DIR/workspaces.js" cd "$2")"
	echo ${dir};

        if [ -d "$dir" ]; then
            cd "$dir" || exit 1
	    pwd;
        else
            echo "Directory does not exist: $dir"
            exit 2
        fi
        ;;
    *)
        echo "Usage: $0 ls | cd <id>"
        exit 1
        ;;
esac
