import { useState } from 'react'
import './App.css'
import TransactionsTable from './components/TransactionsTable'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'

function App () {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='flex h-screen'>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      <div className='flex-1'>
        <TopBar 
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        >
          <TransactionsTable accountName={'Checking'} year={2025} month={9} />
        </TopBar>
      </div>
    </div>
  )
}

export default App
