// TransactionsTable.tsx
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { NewTransactionForm } from './NewTransactionForm'

type TxnFull = {
  id: number
  date: string // "YYYY-MM-DD"
  account: string
  account_id: number
  payee: string | null
  category: string | null
  memo: string | null
  amount_cents: number
}

const fmtEUR = (cents: number) =>
  (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'EUR'
  })

export default function TransactionsTable ({
  accountName,
  year,
  month
}: {
  accountName: string
  year: number
  month: number
}) {
  const [rows, setRows] = useState<TxnFull[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = () => {
    if (!accountName) return
    setRows(null)
    setError(null)
    invoke<TxnFull[]>('list_txns_by_month_full_cmd', { accountName, year, month })
      .then(setRows)
      .catch(e => setError(String(e)))
  }

  useEffect(() => {
    fetchTransactions()
  }, [accountName, year, month])

  if (!accountName)
    return <div className='text-muted-foreground'>Select an account</div>
  if (error) return <div className='text-red-600'>Error: {error}</div>
  if (!rows)
    return <div className='animate-pulse text-muted-foreground'>Loading…</div>

  return (
    <div className='overflow-x-auto'>
      <NewTransactionForm
        onNewTransaction={fetchTransactions}
      />
      <table className='w-full text-sm'>
        <thead className='bg-muted/50 sticky top-0'>
          <tr>
            <th className='p-2 text-left'>Date</th>
            <th className='p-2 text-left'>Account</th>
            <th className='p-2 text-left'>Payee</th>
            <th className='p-2 text-left'>Category</th>
            <th className='p-2 text-left'>Memo</th>
            <th className='p-2 text-right'>Amount</th>
          </tr>
        </thead>
        <tbody className='[&_tr]:border-t'>
          {rows.map(t => (
            <tr key={t.id} className='hover:bg-muted/30'>
              <td className='p-2'>{t.date}</td>
              <td className='p-2'>{t.account}</td>
              <td className='p-2'>{t.payee ?? ''}</td>
              <td className='p-2'>{t.category ?? ''}</td>
              <td className='p-2'>{t.memo ?? ''}</td>
              <td
                className={`p-2 text-right ${
                  t.amount_cents >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {fmtEUR(t.amount_cents)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className='p-4 text-center text-muted-foreground'
              >
                No transactions this month
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
