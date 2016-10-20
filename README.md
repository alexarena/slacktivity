# Slacktivity Monitor
Slacktivity Monitor provides a simple, self-hosted, solution for web monitoring. When a change has been detected on a website you're monitoring, slacktivity-bot will let you know through a message in Slack. Think of it as a very barebones, open source, version of services like [Pingdom](http://pingdom.com).

**Some Highlights:**
- Monitor for any changes or for specific search terms.
- Send change notifications (with diffs) directly to a Slack channel of your choosing.
- Pretty web UI!
- Check for changes on any interval.

# Installation

The best way to install Slacktivity Monitor is through npm:

`npm install -g slacktivity-monitor`

This will install Slacktivity Monitor to your global `node_modules` folder.

# Database Configuration
Slacktivity Monitor uses [PostgreSQL](https://www.postgresql.org/) for it's database. It's easy to get started with, especially for Mac users who can install it through [Homebrew](http://brew.sh/) using: 

`brew install postgres`

Once you have Postgres installed, navigate to the folder containing the `slacktivity_db` file. This is the `slacktivity-monitor` folder contained in your global `node-modules` folder. If you don't know where your `node-modules` folder is, you can use the `npm list -g` command. On the Mac, this is usually `/usr/local/lib/node_modules/slacktivity-monitor`.

Once you're in that folder, run the following command:

`createdb slacktivity && psql -d slacktivity -f slacktivity_db`

This will create a new database that's configured properly for Slacktivity Monitor. You'll also need to setup a `.env` file which contains the environment variables that tell Slacktivity Monitor how to connect to the database. Here's what mine looks like on a test installation:

`PGDATABASE='slacktivity'`

`PGHOST='localhost'`

`PGPORT='5432'`

`PGUSER=''`

`PGPASSWORD=''`

You'll obviously need to change those values as necessary. It's also worth noting that the `.env` file is hidden on the Mac. If you're not sure how to work with hidden files, [this is a good primer](http://www.macworld.co.uk/how-to/mac-software/how-show-hidden-files-in-mac-os-x-finder-funter-3520878/).

The `.env` file should be placed in the `node-modules/slacktivity-monitor/bin` directory, alongside the `slacktivity-monitor` executable.


