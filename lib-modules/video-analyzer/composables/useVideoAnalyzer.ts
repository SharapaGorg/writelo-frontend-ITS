import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { toastError } from '~/scripts/features/utils/toater'
import { useVideoAnalyzerApi } from '../helpers/api'
import { useVideoAnalyzerStore } from '../stores/videoAnalyzerStore'
import { humanizeAnalysisError } from '../helpers/humanizeError'
import { useAnalysisLimits } from './useAnalysisLimits'

const isSubmitting = ref(false)
let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null

export function useVideoAnalyzer() {
  const { requireWorkspaceId } = useWorkspaceContext()
  const api = useVideoAnalyzerApi()
  const store = useVideoAnalyzerStore()
  const limits = useAnalysisLimits()
  const { t } = useI18n()

  const history = computed(() => {
    try {
      return store.getHistory(requireWorkspaceId())
    } catch {
      return []
    }
  })

  const inFlight = computed(() => {
    try {
      return store.getInFlight(requireWorkspaceId())
    } catch {
      return []
    }
  })

  const isHistoryLoading = computed(() => {
    try {
      return store.getHistoryLoading(requireWorkspaceId())
    } catch {
      return false
    }
  })

  async function loadHistory(force = false): Promise<void> {
    let wid: string
    try {
      wid = requireWorkspaceId()
    } catch {
      return
    }
    if (!force && store.getHistory(wid).length > 0 && store.getHistoryLoading(wid)) return
    store.setHistoryLoading(wid, true)
    try {
      const list = await api.getHistory(wid, 0, 50)
      store.setHistory(wid, list)
    } catch (e) {
      console.error('[VideoAnalyzer] failed to load history', e)
    } finally {
      store.setHistoryLoading(wid, false)
    }
  }

  async function loadDetail(analysisId: string): Promise<boolean> {
    let wid: string
    try {
      wid = requireWorkspaceId()
    } catch {
      return false
    }
    let url = store.getUrlForAnalysis(analysisId)
    if (!url) {
      // Need to refresh history to find the URL for this id.
      await loadHistory(true)
      const item = store.findHistoryByAnalysisId(wid, analysisId)
      if (item) url = item.originalUrl
    }
    if (!url) return false
    try {
      const detail = await api.getAnalysisByUrl(wid, url)
      if (!detail) return false
      store.setDetail(detail)
      return true
    } catch (e) {
      console.error('[VideoAnalyzer] failed to load detail', e)
      return false
    }
  }

  // Submits the URL via SSE. Returns the freshly-resolved analysis on
  // success, or null on failure (caller stays on the grid; toast already
  // surfaced the error).
  async function submit(url: string): Promise<{ analysisId: string } | null> {
    if (isSubmitting.value) return null
    let wid: string
    try {
      wid = requireWorkspaceId()
    } catch {
      toastError('Сначала выбери бренд в верхней панели.')
      return null
    }
    isSubmitting.value = true
    store.addInFlight(wid, url)

    // Optimistic: refetch history so the new "processing" card surfaces ASAP
    // (backend creates the history row before the SSE first event arrives).
    loadHistory(true)

    let stream: ReadableStream<Uint8Array>
    try {
      stream = await api.runAnalysis(wid, url)
    } catch (e: any) {
      isSubmitting.value = false
      store.removeInFlight(wid, url)
      // ApiController already toasted server-message-or-generic; log and bail.
      console.warn('[VideoAnalyzer] runAnalysis failed', e)
      return null
    }

    const reader = stream.getReader()
    activeReader = reader
    const decoder = new TextDecoder()
    let buffer = ''
    // Public API: response_end.message is now localized display text, not a
    // machine code. For stable error logic, fall back to historyItem.errorCode
    // after refetch.
    let endPayload: { success: boolean; message: string | null } | null = null

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        while (true) {
          const lineEnd = buffer.indexOf('\n')
          if (lineEnd === -1) break
          const line = buffer.slice(0, lineEnd).trim()
          buffer = buffer.slice(lineEnd + 1)
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.action === 'response_end') {
              endPayload = {
                success: !!parsed.success,
                message: parsed.message ?? null,
              }
            }
          } catch {
            /* ignore bad json */
          }
        }
      }
    } catch (e) {
      console.warn('[VideoAnalyzer] stream error', e)
    } finally {
      if (activeReader === reader) activeReader = null
      store.removeInFlight(wid, url)
      isSubmitting.value = false
    }

    // Always refetch — backend finalised either way.
    await loadHistory(true)
    limits.refresh().catch(() => { /* noop */ })

    if (!endPayload || endPayload.success === false) {
      // Prefer SSE message (already localized). Fall back to the freshly
      // refetched history row, which carries a stable errorCode.
      const item = store.getHistory(wid).find(i => i.originalUrl === url || i.normalizedUrl === url)
      const msg = humanizeAnalysisError(t, item?.errorCode, endPayload?.message ?? item?.errorMessage)
      toastError(msg)
      return null
    }

    // Resolve the analysisId via the freshly-refetched history.
    const item = store.getHistory(wid).find(i => i.originalUrl === url || i.normalizedUrl === url)
    if (!item || !item.shortVideoAnalysisId) return null
    await loadDetail(item.shortVideoAnalysisId)
    return { analysisId: item.shortVideoAnalysisId }
  }

  async function cancel() {
    if (!activeReader) return
    try {
      await activeReader.cancel()
    } catch {
      /* noop */
    }
    activeReader = null
    isSubmitting.value = false
  }

  // Create-or-fetch a public share token for a completed analysis. Idempotent
  // on the backend; we also cache the response per-analysis so re-opening the
  // share popover within the session is instant. Returns null if the request
  // failed (toast already surfaced by ApiController).
  async function share(analysisId: string) {
    let wid: string
    try {
      wid = requireWorkspaceId()
    } catch {
      return null
    }
    try {
      const dto = await api.shareAnalysis(wid, analysisId)
      store.setShare(analysisId, dto)
      return dto
    } catch (e) {
      console.warn('[VideoAnalyzer] share failed', e)
      return null
    }
  }

  // DELETE the active share. Treat 404 (already revoked elsewhere) as success
  // since the user-visible outcome — "no longer shared" — is the same.
  async function unshare(analysisId: string): Promise<boolean> {
    let wid: string
    try {
      wid = requireWorkspaceId()
    } catch {
      return false
    }
    try {
      await api.unshareAnalysis(wid, analysisId)
      store.clearShare(analysisId)
      return true
    } catch (e: any) {
      const status = e?.status || e?.statusCode
      if (status === 404) {
        store.clearShare(analysisId)
        return true
      }
      console.warn('[VideoAnalyzer] unshare failed', e)
      return false
    }
  }

  // Poll history every 5s while a specific analysis is still `processing`.
  // The caller is responsible for stopping (returned function).
  function pollIfProcessing(analysisId: string): () => void {
    let timer: ReturnType<typeof setInterval> | null = null
    let stopped = false

    const tick = async () => {
      if (stopped) return
      let wid: string
      try {
        wid = requireWorkspaceId()
      } catch {
        return
      }
      try {
        const list = await api.getHistory(wid, 0, 50)
        store.setHistory(wid, list)
        const item = list.find(i => i.shortVideoAnalysisId === analysisId)
        if (!item) return
        if (item.status === 'completed') {
          await loadDetail(analysisId)
          stop()
        } else if (item.status === 'failed') {
          stop()
        }
      } catch (e) {
        console.warn('[VideoAnalyzer] poll error', e)
      }
    }

    function stop() {
      if (timer) clearInterval(timer)
      timer = null
      stopped = true
    }

    timer = setInterval(tick, 5000)
    return stop
  }

  // Best-effort: cancel the SSE if the *last* user of this composable is
  // unmounting and a request is still in flight. The composable is shared
  // module-scope state, so this only fires when the page itself goes away.
  onUnmounted(() => {
    // Don't actually cancel — page navigation shouldn't kill background
    // analysis. Left as a hook in case we want to add a "Stop" button later.
  })

  return {
    isSubmitting: computed(() => isSubmitting.value),
    history,
    inFlight,
    isHistoryLoading,
    loadHistory,
    loadDetail,
    submit,
    cancel,
    pollIfProcessing,
    share,
    unshare,
  }
}
