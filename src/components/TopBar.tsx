import { ReactNode, useState, useEffect } from 'react'
import { PanelLeftOpen } from 'lucide-react'

interface TopBarProps {
  children: ReactNode
  sidebarOpen: boolean
  onSidebarToggle: () => void
  sidebarAnimationDuration?: number // in milliseconds
  buttonFadeDelay?: number // in milliseconds
  buttonFadeDuration?: number // in milliseconds
}

export default function TopBar ({
  children,
  sidebarOpen,
  onSidebarToggle,
  sidebarAnimationDuration = 200,
  buttonFadeDelay = 100,
  buttonFadeDuration = 100
}: TopBarProps) {
  const [showOpenButton, setShowOpenButton] = useState(true)

  useEffect(() => {
    if (sidebarOpen) {
      setShowOpenButton(false)
    } else {
      // Delay showing open button until sidebar animation finishes
      const timer = setTimeout(() => setShowOpenButton(true), buttonFadeDelay)
      return () => clearTimeout(timer)
    }
  }, [sidebarOpen, buttonFadeDelay])

  return (
    <div className='flex flex-col h-screen'>
      {/* Top bar with drag region */}
      <div
        data-tauri-drag-region
        className={`
          h-10 flex items-center gap-2 px-3
          select-none
          ${
            sidebarOpen ? 'pl-3' : 'pl-[84px]'
          }
          bg-background/80 backdrop-blur-sm border-b border-border
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
              onClick={onSidebarToggle}
              className={`
                p-1 hover:bg-muted rounded transition-all
                ${showOpenButton ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                transitionDuration: `${buttonFadeDuration}ms`,
                pointerEvents: showOpenButton ? 'auto' : 'none'
              }}
              title='Open sidebar'
            >
              <PanelLeftOpen className='w-4 h-4' />
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
  )
}
