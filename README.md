# Setup

Install dependencies and the migration tool :
```sh
npm i
npm i -g db-migrate db-migrate-mysql
```
Copy the environnement variables : 
```
cp .env.sample .env
```
This `.env` file allows to change the way the Node server connects to the database, but you probably won't have to change any of those variables unless you want to deploy the app yourself and connect it to a specific DB.

## With Docker (recommanded)

Install Docker and docker-compose on your OS.

### Run the app

```sh
docker-compose up
```
That will install and run the app with all its dependencies (including the DB) in isolated containers. With this single command, you will have a fully functionnal and persistant API listening by default on [localhost:5000](http://localhost:5000). 

You will also have two running DB servers (one for developpement and one for running automated tests), accessible respectively on `localhost:3307` and `localhost:3308` with the user `root` and the password `root`.

### Run the automated tests
```sh
npm run test:setup-and-run
```
Once you've exectued the previous command, you can just do : 
```sh
npm run test
```
It will just execute the tests without settting up the DB and running the migrations.

## Without Docker

Install MySQL on your OS and create two databases on your MySQL instance :
- contact_api_database
- contact_api_database_test

Then, change the `DB_*` variables in `.env` file to match your own MySQL DB settings

### Run the app

```sh
npm run migrate-db
npm run start:watch
```

### Run the automated tests

```sh
npm run test:migrate-db
npm run test
```

# Database migrations

If, while developping, you must change the structure of the database to fit new requirements, 
you HAVE TO write a database migration script in order for the changes to be propagated 
in contributors local databases but also in the pre-prod/prod environments' DBs.

Here's an exemple of the helper command usage : 
```
NAME=splitNameOnContacts npm run create-db-migration
```
(Replace the NAME variable value by the name of your change). It will create two SQL files in the `migrations/sqls` folder. One file is executed on the DB when applying changes (migrating up) and the other is run when rolling back changes (migrating down).

To apply the changes that have not yet been synced to the database :
```
npm run migrate-db
```

To rollback the last migration : 
```
npm run rollback-last-db-migration
```

## Applying migrations to local databases using Docker

If you want to manually run migrations while running the app with docker, you can do :
```sh 
docker exec server npm run migrate-db
```

# API Docs
You can access the docs, available by default at [localhost:5000/api-docs](http://localhost:5000/api-docs).

You can modify the docs by changing the `docs/swagger.yaml` file.

# Deployment

See  : 
- [(FR) Guide : How to host this application with CapRover on a Linux machine](DEPLOYMENT_GUIDE_FR.md)

