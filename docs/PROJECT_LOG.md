# ✉️ Envelopes – Project Log

A lightweight log to track current work, backlog ideas, and design decisions.  
Keep it simple, keep it close to the code.

---

## MVP Scope

The minimal version of Envelopes should allow me to:

- [ ] Create accounts
- [ ] Add transactions (with payee + category)
- [ ] View transactions per account/month
- [ ] Assign budget amounts to categories per month
- [ ] View category balances (Assigned – Spent)

---

## Current Focus

- [ ] Finish Quick Add form for transactions
- [ ] Hook up `list_txns_by_month_cmd` to table
- [ ] Seed database with sample accounts/payees/categories

---

## Backlog

- Autocomplete payee field (create new payees on the fly)
- Undo option after adding a transaction
- Transfers (account → account)
- Category groups (e.g., “Living”, “Entertainment”)
- Recurring transactions
- Command palette (Ctrl+K) for quick actions
- Import/export CSV
- Dark mode toggle
- Charts: income vs expenses, net worth over time
- Rules: auto-categorize payee → category

---

## Done

- [x] Set up Diesel with migrations  
- [x] Basic schema: accounts, payees, categories, budget_allocations, transactions  
- [x] Seed migration with fake data

---

## Decisions

- Use **Diesel** instead of rusqlite (simpler to manage migrations + relations)
- Use **account closure (is_closed=1)** instead of deleting accounts
- Keep amounts in **integer cents** for precision
- Dates stored as ISO strings (`YYYY-MM-DD`)
- Categories are optional for transactions (allow “to be categorized”)

---

## Notes

- Resetting DB during dev is fine (squash migrations before release).
- PRAGMAs (`WAL`, `foreign_keys=ON`) applied at connection init, not in migrations.