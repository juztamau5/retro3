# Continuous integration

retro3 uses Github Actions as a CI platform.
CI tasks are described in `.github/workflows`.

## benchmark.yml

*Scheduled*

Run various benchmarks (build, API etc) and upload results on https://builds.joinretro3.org/retro3-stats/ to be publicly consumed.

## codeql.yml

*Scheduled, on push on develop and on pull request*

Run CodeQL task to throw code security issues in Github. https://lgtm.com/projects/g/RetroAI/retro3 can also be used.

## docker.yml

*Scheduled and on push on master*

Build `RetroAI/retro3-webserver:latest`, `RetroAI/retro3:production-...`, `RetroAI/retro3:v-...` (only latest retro3 tag) and `RetroAI/retro3:develop-...` Docker images. Scheduled to automatically upgrade image software (Debian security issues etc).

## nightly.yml

*Scheduled*

Build retro3 nightly build (`develop` branch) and upload the release on https://builds.joinretro3.org/nightly.

## stats.yml

*On push on develop*

Create various retro3 stats (line of codes, build size, lighthouse report) and upload results on https://builds.joinretro3.org/retro3-stats/ to be publicly consumed.

## test.yml

*Scheduled, on push and pull request*

Run retro3 lint and tests.
