'use client'

import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/constants/appKeys'
import type { CaptivePortalContext } from '@/features/auth/types'
import { detectEntryMode } from '@/lib/detectEntryMode'

function extractFromURL(search: string): CaptivePortalContext | null {
  const params = new URLSearchParams(search)
  const id = params.get('id')?.trim() || ''
  const ap = params.get('ap')?.trim() || ''
  const ssid = params.get('ssid')?.trim() || ''
  const url = params.get('url')?.trim() || ''
  const t = params.get('t')?.trim() || ''

  if (!id || !ap || !ssid || !url) return null

  return { id, ap, ssid, url, t: t || undefined, entryMode: detectEntryMode(url) }
}

function readFromStorage(): CaptivePortalContext | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.portalCaptiveContext)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CaptivePortalContext>
    if (!parsed.id || !parsed.ap || !parsed.ssid || !parsed.url) return null
    return {
      id: parsed.id,
      ap: parsed.ap,
      ssid: parsed.ssid,
      url: parsed.url,
      t: parsed.t,
      entryMode: parsed.entryMode || detectEntryMode(parsed.url),
    }
  } catch {
    return null
  }
}

function saveToStorage(context: CaptivePortalContext): void {
  try {
    localStorage.setItem(STORAGE_KEYS.portalCaptiveContext, JSON.stringify(context))
  } catch {}
}

export function persistHandoff(context: CaptivePortalContext): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.captiveEntryMode, context.entryMode)
    sessionStorage.setItem(STORAGE_KEYS.captiveOriginalUrl, context.url)
  } catch {}
}

export function clearContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.portalCaptiveContext)
  } catch {}
}

export function readHandoff<T>(key: string, fallback: T): T {
  if (typeof sessionStorage === 'undefined') return fallback
  try {
    return (sessionStorage.getItem(key) as T) ?? fallback
  } catch {
    return fallback
  }
}

interface CaptivePortalState {
  context: CaptivePortalContext | null
  isReady: boolean
}

export function useCaptivePortal(): CaptivePortalState {
  const [state, setState] = useState<CaptivePortalState>({
    context: null,
    isReady: false,
  })

  useEffect(() => {
    const context = extractFromURL(window.location.search) || readFromStorage()
    if (context) {
      saveToStorage(context)
    }
    setState({ context, isReady: true })
  }, [])

  return state
}
