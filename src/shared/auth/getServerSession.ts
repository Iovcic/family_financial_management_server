import { getServerSession as nextAuthGetServerSession } from 'next-auth'
import { authOptions } from './authOptions'

export function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}
