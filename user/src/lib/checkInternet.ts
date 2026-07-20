const PROBES = [
  'https://www.google.com/favicon.ico',
  'https://captive.apple.com/hotspot-detect.html',
  'https://connectivitycheck.gstatic.com/generate_204',
  'https://www.apple.com/library/test/success.html',
]

function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const timeout = setTimeout(() => {
      img.src = ''
      resolve(false)
    }, 5000)

    img.onload = () => {
      clearTimeout(timeout)
      resolve(true)
    }
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false)
    }
    img.src = `${url}?rand=${Math.random()}`
  })
}

export async function checkInternet(): Promise<boolean> {
  const results = await Promise.allSettled(PROBES.map(probeImage))
  return results.some((r) => r.status === 'fulfilled' && r.value)
}
