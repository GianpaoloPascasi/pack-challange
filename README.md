# Stack used
NestJS (easier for boilerplate code, tests ecc), Postgres and Kysely.

# AWS URL
[http://packwebloadbala-fusstxak-1072168013.eu-central-1.elb.amazonaws.com/](http://packwebloadbala-fusstxak-1072168013.eu-central-1.elb.amazonaws.com/)

# Tests to watch 
I did some exaple tests in app\uploader-api\test\files.e2e-spec.ts (E2E) and app\uploader-api\src\files\files.service.spec.ts (Unit test).

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

# Schema
The schema and initial data is at [containers/init.sql](./containers/init.sql)

# What I hadn't time to do and other ideas
- About multitenantcy this service could be replicated (both apis and database instances) for every provider (Pack or other companies) to avoid overloading one service with massive multimedia uploads
(maybe a provider is migratin all it's content in a couple of days and overloads the traffic).
- To handle heavy and frequent media uploads you could use streams (for videos) and upload data direcly on clouds (eg S3). To avoid overloading the main api you could create one or more instances of a microservice that manages file uploads only and updates the files table record when the upload is complete. You could also stream files directly from S3 and avoiding to proxy clients using the backend.
- Using an authentication system you can track files usage by user. Every time a user downloads or streams a file the you could log the access on a table and aggregate access data for statistics (access by nation, company, language, role). I skipped implementing the auth system due to lack of time.
- I did the best effort to give an example of bit wise file validation but I could add other file types and signatures. I implemented this feature because I think that it is a valuable case for unit testing.
- Files could be scanned by an antivirus service (like virustotal api or similar).
