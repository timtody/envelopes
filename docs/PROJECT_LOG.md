# ✉️ Envelopes – Project Log

## MVP Scope

The minimal version of Envelopes should allow me to:

- [ ] Create accounts
- [x] Add transactions (with payee + category)
- [ ] View transactions per account/month
- [ ] Assign budget amounts to categories per month
- [ ] View category balances (Assigned – Spent)
- [ ] Add sidebar

---

## Current Focus

- [ ] Switch accounts from side bar
  - [ ] Selected account lives in app state
  - [ ] Fast: filter transactions in Frontend?
    - I see a high risk here: When scrolling in virtual
    tables I want auto-grow behaviour. This would happen
    for all accounts then, always. -> better to use prefetch on hover
  - [ ] Visible: selected account clearly visible
  - [ ] Persistent? Should I persist the selected account?
  - [ ] Scale: handle lots of accounts

---

## Backlog

- Think about state.... zustand?
- Introduce form validation (probably zod?)
- Use shadcn/ui
- Introduce analzysis
- Debounce payee inputs
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