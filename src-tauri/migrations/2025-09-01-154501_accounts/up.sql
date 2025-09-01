CREATE TABLE accounts(
    id              INTEGER PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    type            TEXT NOT NULL CHECK (
        type IN ('checking', 'savings', 'credit')
    ),
    balance_cents   BIGINT NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (DATE('now'))
);