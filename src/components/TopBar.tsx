import { ReactNode, useState, useEffect } from 'react'
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'

interface TopBarProps {
  children: ReactNode
  sidebarAnimationDuration?: number // in milliseconds
  buttonFadeDelay?: number // in milliseconds
  buttonFadeDuration?: number // in milliseconds
}

export default function TopBar ({
  children,
  sidebarAnimationDuration = 200,
  buttonFadeDelay = 100,
  buttonFadeDuration = 100
}: TopBarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [showOpenButton, setShowOpenButton] = useState(true)

  useEffect(() => {
    if (sidebarOpen) {
      // Delay showing close button until sidebar animation finishes
      const timer = setTimeout(() => setShowCloseButton(true), buttonFadeDelay)
      setShowOpenButton(false)
      return () => clearTimeout(timer)
    } else {
      // Delay showing open button until sidebar animation finishes
      const timer = setTimeout(() => setShowOpenButton(true), buttonFadeDelay)
      setShowCloseButton(false)
      return () => clearTimeout(timer)
    }
  }, [sidebarOpen, buttonFadeDelay])

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <div
        className={`
          bg-gray-50/95 backdrop-blur-sm border-r border-gray-200
          transition-all ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-0'}
          overflow-hidden flex-shrink-0
          relative
        `}
        style={{
          transitionDuration: `${sidebarAnimationDuration}ms`
        }}
      >
        {/* Close button aligned with top bar when sidebar is open */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className={`
              absolute top-2 right-3 p-1 hover:bg-gray-200 rounded transition-all z-10
              ${showCloseButton ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              transitionDuration: `${buttonFadeDuration}ms`,
              pointerEvents: showCloseButton ? 'auto' : 'none'
            }}
            title='Close sidebar'
            data-tauri-drag-region={false}
          >
            <PanelLeftClose className='w-5 h-5' strokeWidth={1.5} />
          </button>
        )}

        <div className='w-64 p-4 pt-12'>
          <h3 className='text-sm font-medium text-gray-700 mb-3'>Navigation</h3>

          <nav className='space-y-1'>
            <a
              href='#'
              className='block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded'
            >
              Accounts
            </a>
            <a
              href='#'
              className='block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded'
            >
              Categories
            </a>
            <a
              href='#'
              className='block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded'
            >
              Reports
            </a>
            <a
              href='#'
              className='block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded'
            >
              Settings
            </a>
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className='flex-1 flex flex-col'>
        {/* Top bar with drag region */}
        <div
          data-tauri-drag-region
          className={`
            h-10 flex items-center gap-2 px-3
            select-none
            ${
              sidebarOpen ? 'pl-3' : 'pl-[84px]'
            }                            /* dynamic space for window controls */
            bg-gray-50/80 backdrop-blur-sm border-b border-gray-200
            flex-shrink-0
            transition-all ease-in-out
          `}
          style={{
            transitionDuration: `${sidebarAnimationDuration}ms`
          }}
        >
          <div
            className='flex items-center gap-2'
            data-tauri-drag-region={false}
          >
            {/* Toggle button - only shows when sidebar is closed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className={`
                  p-1 hover:bg-gray-200 rounded transition-all
                  ${showOpenButton ? 'opacity-100' : 'opacity-0'}
                `}
                style={{
                  transitionDuration: `${buttonFadeDuration}ms`,
                  pointerEvents: showOpenButton ? 'auto' : 'none'
                }}
                title='Open sidebar'
              >
                <PanelLeftOpen className='w-5 h-5' strokeWidth={1.5}/>
              </button>
            )}
          </div>

          <div
            className='flex-1 min-h-full'
            data-tauri-drag-region
            title='Drag area'
          />
        </div>

        <div className='flex-1 overflow-hidden'>{children}</div>
      </div>
    </div>
  )
}
