import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { checkInternet } from '@/lib/checkInternet'
import type { CaptiveEntryMode } from '@/lib/detectEntryMode'

interface NetworkConnectingScreenProps {
  mode: CaptiveEntryMode
  onComplete: () => void
}

const POLL_INTERVAL = 2000
const FALLBACK_TIMEOUT_SEC = 18
const DELAY_BEFORE_REDIRECT = 1000

export default function NetworkConnectingScreen({ mode, onComplete }: NetworkConnectingScreenProps) {
  const [phase, setPhase] = useState<'connecting' | 'success'>('connecting')
  const [elapsedTime, setElapsedTime] = useState(0)
  const completedRef = useRef(false)

  const finish = useCallback((force = false) => {
    if (completedRef.current && !force) return
    completedRef.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    let pollingId: ReturnType<typeof setInterval>
    let redirectId: ReturnType<typeof setTimeout>
    let timerId: ReturnType<typeof setInterval>

    timerId = setInterval(() => setElapsedTime((prev) => prev + 1), 1000)

    pollingId = setInterval(async () => {
      const online = await checkInternet()
      if (!online) return

      clearInterval(pollingId)
      clearInterval(timerId)
      setPhase('success')

      redirectId = setTimeout(() => finish(), DELAY_BEFORE_REDIRECT)
    }, POLL_INTERVAL)

    return () => {
      clearInterval(pollingId)
      clearInterval(timerId)
      if (redirectId) clearTimeout(redirectId)
    }
  }, [finish])

  useEffect(() => {
    if (elapsedTime < FALLBACK_TIMEOUT_SEC) return
    setPhase('success')
    finish(true)
  }, [elapsedTime, finish])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div className="flex justify-center transition-all duration-500">
          {phase === 'connecting' ? (
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          ) : (
            <CheckCircle className="h-16 w-16 animate-pulse text-green-500" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className={`text-2xl font-bold transition-colors duration-500 ${phase === 'connecting' ? 'text-blue-600' : 'text-green-600'}`}>
            {phase === 'connecting' ? 'Xác thực thành công!' : 'Kết nối mạng thành công!'}
          </h1>

          <p className="mx-auto max-w-md px-4 text-sm leading-relaxed text-gray-500">
            {phase === 'connecting'
              ? 'Đang thiết lập đường truyền thực tế, vui lòng giữ nguyên màn hình trong giây lát...'
              : mode === 'cna'
              ? 'Bạn đã có thể sử dụng internet. Nếu màn hình không tự đóng vui lòng bấm "Hoàn tất".'
              : 'Đang chuyển hướng, vui lòng chờ trong giây lát...'}
          </p>
        </div>

        {phase === 'success' && (
          <button
            type="button"
            onClick={() => finish(true)}
            className="mt-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Hoàn tất
          </button>
        )}

        {phase === 'connecting' && (
          <div className="mx-auto mt-6 w-64">
            <div className="h-1 w-full overflow-hidden rounded-full bg-blue-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-400">
              Đã chờ {elapsedTime}s...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
