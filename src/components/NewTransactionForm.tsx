import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"


type Account = {
  id: number
  name: string
}

type Category = {
  id: number
  name: string
}

export function NewTransactionForm ({
  onNewTransaction
}: {
  onNewTransaction: () => void
}) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState('')
  const [payeeName, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [memo, setMemo] = useState('')
  const [cleared, setCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch accounts and categories when component mounts
  useEffect(() => {
    invoke<Account[]>('list_accounts_cmd')
      .then(setAccounts)
      .catch(e => setError(String(e)))
    invoke<Category[]>('list_categories_cmd')
      .then(setCategories)
      .catch(e => setError(String(e)))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId || !payeeName || !amount || isSubmitting) return

    const amountCents = Number(amount)
    if (isNaN(amountCents)) {
      setError('Invalid amount')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await invoke('create_txn_cmd', {
        accountName: accounts.find(a => a.id === parseInt(accountId))?.name,
        date,
        payeeName,
        category: categoryId ? parseInt(categoryId) : null,
        memo: memo || null,
        amountCents,
        cleared: cleared ? 1 : 0
      })
      // Reset form on success
      setPayee('')
      setAmount('')
      setCategoryId('')
      setMemo('')
      setCleared(false)
      onNewTransaction()
    } catch (err) {
      setError(String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses =
    'h-8 rounded-md border border-gray-300 bg-white px-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-neutral-900/60'

  return (
    <form onSubmit={handleSubmit} className='w-full border-b p-4'>
      <div className='flex w-full flex-nowrap items-end gap-3 overflow-x-auto'>
        <div className='flex min-w-[12rem] flex-col gap-1'>
          <label
            htmlFor='txn-account'
            className='text-sm font-medium text-gray-700'
          >
            Account
          </label>
          <select
            id='txn-account'
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
            className={`${inputClasses} w-full`}
            required
          >
            <option value=''>Select account...</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex min-w-[10rem] flex-col gap-1'>
          <label
            htmlFor='txn-date'
            className='text-sm font-medium text-gray-700'
          >
            Date
          </label>
          <Input
            id='txn-date'
            type='date'
            value={date}
            onChange={e => setDate(e.target.value)}
            className={`${inputClasses} w-full`}
            required
          />
        </div>

        <div className='flex min-w-[14rem] flex-1 flex-col gap-1'>
          <label
            htmlFor='txn-payee'
            className='text-sm font-medium text-gray-700'
          >
            Payee
          </label>
          <Input
            id='txn-payee'
            type='text'
            placeholder='e.g. Grocery Store'
            value={payeeName}
            onChange={e => setPayee(e.target.value)}
            className={`${inputClasses} w-full`}
            required
          />
        </div>

        <div className='flex min-w-[12rem] flex-col gap-1'>
          <label
            htmlFor='txn-category'
            className='text-sm font-medium text-gray-700'
          >
            Category
          </label>
          <select
            id='txn-category'
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className={`${inputClasses} w-full`}
          >
            <option value=''>Uncategorized</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex min-w-[8rem] flex-col gap-1'>
          <label
            htmlFor='txn-amount'
            className='text-sm font-medium text-gray-700'
          >
            Amount
          </label>
          <Input
            id='txn-amount'
            type='text'
            inputMode='decimal'
            placeholder='-12.34'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={`${inputClasses} w-full text-right`}
            required
          />
        </div>

        <div className='flex min-w-[12rem] flex-1 flex-col gap-1'>
          <label
            htmlFor='txn-memo'
            className='text-sm font-medium text-gray-700'
          >
            Memo
          </label>
          <Input
            id='txn-memo'
            type='text'
            placeholder='Optional note'
            value={memo}
            onChange={e => setMemo(e.target.value)}
            className={`${inputClasses} w-full`}
          />
        </div>

        <div className='flex min-w-[6rem] items-center gap-2 pt-5'>
          <Checkbox
            // id='txn-cleared'
            // type='checkbox'
            // checked={cleared}
            // onChange={e => setCleared(e.target.checked)}
            // className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
          />
          <label
            htmlFor='txn-cleared'
            className='text-sm font-medium text-gray-700'
          >
            Cleared
          </label>
        </div>

        <Button>{isSubmitting ? 'Adding…' : 'Add Transaction'}</Button>
      </div>

      {error && (
        <p className='text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
    </form>
  )
}
