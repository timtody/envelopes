// TransactionsTable.tsx
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

type Txn = {
  id: number
  account: string
  date: string // "YYYY-MM-DD"
  payee: string
  amountCents: number
}

const fmtEUR = (cents: number) =>
  (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'EUR'
  })

function NewTransactionForm ({
  account,
  onNewTransaction
}: {
  account: string
  onNewTransaction: () => void
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payee = formData.get('payee') as string
    const amount = formData.get('amount') as string
    const date = formData.get('date') as string

    if (!payee || !amount || !date) {
      alert('All fields are required')
    }

    const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100)
    if (isNaN(amountCents)) {
      alert('Invalid amount')
    }
    console.log({ account, date, payee, amountCents })
    invoke<Txn[]>('create_txn_cmd', { account, date, payee, amountCents })
      .then(() => {
        onNewTransaction()
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <form onSubmit={handleSubmit} className='p-2 border-t flex gap-2'>
      <input
        type='date'
        name='date'
        defaultValue={new Date().toISOString().split('T')[0]}
        className='input'
        required
      />
      <input
        type='text'
        name='payee'
        placeholder='Payee'
        className='input'
        required
      />
      <input
        type='text'
        name='amount'
        placeholder='Amount'
        className='input text-right'
        required
      />
      <button
        type='submit'
        className='border px-4 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700'
      >
        Add
      </button>
    </form>
  )
}

export default function TransactionsTable ({
  account,
  year,
  month
}: {
  account: string | null
  year: number
  month: number
}) {
  const [rows, setRows] = useState<Txn[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = () => {
    if (!account) return
    setRows(null)
    setError(null)
    invoke<Txn[]>('get_txns_by_month_cmd', { year, month })
      .then(setRows)
      .catch(e => setError(String(e)))
  }

  useEffect(() => {
    fetchTransactions()
  }, [year, month])

  if (!account)
    return <div className='text-muted-foreground'>Select an account</div>
  if (error) return <div className='text-red-600'>Error: {error}</div>
  if (!rows)
    return <div className='animate-pulse text-muted-foreground'>Loading…</div>

  return (
    <div className='overflow-x-auto'>
      <NewTransactionForm
        account={account}
        onNewTransaction={fetchTransactions}
      />
      <table className='w-full text-sm'>
        <thead className='bg-muted/50 sticky top-0'>
          <tr>
            <th className='p-2 text-left'>Date</th>
            <th className='p-2 text-left'>Payee</th>
            <th className='p-2 text-right'>Amount</th>
          </tr>
        </thead>
        <tbody className='[&_tr]:border-t'>
          {rows.map(t => (
            <tr key={t.id} className='hover:bg-muted/30'>
              <td className='p-2'>{t.date}</td>
              <td className='p-2'>{t.payee}</td>
              <td
                className={`p-2 text-right ${
                  t.amountCents >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {fmtEUR(t.amount_cents)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className='p-4 text-center text-muted-foreground'>
                No transactions this month
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
