-- ACCOUNTS
INSERT INTO accounts (id, name, type, currency, is_closed) VALUES
  (1, 'Checking', 'checking', 'EUR', 0),
  (2, 'Savings',  'savings',  'EUR', 0),
  (3, 'Credit Card', 'credit', 'EUR', 0)
ON CONFLICT(id) DO NOTHING;

-- PAYEES
INSERT INTO payees (id, name) VALUES
  (1, 'Employer GmbH'),
  (2, 'Grocery Store'),
  (3, 'Coffee Shop'),
  (4, 'Landlord AG'),
  (5, 'Electric Co.'),
  (6, 'Water Utility'),
  (7, 'Internet Provider'),
  (8, 'Restaurant'),
  (9, 'Gym'),
  (10, 'Bookstore')
ON CONFLICT(id) DO NOTHING;

-- CATEGORIES
INSERT INTO categories (id, name) VALUES
  (1, 'Income'),
  (2, 'Rent'),
  (3, 'Groceries'),
  (4, 'Transport'),
  (5, 'Dining Out'),
  (6, 'Utilities'),
  (7, 'Subscriptions'),
  (8, 'Health'),
  (9, 'Misc')
ON CONFLICT(id) DO NOTHING;

-- BUDGET ALLOCATIONS (assigned per category per month)
INSERT INTO budget_allocations (category, month, assigned_cents) VALUES
  -- Aug 2025
  (2, '2025-08', 120000),
  (3, '2025-08', 40000),
  (4, '2025-08', 10000),
  (5, '2025-08', 15000),
  (6, '2025-08', 20000),
  (7, '2025-08',  8000),
  (8, '2025-08',  5000),
  (9, '2025-08',  5000),
  -- Sep 2025
  (2, '2025-09', 120000),
  (3, '2025-09', 38000),
  (4, '2025-09', 12000),
  (5, '2025-09', 12000),
  (6, '2025-09', 20000),
  (7, '2025-09',  8000),
  (8, '2025-09',  5000),
  (9, '2025-09',  5000)
ON CONFLICT(category, month) DO NOTHING;

-- TRANSACTIONS (fixed ids for clean down-migration)
INSERT INTO transactions (id, account, date, payee, category, memo, amount_cents, cleared) VALUES
  (1001, 1, '2025-08-01',  1, NULL, 'Salary August',  300000, 1),
  (1002, 1, '2025-08-03',  4,    2, NULL,           -120000, 1),
  (1003, 1, '2025-08-04',  7,    7, NULL,             -4000, 1),
  (1004, 1, '2025-08-05',  2,    3, NULL,             -3250, 1),
  (1005, 1, '2025-08-08',  3,    5, NULL,              -450, 1),
  (1006, 1, '2025-08-12',  8,    5, NULL,             -3800, 1),
  (1007, 1, '2025-08-15',  5,    6, NULL,             -7000, 1),
  (1008, 3, '2025-08-18',  9,    8, NULL,             -3000, 0),
  (1009, 3, '2025-08-21', 10,    9, NULL,             -2500, 0),
  (1010, 1, '2025-08-25',  6,    6, NULL,             -3000, 1),
  (1011, 1, '2025-09-01',  1, NULL, 'Salary September', 300000, 1),
  (1012, 1, '2025-09-03',  4,    2, NULL,            -120000, 1),
  (1013, 1, '2025-09-06',  2,    3, NULL,             -4100, 1),
  (1014, 1, '2025-09-10',  8,    5, NULL,             -4200, 1);