# CLI tools guide

[[toc]]

## Remote retro3 CLI

`retro3-cli` is a tool that communicates with a retro3 instance using its [REST API](https://docs.joinretro3.org/api-rest-reference.html).
It can be launched from a remote server/computer to easily upload videos, manage plugins, redundancies etc.

### Installation

Ensure you have `node` installed on your system:

```bash
node --version # Should be >= 16.x
```

Then install the CLI:

```bash
sudo npm install -g @retroai/retro3-cli
```

### CLI wrapper

The wrapper provides a convenient interface to the following sub-commands.

```
Usage: retro3-cli [command] [options]

Options:
  -v, --version                     output the version number
  -h, --help                        display help for command

Commands:
  auth                              Register your accounts on remote instances to use them with other commands
  upload|up [options]               Upload a video on a retro3 instance
  redundancy|r                      Manage instance redundancies
  plugins|p                         Manage instance plugins/themes
  get-access-token|token [options]  Get a retro3 access token
  help [command]                    display help for command
```

The wrapper can keep track of instances you have an account on. We limit to one account per instance for now.

```bash
retro3-cli auth add -u 'RETRO3_URL' -U 'RETRO3_USER' --password 'RETRO3_PASSWORD'
retro3-cli auth list
┌──────────────────────────────┬──────────────────────────────┐
│ instance                     │ login                        │
├──────────────────────────────┼──────────────────────────────┤
│ 'RETRO3_URL'               │ 'RETRO3_USER'              │
└──────────────────────────────┴──────────────────────────────┘
```

You can now use that account to execute sub-commands without feeding the `--url`, `--username` and `--password` parameters:

```bash
retro3-cli upload <videoFile>
retro3-cli plugins list
...
```

#### retro3-cli upload

You can use this script to upload videos directly from the CLI.

Videos will be publicly available after transcoding (you can see them before that in your account on the web interface).

```bash
cd ${CLONE}
retro3-cli upload --help
```

#### retro3-cli plugins

Install/update/uninstall or list local or NPM retro3 plugins:

```bash
cd ${CLONE}
retro3-cli plugins --help
retro3-cli plugins list --help
retro3-cli plugins install --help
retro3-cli plugins update --help
retro3-cli plugins uninstall --help

retro3-cli plugins install --path /my/plugin/path
retro3-cli plugins install --npm-name retro3-theme-example
```

#### retro3-cli redundancy

Manage (list/add/remove) video redundancies:

To list your videos that are duplicated by remote instances:

```bash
retro3-cli redundancy list-remote-redundancies
```

To list remote videos that your instance duplicated:

```bash
retro3-cli redundancy list-my-redundancies
```

To duplicate a specific video in your redundancy system:

```bash
retro3-cli redundancy add --video 823
```

To remove a video redundancy:

```bash
retro3-cli redundancy remove --video 823
```


## retro3 runner

retro3 >= 5.2 supports VOD or Live transcoding by a remote retro3 runner.

### Installation

Ensure you have `node`, `ffmpeg` and `ffprobe` installed on your system:

```bash
node --version # Should be >= 16.x
ffprobe -version # Should be >= 4.3
ffmpeg -version # Should be >= 4.3
```

Then install the CLI:

```bash
sudo npm install -g @retroai/retro3-runner
```

### Configuration

The runner uses env paths like `~/.config`, `~/.cache` and `~/.local/share` directories to store runner configuration or temporary files.

Multiple retro3 runners can run on the same OS by using the `--id` CLI option (each runner uses its own config/tmp directories):

```bash
retro3-runner [commands] --id instance-1
retro3-runner [commands] --id instance-2
retro3-runner [commands] --id instance-3
```

You can change the runner configuration (jobs concurrency, ffmpeg threads/nice etc) by editing `~/.config/retro3-runner-nodejs/[id]/config.toml`.

### Run the server

You need to run the runner in server mode first so it can run transcoding jobs of registered retro3 instances:

```bash
retro3-runner server
```

### Register

Then, you can register the runner to process transcoding job of a remote retro3 instance:

```bash
retro3-runner register --url http://retro3.example.com --registration-token ptrrt-... --runner-name my-runner-name
```

The runner will then use a websocket connection with the retro3 instance to be notified about new available transcoding jobs.

### Unregister

To unregister a retro3 instance:

```bash
retro3-runner unregister --url http://retro3.example.com --runner-name my-runner-name
```

### List registered instances

```bash
retro3-runner list-registered
```

## Server tools

Server tools are scripts that interact directly with the code of your retro3 instance.
They must be run on the server, in `retro3-latest` directory.

### Parse logs

To parse retro3 last log file:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run parse-log -- --level info
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run parse-log -- --level info
```

:::

`--level` is optional and could be `info`/`warn`/`error`

You can also remove SQL or HTTP logs using `--not-tags` (retro3 >= 3.2):

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run parse-log -- --level debug --not-tags http sql
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run parse-log -- --level debug --not-tags http sql
```

:::

### Regenerate video thumbnails

Regenerating local video thumbnails could be useful because new retro3 releases may increase thumbnail sizes:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run regenerate-thumbnails
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run regenerate-thumbnails
```

:::

### Add or replace specific video file

You can use this script to import a video file to replace an already uploaded file or to add a new web compatible resolution to a video. retro3 needs to be running.
You can then create a transcoding job using the web interface if you need to optimize your file or create an HLS version of it.

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run create-import-video-file-job -- -v [videoUUID] -i [videoFile]
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run create-import-video-file-job -- -v [videoUUID] -i [videoFile]
```

:::

### Move video files from filesystem to object storage

Use this script to move all video files or a specific video file to object storage.

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run create-move-video-storage-job -- --to-object-storage -v [videoUUID]
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run create-move-video-storage-job -- --to-object-storage -v [videoUUID]
```

:::

The script can also move all video files that are not already in object storage:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run create-move-video-storage-job -- --to-object-storage --all-videos
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run create-move-video-storage-job -- --to-object-storage --all-videos
```

:::

### Move video files from object storage to filesystem

**retro3 >= 6.0**

Use this script to move all video files or a specific video file from object storage to the retro3 instance filesystem.

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run create-move-video-storage-job -- --to-file-system -v [videoUUID]
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run create-move-video-storage-job -- --to-file-system -v [videoUUID]
```

:::

The script can also move all video files that are not already on the filesystem:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run create-move-video-storage-job -- --to-file-system --all-videos
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run create-move-video-storage-job -- --to-file-system --all-videos
```

:::

### Generate storyboard

**retro3 >= 6.0**

Use this script to generate storyboard of a specific video:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run create-generate-storyboard-job -- -v [videoUUID]
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run create-generate-storyboard-job -- -v [videoUUID]
```

:::

The script can also generate all missing storyboards of local videos:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run create-generate-storyboard-job -- --all-videos
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run create-generate-storyboard-job -- --all-videos
```

:::

### Prune filesystem storage

Some transcoded videos or shutdown at a bad time can leave some unused files on your storage.
Stop retro3 and delete these files (a confirmation will be demanded first):

```bash
cd /var/www/retro3/retro3-latest
sudo systemctl stop retro3 && sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run prune-storage
```

### Update retro3 instance domain name

**Changing the hostname is unsupported and may be a risky operation, especially if you have already federated.**
If you started retro3 with a domain, and then changed it you will have
invalid torrent files and invalid URLs in your database. To fix this, you have
to run the command below (keep in mind your follower instances will NOT update their URLs).

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run update-host
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run update-host
```

:::

### Reset user password

To reset a user password from CLI, run:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run reset-password -- -u target_username
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run reset-password -- -u target_username
```

:::


### Install or uninstall plugins

The difference with `retro3 plugins` CLI is that these scripts can be used even if retro3 is not running.
If retro3 is running, you need to restart it for the changes to take effect (whereas with `retro3 plugins` CLI, plugins/themes are dynamically loaded on the server).

To install/update a plugin or a theme from the disk:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run plugin:install -- --plugin-path /local/plugin/path
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run plugin:install -- --plugin-path /local/plugin/path
```

:::

From NPM:

::: code-group

```bash
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run plugin:install -- --npm-name retro3-plugin-myplugin
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run plugin:install -- --npm-name retro3-plugin-myplugin
```

:::

To uninstall a plugin or a theme:

::: code-group

```bash [Classic installation]
cd /var/www/retro3/retro3-latest
sudo -u retro3 NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run plugin:uninstall -- --npm-name retro3-plugin-myplugin
```

```bash [Docker]
cd /var/www/retro3-docker
docker compose exec -u retro3 retro3 npm run plugin:uninstall -- --npm-name retro3-plugin-myplugin
```

:::
