CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    file_hash TEXT UNIQUE NOT NULL,
    size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE user_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    file_id INTEGER REFERENCES files(id),

    file_name TEXT NOT NULL,
    size BIGINT NOT NULL,

    uploaded_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);


CREATE INDEX idx_user_files_user
ON user_files(user_id)
WHERE deleted_at IS NULL;


CREATE INDEX idx_files_hash
ON files(file_hash);


INSERT INTO users(name)
VALUES
('User 1'),
('User 2'),
('User 3');