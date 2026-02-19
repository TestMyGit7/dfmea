import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ViewerPage } from '@/pages/viewer/ViewerPage'
import { EngineerPage } from '@/pages/engineer/EngineerPage'
import { AdminPage } from '@/pages/admin/AdminPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/viewer"
            element={
              <ProtectedRoute allowedRoles={['viewer', 'engineer', 'admin']}>
                <ViewerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/engineer"
            element={
              <ProtectedRoute allowedRoles={['engineer', 'admin']}>
                <EngineerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
