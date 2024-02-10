# Production guide

  * [Installation](#installation)
  * [Upgrade](#upgrade)

## Installation

Please don't install retro3 for production on a device behind a low bandwidth connection (example: your ADSL link).
If you want information about the appropriate hardware to run retro3, please see the [FAQ](https://joinretro3.org/en_US/faq#should-i-have-a-big-server-to-run-retro3).

### :hammer: Dependencies

Follow the steps of the [dependencies guide](/support/doc/dependencies.md).

### :construction_worker: retro3 user

Create a `retro3` user with `/var/www/retro3` home:

```bash
sudo useradd -m -d /var/www/retro3 -s /bin/bash -p retro3 retro3
```

Set its password:
```bash
sudo passwd retro3
```

Ensure the retro3 root directory is traversable by nginx:

```bash
ls -ld /var/www/retro3 # Should be drwxr-xr-x
```

**On FreeBSD**

```bash
sudo pw useradd -n retro3 -d /var/www/retro3 -s /usr/local/bin/bash -m
sudo passwd retro3
```
or use `adduser` to create it interactively.

### :card_file_box: Database

Create the production database and a retro3 user inside PostgreSQL:

```bash
cd /var/www/retro3
sudo -u postgres createuser -P retro3
```

Here you should enter a password for PostgreSQL `retro3` user, that should be copied in `production.yaml` file.
Don't just hit enter else it will be empty.

```bash
sudo -u postgres createdb -O retro3 -E UTF8 -T template0 retro3_prod
```

Then enable extensions retro3 needs:

```bash
sudo -u postgres psql -c "CREATE EXTENSION pg_trgm;" retro3_prod
sudo -u postgres psql -c "CREATE EXTENSION unaccent;" retro3_prod
```

### :page_facing_up: Prepare retro3 directory

Fetch the latest tagged version of retro3:

```bash
VERSION=$(curl -s https://api.github.com/repos/RetroAI/retro3/releases/latest | grep tag_name | cut -d '"' -f 4) && echo "Latest retro3 version is $VERSION"
```


Open the retro3 directory, create a few required directories:

```bash
cd /var/www/retro3
sudo -u retro3 mkdir config storage versions
sudo -u retro3 chmod 750 config/
```


Download the latest version of the retro3 client, unzip it and remove the zip:

```bash
cd /var/www/retro3/versions
# Releases are also available on https://builds.joinretro3.org/release
sudo -u retro3 wget -q "https://github.com/juztamau5/retro3/releases/download/${VERSION}/retro3-${VERSION}.zip"
sudo -u retro3 unzip -q retro3-${VERSION}.zip && sudo -u retro3 rm retro3-${VERSION}.zip
```


Install retro3:

```bash
cd /var/www/retro3
sudo -u retro3 ln -s versions/retro3-${VERSION} ./retro3-latest
cd ./retro3-latest && sudo -H -u retro3 yarn install --production --pure-lockfile
```

### :wrench: retro3 configuration

Copy the default configuration file that contains the default configuration provided by retro3.
You **must not** update this file.

```bash
cd /var/www/retro3
sudo -u retro3 cp retro3-latest/config/default.yaml config/default.yaml
```

Now copy the production example configuration:

```bash
cd /var/www/retro3
sudo -u retro3 cp retro3-latest/config/production.yaml.example config/production.yaml
```

Then edit the `config/production.yaml` file according to your webserver and database configuration. In particular:
 * `webserver`: Reverse proxy public information
 * `secrets`: Secret strings you must generate manually (retro3 version >= 5.0)
 * `database`: PostgreSQL settings
 * `redis`: Redis settings
 * `smtp`: If you want to use emails
 * `admin.email`: To correctly fill `root` user email

Keys defined in `config/production.yaml` will override keys defined in `config/default.yaml`.

**retro3 does not support webserver host change**. Even though [retro3 CLI can help you to switch hostname](https://docs.joinretro3.org/maintain/tools#update-host-js) there's no official support for that since it is a risky operation that might result in unforeseen errors.

### :truck: Webserver

We only provide official configuration files for Nginx.

Copy the nginx configuration template:

```bash
sudo cp /var/www/retro3/retro3-latest/support/nginx/retro3 /etc/nginx/sites-available/retro3
```

Then set the domain for the webserver configuration file.
Replace `[retro3-domain]` with the domain for the retro3 server.

```bash
sudo sed -i 's/${WEBSERVER_HOST}/[retro3-domain]/g' /etc/nginx/sites-available/retro3
sudo sed -i 's/${RETRO3_HOST}/127.0.0.1:9000/g' /etc/nginx/sites-available/retro3
```

Then modify the webserver configuration file. Please pay attention to the `alias` keys of the static locations.
It should correspond to the paths of your storage directories (set in the configuration file inside the `storage` key).

```bash
sudo vim /etc/nginx/sites-available/retro3
```

Activate the configuration file:

```bash
sudo ln -s /etc/nginx/sites-available/retro3 /etc/nginx/sites-enabled/retro3
```

To generate the certificate for your domain as required to make https work you can use [Let's Encrypt](https://letsencrypt.org/):

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone --post-hook "systemctl restart nginx"
sudo systemctl reload nginx
```

Certbot should have installed a cron to automatically renew your certificate.
Since our nginx template supports webroot renewal, we suggest you to update the renewal config file to use the `webroot` authenticator:

```bash
# Replace authenticator = standalone by authenticator = webroot
# Add webroot_path = /var/www/certbot
sudo vim /etc/letsencrypt/renewal/your-domain.com.conf
```

If you plan to have many concurrent viewers on your retro3 instance, consider increasing `worker_connections` value: https://nginx.org/en/docs/ngx_core_module.html#worker_connections.

<details>
<summary><strong>If using FreeBSD</strong></summary>

On FreeBSD you can use [Dehydrated](https://dehydrated.io/) `security/dehydrated` for [Let's Encrypt](https://letsencrypt.org/)

```bash
sudo pkg install dehydrated
```
</details>

### :alembic: Linux TCP/IP Tuning

```bash
sudo cp /var/www/retro3/retro3-latest/support/sysctl.d/30-retro3-tcp.conf /etc/sysctl.d/
sudo sysctl -p /etc/sysctl.d/30-retro3-tcp.conf
```

Your distro may enable this by default, but at least Debian 9 does not, and the default FIFO
scheduler is quite prone to "Buffer Bloat" and extreme latency when dealing with slower client
links as we often encounter in a video server.

### :bricks: systemd

If your OS uses systemd, copy the configuration template:

```bash
sudo cp /var/www/retro3/retro3-latest/support/systemd/retro3.service /etc/systemd/system/
```

Check the service file (retro3 paths and security directives):

```bash
sudo vim /etc/systemd/system/retro3.service
```


Tell systemd to reload its config:

```bash
sudo systemctl daemon-reload
```

If you want to start retro3 on boot:

```bash
sudo systemctl enable retro3
```

Run:

```bash
sudo systemctl start retro3
sudo journalctl -feu retro3
```

<details>
<summary><strong>If using FreeBSD</strong></summary>

On FreeBSD, copy the startup script and update rc.conf:

```bash
sudo install -m 0555 /var/www/retro3/retro3-latest/support/freebsd/retro3 /usr/local/etc/rc.d/
sudo sysrc retro3_enable="YES"
```

Run:

```bash
sudo service retro3 start
```
</details>

<details>
<summary><strong>If using OpenRC</strong></summary>

If your OS uses OpenRC, copy the service script:

```bash
sudo cp /var/www/retro3/retro3-latest/support/init.d/retro3 /etc/init.d/
```

If you want to start retro3 on boot:

```bash
sudo rc-update add retro3 default
```

Run and print last logs:

```bash
sudo /etc/init.d/retro3 start
tail -f /var/log/retro3/retro3.log
```
</details>

### :technologist: Administrator

The administrator username is `root` and the password is automatically generated. It can be found in retro3
logs (path defined in `production.yaml`). You can also set another password with:

```bash
cd /var/www/retro3/retro3-latest && NODE_CONFIG_DIR=/var/www/retro3/config NODE_ENV=production npm run reset-password -- -u root
```

Alternatively you can set the environment variable `PT_INITIAL_ROOT_PASSWORD`,
to your own administrator password, although it must be 6 characters or more.

### :tada: What now?

Now your instance is up you can:

 * Add your instance to the public retro3 instances index if you want to: https://instances.joinretro3.org/
 * Check [available CLI tools](/support/doc/tools.md)

## Upgrade

### retro3 instance

**Check the changelog (in particular the *IMPORTANT NOTES* section):** https://github.com/juztamau5/retro3/blob/main/CHANGELOG.md

Run the upgrade script (the password it asks is retro3's database user password):

```bash
cd /var/www/retro3/retro3-latest/scripts && sudo -H -u retro3 ./upgrade.sh
sudo systemctl restart retro3 # Or use your OS command to restart retro3 if you don't use systemd
```

<details>
<summary><strong>Prefer manual upgrade?</strong></summary>

Make a SQL backup

```bash
SQL_BACKUP_PATH="backup/sql-retro3_prod-$(date -Im).bak" && \
    cd /var/www/retro3 && sudo -u retro3 mkdir -p backup && \
    sudo -u postgres pg_dump -F c retro3_prod | sudo -u retro3 tee "$SQL_BACKUP_PATH" >/dev/null
```

Fetch the latest tagged version of retro3:

```bash
VERSION=$(curl -s https://api.github.com/repos/RetroAI/retro3/releases/latest | grep tag_name | cut -d '"' -f 4) && echo "Latest retro3 version is $VERSION"
```

Download the new version and unzip it:

```bash
cd /var/www/retro3/versions && \
    sudo -u retro3 wget -q "https://github.com/juztamau5/retro3/releases/download/${VERSION}/retro3-${VERSION}.zip" && \
    sudo -u retro3 unzip -o retro3-${VERSION}.zip && \
    sudo -u retro3 rm retro3-${VERSION}.zip
```

Install node dependencies:

```bash
cd /var/www/retro3/versions/retro3-${VERSION} && \
    sudo -H -u retro3 yarn install --production --pure-lockfile
```

Copy new configuration defaults values and update your configuration file:

```bash
sudo -u retro3 cp /var/www/retro3/versions/retro3-${VERSION}/config/default.yaml /var/www/retro3/config/default.yaml
diff -u /var/www/retro3/versions/retro3-${VERSION}/config/production.yaml.example /var/www/retro3/config/production.yaml
```

Change the link to point to the latest version:

```bash
cd /var/www/retro3 && \
    sudo unlink ./retro3-latest && \
    sudo -u retro3 ln -s versions/retro3-${VERSION} ./retro3-latest
```
</details>

### Update retro3 configuration

Check for configuration changes, and report them in your `config/production.yaml` file:

```bash
cd /var/www/retro3/versions
diff -u "$(ls --sort=t | head -2 | tail -1)/config/production.yaml.example" "$(ls --sort=t | head -1)/config/production.yaml.example"
```

### Update nginx configuration

Check changes in nginx configuration:

```bash
cd /var/www/retro3/versions
diff -u "$(ls --sort=t | head -2 | tail -1)/support/nginx/retro3" "$(ls --sort=t | head -1)/support/nginx/retro3"
```

### Update systemd service

Check changes in systemd configuration:

```bash
cd /var/www/retro3/versions
diff -u "$(ls --sort=t | head -2 | tail -1)/support/systemd/retro3.service" "$(ls --sort=t | head -1)/support/systemd/retro3.service"
```

### Restart retro3

If you changed your nginx configuration:

```bash
sudo systemctl reload nginx
```

If you changed your systemd configuration:

```bash
sudo systemctl daemon-reload
```

Restart retro3 and check the logs:

```bash
sudo systemctl restart retro3 && sudo journalctl -fu retro3
```

### Things went wrong?

Change `retro3-latest` destination to the previous version and restore your SQL backup:

```bash
OLD_VERSION="v0.42.42" && SQL_BACKUP_PATH="backup/sql-retro3_prod-2018-01-19T10:18+01:00.bak" && \
  cd /var/www/retro3 && sudo -u retro3 unlink ./retro3-latest && \
  sudo -u retro3 ln -s "versions/retro3-$OLD_VERSION" retro3-latest && \
  sudo -u postgres pg_restore -c -C -d postgres "$SQL_BACKUP_PATH" && \
  sudo systemctl restart retro3
```
