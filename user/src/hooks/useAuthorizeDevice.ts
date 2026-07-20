'use client'

import { useCallback, useState } from 'react'
import { authorizeDevice, getMeProfile } from '@/features/auth/api/authApi'
import { setAxiosAuthToken } from '@/config/axios'
import { AUTH_COOKIE_KEY, STORAGE_KEYS } from '@/constants/appKeys'
import type { CaptivePortalContext } from '@/features/auth/types'
import { buildAuthorizeDevicePayload } from '@/lib/captivePortal'
import { persistHandoff, clearContext } from '@/hooks/useCaptivePortal'
import { logRedirect } from '@/lib/redirectLog'

export async function setSessionCookie(accessToken: string): Promise<boolean> {
  try {
    document.cookie = `${AUTH_COOKIE_KEY}=${accessToken};path=/;max-age=3600;SameSite=Lax`
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    }).catch(() => {})
    return true
  } catch {
    return false
  }
}

export async function hasServerSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}

export async function persistSession(identifier: string, fallbackRole?: string): Promise<void> {
  try {
    const profile = await getMeProfile()
    localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true')
    localStorage.setItem(
      STORAGE_KEYS.portalUser,
      JSON.stringify({
        id: profile.id,
        username: profile.username || identifier,
        fullname: profile.fullName || identifier,
        email: profile.email || identifier,
        role: fallbackRole || 'CLIENT',
        status: profile.status,
        avatarUrl: profile.avatarUrl,
        loginTime: profile.lastLoginAt || new Date().toISOString(),
      }),
    )
  } catch {
    localStorage.setItem(STORAGE_KEYS.portalLoggedIn, 'true')
    localStorage.setItem(
      STORAGE_KEYS.portalUser,
      JSON.stringify({
        id: 'unknown',
        username: identifier,
        fullname: identifier,
        email: identifier,
        role: fallbackRole || 'CLIENT',
        status: 'ACTIVE',
        avatarUrl: null,
        loginTime: new Date().toISOString(),
      }),
    )
  }
}

export function clearStaleSession(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.portalLoggedIn)
  localStorage.removeItem(STORAGE_KEYS.portalUser)
}

interface AuthorizeResult {
  success: boolean
  error: string | null
}

export function useAuthorizeDevice() {
  const [result, setResult] = useState<AuthorizeResult>({ success: false, error: null })
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (context: CaptivePortalContext): Promise<boolean> => {
    setIsLoading(true)
    setResult({ success: false, error: null })

    try {
      const payload = buildAuthorizeDevicePayload(context)
      await authorizeDevice(payload)

      persistHandoff(context)
      clearContext()

      logRedirect(
        '/network-connecting',
        `authorize OK (entryMode=${context.entryMode})`,
      )
      window.location.href = '/network-connecting'
      setResult({ success: true, error: null })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xác thực thiết bị thất bại'
      setResult({ success: false, error: message })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult({ success: false, error: null })
    setIsLoading(false)
  }, [])

  return { execute, isLoading, result, reset }
}
