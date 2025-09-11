import { useState, useEffect } from 'react'
import { PanelLeftClose } from 'lucide-react'

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

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowCloseButton(true), buttonFadeDelay)
      return () => clearTimeout(timer)
    } else {
      setShowCloseButton(false)
    }
  }, [isOpen, buttonFadeDelay])

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
        <h3 className='text-sm font-medium text-sidebar-foreground mb-3'>Navigation</h3>

        <nav className='space-y-1'>
          <a
            href='#'
            className='block px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded'
          >
            Accounts
          </a>
          <a
            href='#'
            className='block px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded'
          >
            Categories
          </a>
          <a
            href='#'
            className='block px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded'
          >
            Reports
          </a>
          <a
            href='#'
            className='block px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded'
          >
            Settings
          </a>
        </nav>
      </div>
    </div>
  )
}
