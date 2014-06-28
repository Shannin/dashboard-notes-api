CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(140) NOT NULL
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id SERIAL REFERENCES users,
    note TEXT NOT NULL,
    created DATE DEFAULT NOW(),
    last_modified DATE
);