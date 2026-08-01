import { createContext, useContext, useEffect, useState } from 'react'

const CompareContext = createContext(null)
const MAX = 3
const STORAGE_KEY = 'tvbs_compare_ids'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX)
  } catch {
    return []
  }
}

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(readStored)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) } catch {}
  }, [ids])

  const toggle  = (id) => setIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : prev.length < MAX ? [...prev, id] : prev
  )
  const remove  = (id) => setIds(prev => prev.filter(x => x !== id))
  const clear   = ()   => setIds([])
  const isIn    = (id) => ids.includes(id)
  const canAdd  = (id) => !ids.includes(id) && ids.length < MAX

  return (
    <CompareContext.Provider value={{ ids, toggle, remove, clear, isIn, canAdd }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
