import { useMemo } from 'react'
import type { ChecklistItem } from '../types/report'

export function useProgress(
  security: ChecklistItem[],
  cleaning: ChecklistItem[],
  rounds:   ChecklistItem[],
) {
  return useMemo(() => {
    const all    = [...security, ...cleaning, ...rounds]
    const filled = all.filter(i => i.status !== '').length
    if (all.length === 0) return 0
    return Math.round((filled / all.length) * 100)
  }, [security, cleaning, rounds])
}
