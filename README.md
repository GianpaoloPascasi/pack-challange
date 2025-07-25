# Stack used
NestJS (easier for boilerplate code, tests ecc), Postgres and Kysely.

# AWS URL
[http://PackWebLoadBala-fxdtratk-61030586.eu-central-1.elb.amazonaws.com](http://PackWebLoadBala-fxdtratk-61030586.eu-central-1.elb.amazonaws.com)

# Running
Make sure to create a .env (for docker-compose.yml), a .env.test.local (for tests running without docker) and a .env.test.docker (for docker-compose-e2e.yml) file with the following structure:
```
DATABASE_HOST=postgres -> this is the default docker host, use this in .env and .env.test.docker use localhost instead to launch tests without Docker
DATABASE_PORT=5432
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=files
BUCKET_NAME=pack-challange-gianpaolo-packmultimediabucketbucket-fxmunxcr
BCRYPT_ROUNDS=12
JWT_SECRET=not-production-stuff-to-do-prefer-a-signing-certificate
```
To run the production version startup docker, cd into the root folder of the project and in a terminal write down `docker-compose up`.
To run e2e tests open docker, cd into the root folder of the project and in a terminal write down `docker-compose -f docker-compose-e2e.yml up`.
AWS local credentials are shared with docker-compose to allow S3 buckets to work so you need to configure your local aws cli.

# How does API work
Obtain a jwt token from the login api using the sample account `user1:m!Str0ngP4sswd` or create a new one from the signup endpoint and then login.
Every request done under the `files` route must have an Authorization Bearer JWT token in the headers (`Authorization: Bearer {JWT}`).
Check the Postman collection as reference [pack.postman_collection](pack.postman_collection).
If you run the collection in Postman adjust the baseUrl (host) in the collection variables (the collection should be already point the AWS host) and just login with the prefilled variables or signup and then login with new ones. The bearer token is set automatically via Postman response scripting so it should be all plug and play if you use the AWS host.

# How to launch tests

## If you want to run tests from your command prompt
Make sure to have a postgres instance running and populate a file called `.env.test.local` in the root project folder with [this same structure](#running).
Feel free to run in your console `npm run test` for unit tests or `npm run test:e2e` for end to end tests.
If you have VSCode you should be able also to debug them using the Run and Debug section.

## Docker way
I have setup a docker compose to launch both a postgres instance and the e2e tests. Check this [section](#running) and from the root launch in your console `docker-compose -f docker-compose-e2e.yml up`.

# Schema
The schema and initial data is at [containers/init.sql](./containers/init.sql)

# What I hadn't time to do and other ideas

## Multitenancy
Using multitenancy the data can be isolated for every provider (Pack or other companies) but sharing the same infrastructure between them. A drawback can be that the service can be flooded with massive multimedia uploads (maybe a provider is migrating all it's content in a couple of days and overloads the traffic) so you can think about replicating flooded parts of the architecture if needed (eg duplicate the apis and let the load balancer route the traffic on the instances). Multitenancy can also be useful to segregate data to sell the service as a "white label" product but at the same time it can became difficult to aggregate data between tenants for usage statistics. The most important part is that data cannot be leaked between tenants.

## Handle heavy multimedia traffic
### What i did
To handle heavy and frequent media uploads I used streams for uploading and for downloading I used S3 signed urls to reach objects directly from clients without proxying the download from the apis. 
### Other architectural improvements
To avoid overloading the main api you could create one or more instances of a microservice that manages file uploads only and notifies the main api service to update the table record when the upload is complete. You can also use a Content Delivery Network (AWS Cloudfront or Cloudflare), a system that caches files (usally multimedia but also js, css and html) in edges near users locations to reduce latency.

## Authentication/authorization

## In general
Before going in production is essential to implement an authentication level. Authentication can be useful to then authorize user access to routes or other content and disallow unauthorized access to sensitive data and nowadays also to malicious bots/scrapers.
Using an authorization system you can allow track files usage by user. Every time a user uploads, downloads or streams a file the you could log the access on a table and aggregate access data for statistics (access by provider, language, role). I did a little stub of this feature consisting in tracking user who uploaded the file.
Authorization can be useful to track CRUD operations on entities and authorize them (eg admins can create and delete files, users can only see them).

## What I did
I just implemented an authentication system for semplicity, which is just a layer that allows access to all resources. I used JWT bearer tokens, which is one of the most used technique nowadays to track user access in a sessionless and stateless way for Single Pages Apps or mobile apps.
In a production environment you should have an authorization layer to make sure you can manage user roles segregation (if needed).
To store passwords in the database I used bcrypt as password hashing algorithm which is pretty strong and secure.

## File security
As unit testing case I focused on bit wise file validation. I added the main files types signatures but could add others and support also other types.
In a production environment files could be scanned by an antivirus service like VirusTotal api or in case of S3 there is the GuardDuty service which scans automatically the bucket.

## Data aggregation for stats
I did just some basic aggregations, I didn't structure a more "complex" database to track user interaction as shown in the image 4 of the challenge attachments.
For aggregation api `/files/stats` I thought to create a simple api call to provide all possible data to the FE and give to it all the ways to manipulate data to show in the charts.
