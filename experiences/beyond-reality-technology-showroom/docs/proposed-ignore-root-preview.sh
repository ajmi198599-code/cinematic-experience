#!/bin/sh
# Proposal for the separate root Vercel project. Owner approval is required.
# Run from the repository root. Vercel interprets exit 0 as skip, exit 1 as build.
case "${VERCEL_ENV:-}:${VERCEL_GIT_COMMIT_REF:-}" in
  preview:feature/beyond-reality-showroom-sprint-*)
    if git rev-parse --verify HEAD^ >/dev/null 2>&1; then
      if git diff --quiet HEAD^ HEAD -- . \
        ':(top,exclude)experiences/beyond-reality-technology-showroom/**' \
        ':(top,exclude)experiences/beyond-reality-phase-a/data.json'; then
        exit 0
      fi
    fi
    ;;
esac
exit 1
