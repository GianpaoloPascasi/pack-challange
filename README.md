# Stack used
NestJS (easier for boilerplate code, tests ecc), Postgres and Kysely.

# Tests to watch 
I did some exaple tests in app\uploader-api\test\files.e2e-spec.ts (E2E) and app\uploader-api\src\files\files.service.spec.ts (Unit test).

# What I hadn't time to do
- I did the best effort to give an example of bit wise file validation but I could add other file types and signatures.
- Files could be scanned by an antivirus service (like virustotal api or something)

# Running
Make sure to create a .env and a .env.test.docker file with the following structure:
```
DATABASE_HOST=postgres -> this is the default docker host
DATABASE_PORT=5432
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=files
```
To run the production version open docker, cd into the root folder of the project and in a terminal write down `docker-compose up`.
To run e2e tests open docker, cd into the root folder of the project and in a terminal write down `docker-compose -f docker-compose-e2e.yml up`.

# How does API work
Check postman collection as reference (pack.postman_collection)

# How to test
## If you want to test from your command prompt
Make sure to have a postgres instance running and populate a file called `.env.test.local` in the root project folder with the following structure:
```
DATABASE_NAME=files
DATABASE_HOST=localhost
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_PORT=5432
DATABASE_POOL=10
```
Feel free to run in your console `npm run test` for unit tests or `npm run test:e2e` for end to end tests.
If you have VSCode you should be able also to debug them using the Run and Debug section.
## Docker way
I have setup a docker compose to launch both a postgres instance and the e2e tests. Check this [section](#if-you-want-to-test-from-your-command-prompt) and from the root launch in your console `docker-compose -f docker-compose-e2e.yml up`.
