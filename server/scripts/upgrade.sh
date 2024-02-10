#!/bin/sh

set -eu

RETRO3_PATH=${1:-/var/www/retro3}

if [ ! -e "$RETRO3_PATH" ]; then
  echo "Error - path \"$RETRO3_PATH\" wasn't found"
  echo ""
  echo "If retro3 was installed in another path, you can specify it with"
  echo "    ./upgrade.sh <PATH>"
  exit 1
fi

if [ ! -e "$RETRO3_PATH/versions" -o ! -e "$RETRO3_PATH/config/production.yaml" ]; then
  echo "Error - Couldn't find retro3 installation in \"$RETRO3_PATH\""
  echo ""
  echo "If retro3 was installed in another path, you can specify it with"
  echo "    ./upgrade.sh <PATH>"
  exit 1
fi

if [ -x "$(command -v awk)" ] && [ -x "$(command -v sed)" ]; then
    REMAINING=$(df -k $RETRO3_PATH | awk '{ print $4}' | sed -n 2p)
    ONE_GB=$((1024 * 1024))

    if [ "$REMAINING" -lt "$ONE_GB" ]; then
      echo "Error - not enough free space for upgrading"
      echo ""
      echo "Make sure you have at least 1 GB of free space in $RETRO3_PATH"
      exit 1
    fi
fi

# Backup database
if [ -x "$(command -v pg_dump)" ]; then
  mkdir -p $RETRO3_PATH/backup

  SQL_BACKUP_PATH="$RETRO3_PATH/backup/sql-retro3_prod-$(date +"%Y%m%d-%H%M").bak"

  echo "Backing up PostgreSQL database in $SQL_BACKUP_PATH"

  DB_USER=$(node -e "console.log(require('js-yaml').load(fs.readFileSync('$RETRO3_PATH/config/production.yaml', 'utf8'))['database']['username'])")
  DB_PASS=$(node -e "console.log(require('js-yaml').load(fs.readFileSync('$RETRO3_PATH/config/production.yaml', 'utf8'))['database']['password'])")
  DB_HOST=$(node -e "console.log(require('js-yaml').load(fs.readFileSync('$RETRO3_PATH/config/production.yaml', 'utf8'))['database']['hostname'])")
  DB_PORT=$(node -e "console.log(require('js-yaml').load(fs.readFileSync('$RETRO3_PATH/config/production.yaml', 'utf8'))['database']['port'])")
  DB_SUFFIX=$(node -e "console.log(require('js-yaml').load(fs.readFileSync('$RETRO3_PATH/config/production.yaml', 'utf8'))['database']['suffix'])")
  DB_NAME=$(node -e "console.log(require('js-yaml').load(fs.readFileSync('$RETRO3_PATH/config/production.yaml', 'utf8'))['database']['name'] || '')")

  PGPASSWORD=$DB_PASS pg_dump -U $DB_USER -p $DB_PORT -h $DB_HOST -F c "${DB_NAME:-retro3${DB_SUFFIX}}" -f "$SQL_BACKUP_PATH"
else
  echo "pg_dump not found. Cannot make a SQL backup!"
fi

# If there is a pre-release, give the user a choice which one to install.
RELEASE_VERSION=$(curl -s https://api.github.com/repos/RetroAI/retro3/releases/latest | grep tag_name | cut -d '"' -f 4)
PRE_RELEASE_VERSION=$(curl -s https://api.github.com/repos/RetroAI/retro3/releases | grep tag_name | head -1 | cut -d '"' -f 4)

if [ "$RELEASE_VERSION" != "$PRE_RELEASE_VERSION" ]; then
  echo -e "Which version do you want to install?\n[1] $RELEASE_VERSION (stable) \n[2] $PRE_RELEASE_VERSION (pre-release)"
  read choice
  case $choice in
      [1]* ) VERSION="$RELEASE_VERSION";;
      [2]* ) VERSION="$PRE_RELEASE_VERSION";;
      * ) exit;
  esac
else
  VERSION="$RELEASE_VERSION"
fi

echo "Installing retro3 version $VERSION"
wget -q "https://github.com/juztamau5/retro3/releases/download/${VERSION}/retro3-${VERSION}.zip" -O "$RETRO3_PATH/versions/retro3-${VERSION}.zip"
cd $RETRO3_PATH/versions
unzip -o "retro3-${VERSION}.zip"
rm -f "retro3-${VERSION}.zip"

RELEASE_PAGE_URL="https://github.com/juztamau5/retro3/releases/tag/${VERSION}"
LATEST_VERSION_DIRECTORY="$RETRO3_PATH/versions/retro3-${VERSION}"
cd "$LATEST_VERSION_DIRECTORY"

# Launch yarn to check if we have all required dependencies
NOCLIENT=1 yarn install --production --pure-lockfile

OLD_VERSION_DIRECTORY=$(readlink "$RETRO3_PATH/retro3-latest")

# Switch to latest code version
rm -rf $RETRO3_PATH/retro3-latest
ln -s "$LATEST_VERSION_DIRECTORY" $RETRO3_PATH/retro3-latest
cp $RETRO3_PATH/retro3-latest/config/default.yaml $RETRO3_PATH/config/default.yaml

echo ""
echo "=========================================================="
echo ""

if [ -x "$(command -v git)" ]; then
  cd $RETRO3_PATH

  git merge-file -p config/production.yaml "$OLD_VERSION_DIRECTORY/config/production.yaml.example" "retro3-latest/config/production.yaml.example" | tee "config/production.yaml.new" > /dev/null
  echo "$RETRO3_PATH/config/production.yaml.new generated"
  echo "You can review it and replace your existing production.yaml configuration"
else
  echo "git command not found: unable to generate config/production.yaml.new configuration file based on your existing production.yaml configuration"
fi

echo ""
echo "=========================================================="
echo ""
echo "Please read the IMPORTANT NOTES on $RELEASE_PAGE_URL"
echo ""
echo "Then restart retro3!"
