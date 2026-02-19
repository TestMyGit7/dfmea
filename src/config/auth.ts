import type { User } from '@/types'

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Alice Viewer',
    email: 'viewer@dfmea.com',
    role: 'viewer',
    password: 'viewer123',
  },
  {
    id: '2',
    name: 'Bob Engineer',
    email: 'engineer@dfmea.com',
    role: 'engineer',
    password: 'engineer123',
  },
  {
    id: '3',
    name: 'Carol Admin',
    email: 'admin@dfmea.com',
    role: 'admin',
    password: 'admin123',
  },
]

export const ROLE_ROUTES: Record<string, string> = {
  viewer: '/viewer',
  engineer: '/engineer',
  admin: '/admin',
}
