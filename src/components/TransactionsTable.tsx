// TransactionsTable.tsx
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

type Txn = {
  id: number
  account: string
  date: string // "YYYY-MM-DD"
  payee: string
  amount_cents: number
}

const fmtEUR = (cents: number) =>
  (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'EUR'
  })

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

  useEffect(() => {
    if (!account) return
    let alive = true
    setRows(null)
    setError(null)

    invoke<Txn[]>('get_txns_cmd', { })
      .then(data => {
        if (alive) setRows(data)
      })
      .catch(e => {
        if (alive) setError(String(e))
      })

    return () => {
      alive = false
    }
  }, [account, year, month])

  if (!account)
    return <div className='text-muted-foreground'>Select an account</div>
  if (error) return <div className='text-red-600'>Error: {error}</div>
  if (!rows)
    return <div className='animate-pulse text-muted-foreground'>Loading…</div>

  return (
    <div className='overflow-x-auto'>
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
                  t.amount_cents >= 0 ? 'text-green-600' : 'text-red-600'
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
