# retro3 runner

Runner program to execute jobs (transcoding...) of remote retro3 instances.

Commands below has to be run at the root of retro3 git repository.

## Dev

### Install dependencies

```bash
cd retro3-root
yarn install --pure-lockfile
cd apps/retro3-runner && yarn install --pure-lockfile
```

### Develop

```bash
cd retro3-root
npm run dev:retro3-runner
```

### Build

```bash
cd retro3-root
npm run build:retro3-runner
```

### Run

```bash
cd retro3-root
node apps/retro3-runner/dist/retro3-runner.js --help
```

### Publish on NPM

```bash
cd retro3-root
(cd apps/retro3-runner && npm version patch) && npm run build:retro3-runner && (cd apps/retro3-runner && npm publish --access=public)
```
