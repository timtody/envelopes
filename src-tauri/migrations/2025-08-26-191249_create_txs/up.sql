CREATE TABLE transactions(
  id            INTEGER PRIMARY KEY,            -- autoincrement rowid
  account       TEXT NOT NULL,                  -- e.g. "Checking"
  date          TEXT NOT NULL,                  -- "YYYY-MM-DD"
  payee         TEXT NOT NULL,
  amount_cents  BIGINT NOT NULL                 -- (+) inflow, (-) outflow
);

CREATE INDEX idx_txn_account_date ON transactions(account, date);