# Before cloning the repo
```sh
git config --global core.autocrlf input
```
(just re-clone if already cloned).

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

Install Docker on your OS.

```sh
docker-compose up -d
```
That will install and run the app with all its dependencies (including the DB) in isolated containers. With this single command, you will have a fully functionnal API listening by default on [localhost:5000](http://localhost:5000). 

You will also have two running DB servers (one for developpement and one for running automated tests), accessible respectively on `localhost:3307` and `localhost:3308` with the user `root` and the password `root`.

If you want to manually run migrations you can do it with :
```sh 
docker exec backend npm run migrate-db
```

### I want to run the automated tests
```sh
npm run test:setup-and-run
```
Once you've exectued the previous command, you can just do : 
```sh
npm run test
```
It will just execute the tests without settting up the DB and running the migrations

## Without Docker

Install MySQL (5.7) on your OS. 
Then, change variables in .env file to match your MySQL DB settings (you'll have to manually create the dev and tess databases in your MySQL instance).

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

# Docs
You can access the docs at [localhost:5000/api-docs](http://localhost:5000/api-docs)
