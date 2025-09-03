import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

export function NewTransactionForm ({
  accountName,
  onNewTransaction
}: {
  accountName: string
  onNewTransaction: () => void
}) {
  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payee || !amount || isSubmitting) return

    const amountCents = Math.round(parseFloat(amount.replace(',', '.')) * 100)
    if (isNaN(amountCents)) {
      setError('Invalid amount')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await invoke('create_txn_cmd', {
        accountName,
        date,
        payee,
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
    <form onSubmit={handleSubmit} className='p-2 border-b'>
      <div className='flex items-end gap-2'>
        <input
          type='date'
          value={date}
          onChange={e => setDate(e.target.value)}
          className='input p-1'
          required
        />
        <input
          type='text'
          placeholder='Payee'
          value={payee}
          onChange={e => setPayee(e.target.value)}
          className='input p-1'
          required
        />
        <input
          type='text'
          placeholder='Amount'
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className='input text-right p-1'
          required
        />
        <button type='submit' className='btn bg-blue-400 rounded-md p-1' disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && <p className='text-red-600 text-sm mt-1'>{error}</p>}
    </form>
  )
}
