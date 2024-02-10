# retro3 CLI

## Usage

See https://docs.joinretro3.org/maintain/tools#remote-tools

## Dev

## Install dependencies

```bash
cd retro3-root
yarn install --pure-lockfile
cd apps/retro3-cli && yarn install --pure-lockfile
```

## Develop

```bash
cd retro3-root
npm run dev:retro3-cli
```

## Build

```bash
cd retro3-root
npm run build:retro3-cli
```

## Run

```bash
cd retro3-root
node apps/retro3-cli/dist/retro3-cli.js --help
```

## Publish on NPM

```bash
cd retro3-root
(cd apps/retro3-cli && npm version patch) && npm run build:retro3-cli && (cd apps/retro3-cli && npm publish --access=public)
```
