-- Delete seeded transactions first (FKs)
DELETE FROM transactions WHERE id IN (1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014);

-- Delete budget allocations for seeded months
DELETE FROM budget_allocations WHERE month IN ('2025-08','2025-09');

-- Delete categories/payees/accounts we added
DELETE FROM categories WHERE id IN (1,2,3,4,5,6,7,8,9);
DELETE FROM payees WHERE id IN (1,2,3,4,5,6,7,8,9,10);
DELETE FROM accounts WHERE id IN (1,2,3);