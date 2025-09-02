-- ACCOUNTS
CREATE TABLE accounts (
  id         INTEGER NOT NULL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL CHECK(type IN ('checking','savings','cash','credit','investment')),
  currency   TEXT NOT NULL DEFAULT 'EUR',
  balance_cents  BIGINT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (DATE('now')),
  is_closed  INTEGER NOT NULL DEFAULT 0
);

-- PAYEES
CREATE TABLE payees (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

-- CATEGORIES (simple: just a flat list; add groups later if needed)
CREATE TABLE categories (
  id    INTEGER NOT NULL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

-- BUDGET ALLOCATIONS (assigned per category per month)
-- month stored as 'YYYY-MM'
CREATE TABLE budget_allocations (
  category     INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month           TEXT    NOT NULL,
  assigned_cents  BIGINT  NOT NULL DEFAULT 0,
  PRIMARY KEY (category, month)
);
CREATE INDEX idx_budget_month ON budget_allocations(month);

-- TRANSACTIONS (single-category for MVP; make category_id NULLABLE to allow "To Be Categorized")
CREATE TABLE transactions (
  id            INTEGER NOT NULL PRIMARY KEY,
  account    INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  date          TEXT    NOT NULL,              -- 'YYYY-MM-DD'
  payee      INTEGER     REFERENCES payees(id) ON DELETE RESTRICT,
  category   INTEGER     REFERENCES categories(id) ON DELETE SET NULL,
  memo          TEXT,
  amount_cents  BIGINT  NOT NULL,              -- (+) inflow, (-) outflow
  cleared       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_txn_account_date ON transactions(account, date);
CREATE INDEX idx_txn_payee ON transactions(payee);
CREATE INDEX idx_txn_category ON transactions(category);