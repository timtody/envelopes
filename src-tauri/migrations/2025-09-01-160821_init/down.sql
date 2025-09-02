DROP INDEX IF EXISTS idx_txn_category;
DROP INDEX IF EXISTS idx_txn_payee;
DROP INDEX IF EXISTS idx_txn_account_date;
DROP TABLE IF EXISTS transactions;

DROP INDEX IF EXISTS idx_budget_month;
DROP TABLE IF EXISTS budget_allocations;

DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS payees;
DROP TABLE IF EXISTS accounts;