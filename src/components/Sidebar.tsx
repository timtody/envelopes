import { useState, useEffect } from 'react'
import { PanelLeftClose } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'

type Account = {
  id: number
  name: string
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  animationDuration?: number
  buttonFadeDelay?: number
  buttonFadeDuration?: number
}

export default function Sidebar ({
  isOpen,
  onClose,
  animationDuration = 200,
  buttonFadeDelay = 100,
  buttonFadeDuration = 100
}: SidebarProps) {
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowCloseButton(true), buttonFadeDelay)
      return () => clearTimeout(timer)
    } else {
      setShowCloseButton(false)
    }
  }, [isOpen, buttonFadeDelay])

  // Fetch accounts when component mounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true)
      setError(null)
      try {
        const accountsData = await invoke<Account[]>('list_accounts_cmd')
        setAccounts(accountsData)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  return (
    <div
      className={`
        bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border
        transition-all ease-in-out
        ${isOpen ? 'w-64' : 'w-0'}
        overflow-hidden flex-shrink-0
        relative
      `}
      style={{
        transitionDuration: `${animationDuration}ms`
      }}
    >
      {/* Close button aligned with top bar when sidebar is open */}
      {isOpen && (
        <button
          onClick={onClose}
          className={`
            absolute top-2 right-3 p-1 hover:bg-sidebar-accent rounded transition-all z-10
            ${showCloseButton ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            transitionDuration: `${buttonFadeDuration}ms`,
            pointerEvents: showCloseButton ? 'auto' : 'none'
          }}
          title='Close sidebar'
          data-tauri-drag-region={false}
        >
          <PanelLeftClose className='w-4 h-4' />
        </button>
      )}

      <div className='w-64 p-4 pt-12'>
        <h3 className='text-sm font-medium text-sidebar-foreground mb-3'>
          Accounts
        </h3>

        <nav className='space-y-1'>
          {loading && (
            <div className='px-3 py-2 text-sm text-sidebar-foreground/70'>
              Loading accounts...
            </div>
          )}
          
          {error && (
            <div className='px-3 py-2 text-sm text-destructive'>
              Error: {error}
            </div>
          )}

          {!loading && !error && accounts.map(account => (
            <a
              key={account.id}
              href='#'
              className='block px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded'
              title={`View ${account.name} transactions`}
            >
              {account.name}
            </a>
          ))}

          {!loading && !error && accounts.length === 0 && (
            <div className='px-3 py-2 text-sm text-sidebar-foreground/70'>
              No accounts found
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
