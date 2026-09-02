import type { DogPolicy } from '../data/types'

export function isDogOk(policy: DogPolicy): boolean {
  return policy === 'allowed-off-leash' || policy === 'allowed-on-leash'
}
