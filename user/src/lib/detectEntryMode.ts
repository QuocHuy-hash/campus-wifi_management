export type CaptiveEntryMode = 'cna' | 'browser'

const OS_PROBE_PATTERNS = [
  'captive.apple.com',
  'hotspot-detect.html',
  'connectivitycheck.gstatic.com',
  'connectivitycheck.android.com',
  'clients3.google.com',
  'generate_204',
  'msftconnecttest.com',
  'msftncsi.com',
  'nmcheck.gnome.org',
  'detectportal.firefox.com',
]

export function detectEntryMode(url: string): CaptiveEntryMode {
  const normalized = url.toLowerCase()
  return OS_PROBE_PATTERNS.some((pattern) => normalized.includes(pattern))
    ? 'cna'
    : 'browser'
}
