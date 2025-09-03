CREATE VIEW IF NOT EXISTS v_transactions_full AS
SELECT
    (transactions.id) AS id,
    (transactions.date) AS date,
    (accounts.name) AS account,
    (accounts.id) AS account_id,
    (payees.name) AS payee,
    (categories.name) AS category,
    (transactions.memo) AS memo,
    (transactions.amount_cents) AS amount_cents
FROM
    transactions
    INNER JOIN accounts ON transactions.account = accounts.id
    LEFT JOIN payees ON transactions.payee = payees.id
    LEFT JOIN categories ON transactions.category = categories.id;