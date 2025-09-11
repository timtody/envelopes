import { useState } from 'react'
import './App.css'
import TransactionsTable from './components/TransactionsTable'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import useStore from './store'

function App () {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { account, selectAccount } = useStore()

  return (
    <div className='flex h-screen'>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedAccount={account}
        selectAccount={selectAccount}
      />
      <div className='flex-1 min-w-0'>
        <TopBar
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        >
          <TransactionsTable
            accountName={account?.name || ''}
            year={2025}
            month={9}
          />
        </TopBar>
      </div>
    </div>
  )
}

export default App
