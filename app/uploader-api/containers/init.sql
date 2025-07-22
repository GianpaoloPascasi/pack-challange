create table categories(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

create table languages(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

create table providers(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

create table roles(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

create table users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(72) NOT NULL,
    salt VARCHAR(72) NOT NULL
);

create table files(
     id SERIAL PRIMARY KEY,
     title VARCHAR(200) NOT NULL,
     description VARCHAR(1000) NOT NULL,
     category INTEGER REFERENCES categories(id) NOT NULL REFERENCES categories,
     language INTEGER REFERENCES languages(id) NOT NULL REFERENCES languages,
     provider INTEGER REFERENCES providers(id) NOT NULL REFERENCES providers,
     file VARCHAR(2048) NOT NULL,
     mimeType VARCHAR(128) NOT NULL,
     roles INTEGER[],
     uploaded_by INTEGER NOT NULL REFERENCES users
);

intert into categories(name) values (), (), (), ();
insert into languages(name) values (), (), (), ();
insert into providers(name) values (), (), (), ();
insert into roles(name) values (), (), (), ();
insert into users(name) values (), (), (), ();