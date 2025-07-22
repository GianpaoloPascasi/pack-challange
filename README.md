#Stack used
NestJS (easier for boilerplate code, tests ecc), Postgres and Kysely.

#Tests to watch 
I did some exaple tests in app\uploader-api\test\files.e2e-spec.ts (E2E) and app\uploader-api\src\files\files.service.spec.ts (Unit test).

#What I hadn't time to do
- I did the best effort to give an example of bit wise file validation but I could add other file types and signatures.
- Files could be scanned by an antivirus service (like virustotal api or something)

#Running
Make sure to create a .env and a .env.e2e file with the following structure:
```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=files
```
To run the production version open docker, cd into the root folder of the project and in a terminal write down `docker-compose up`.
To run e2e tests open docker, cd into the root folder of the project and in a terminal write down `docker-compose -f docker-compose-e2e.yml up`.

#How does API work