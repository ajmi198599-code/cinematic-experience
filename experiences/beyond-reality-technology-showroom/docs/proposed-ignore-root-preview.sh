#!/bin/sh
# Proposal for the separate root Vercel project. Owner approval is required.
# Run from the repository root. Vercel interprets exit 0 as skip, exit 1 as build.
case "${VERCEL_ENV:-}:${VERCEL_GIT_COMMIT_REF:-}" in
  preview:feature/beyond-reality-showroom-sprint-*)
    previous=${VERCEL_GIT_PREVIOUS_SHA:-}
    # Compare every commit since the last successful branch deployment.
    # Missing or shallow history must build, including first-time branches.
    if [ -n "$previous" ] && git cat-file -e "$previous^{commit}" 2>/dev/null; then
      if git diff --quiet "$previous" HEAD -- . \
        ':(top,exclude)experiences/beyond-reality-technology-showroom/**'; then
        exit 0
      fi
    fi
    ;;
esac
exit 1
