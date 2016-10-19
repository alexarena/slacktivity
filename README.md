# slacktivity
Monitor changes to sites through Slack
# Database Configuration
Slacktivity Monitor uses [PostgreSQL](https://www.postgresql.org/) for it's database. It's easy to get started with, especially for Mac users who can install it through [Homebrew](http://brew.sh/) using: 

`brew install postgres`.

Once you have Postgres installed, navigate to the folder containing the `slacktivity_db` file and run the following command:

`createdb slacktivity && psql -d slacktivity -f slacktivity_db`

This will create a new database that's configured properly for Slacktivity Monitor. You'll also need to setup a `.env` file which contains the environment variables that tell Slacktivity Monitor how to connect to the database. Here's what mine looks like on a test installation:

`PGDATABASE='slacktivity'
PGHOST='localhost'
PGPORT='5432'
PGUSER=''
PGPASSWORD=''`

You'll obviously need to change those values as necessary. It's also worth noting that the `.env` file is hidden on the Mac. If you're not sure how to work with hidden files, [this is a good primer](http://www.macworld.co.uk/how-to/mac-software/how-show-hidden-files-in-mac-os-x-finder-funter-3520878/).


