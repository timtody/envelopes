import './App.css'
import TransactionsTable from './components/TransactionsTable'
import TopBar from './components/TopBar'

function App () {
  return (
    <TopBar>
      <TransactionsTable accountName={'Checking'} year={2025} month={9} />
    </TopBar>
  )
}

export default App
