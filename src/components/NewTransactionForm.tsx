import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

export function NewTransactionForm ({
  accountName,
  onNewTransaction
}: {
  accountName: number
  onNewTransaction: () => void
}) {
  const [payeeName, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payeeName || !amount || isSubmitting) return

    const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100)
    if (isNaN(amountCents)) {
      setError('Invalid amount')
      return
    }

    setIsSubmitting(true)
    setError(null)
    const category = null
    const memo = null

    try {
      await invoke('create_txn_cmd', {
        accountName,
        date,
        payeeName,
        category,
        memo,
        amountCents
      })
      // Reset form on success
      setPayee('')
      setAmount('')
      onNewTransaction()
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='border-b p-2 overflow-x-auto'>
      <div className='flex items-center gap-2 whitespace-nowrap'>
        <label className='sr-only' htmlFor='txn-date'>
          Date
        </label>
        <input
          id='txn-date'
          type='date'
          value={date}
          onChange={e => setDate(e.target.value)}
          className='h-8 w-[9.75rem] shrink-0 rounded-md border border-gray-300 bg-white px-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-900/60'
          required
        />

        <label className='sr-only' htmlFor='txn-payee'>
          Payee
        </label>
        <input
          id='txn-payee'
          type='text'
          placeholder='Payee'
          value={payeeName}
          onChange={e => setPayee(e.target.value)}
          className='h-8 min-w-[12rem] flex-1 rounded-md border border-gray-300 bg-white px-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-900/60'
          required
        />

        <label className='sr-only' htmlFor='txn-amount'>
          Amount
        </label>
        <input
          id='txn-amount'
          type='text'
          inputMode='decimal'
          placeholder='Amount'
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className='h-8 w-28 shrink-0 rounded-md border border-gray-300 bg-white px-2 text-right text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-900/60'
          required
        />

        <button
          type='submit'
          className='inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60'
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
      </div>

      {error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
    </form>
  )
}
