import { create } from 'zustand'
import { Account } from '@/types'

interface State {
  account: Account | null
  selectAccount: (id: number, name: string) => void
}

const useStore = create<State>()(set => ({
  account: { id: 1, name: "Checking" },
  selectAccount: (id: number, name: string) => set({ account: { id, name } })
}))

export default useStore
