create table categories(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
);

create table languages(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
);

create table providers(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
);

create table files(
     id SERIAL PRIMARY KEY,
     title VARCHAR(200) not null,
     description VARCHAR(1000) not null,
     category INTEGER REFERENCES categories(id) not null,
     language INTEGER REFERENCES languages(id) not null,
     provider INTEGER REFERENCES providers(id) not null,
     file varchar(2048) not null,
     mimeType varchar(128) not null
);

create table roles(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
);

create table files_roles(
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) not null,
    role_id INTEGER REFERENCES roles(id) not null,
);

create table users(
    id SERIAL PRIMARY KEY,
    username varchar(255) not null,
    password varchar()
)