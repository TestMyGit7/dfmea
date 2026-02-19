import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, AlertCircle, Loader2 } from 'lucide-react'

const DEMO_CREDENTIALS = [
  { role: 'Viewer', email: 'viewer@dfmea.com', password: 'viewer123' },
  { role: 'Engineer', email: 'engineer@dfmea.com', password: 'engineer123' },
  { role: 'Admin', email: 'admin@dfmea.com', password: 'admin123' },
]

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email.trim(), password)
      if (!result.success) {
        setError(result.error ?? 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (cred: { email: string; password: string }) => {
    setEmail(cred.email)
    setPassword(cred.password)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-accent transition-colors"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
            style={{ background: 'hsl(var(--header-bg))' }}
          >
            <span className="text-white font-bold text-lg font-mono">DF</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">DFMEA Platform</h1>
          <p className="text-muted-foreground text-sm mt-1">Design Failure Mode & Effects Analysis</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className="text-center p-2 rounded-md border border-border hover:bg-accent transition-colors"
                >
                  <div className="text-[11px] font-semibold">{cred.role}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{cred.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
