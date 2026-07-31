import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCrossTabSync } from './createCrossTabSync'

describe('createCrossTabSync', () => {
  const listeners = new Map<string, Set<(event: Event) => void>>()

  afterEach(() => {
    listeners.clear()
    vi.unstubAllGlobals()
  })

  function stubEnvironment(channel?: {
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
    postMessage: ReturnType<typeof vi.fn>
    close: ReturnType<typeof vi.fn>
  }) {
    if (channel) {
      const methods = channel
      vi.stubGlobal(
        'BroadcastChannel',
        class {
          addEventListener = methods.addEventListener
          removeEventListener = methods.removeEventListener
          postMessage = methods.postMessage
          close = methods.close
        }
      )
    } else {
      vi.stubGlobal('BroadcastChannel', undefined)
    }

    const addEventListener = (type: string, handler: (event: Event) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)!.add(handler)
    }
    const removeEventListener = (type: string, handler: (event: Event) => void) => {
      listeners.get(type)?.delete(handler)
    }

    vi.stubGlobal('window', { addEventListener, removeEventListener })
    vi.stubGlobal('document', {
      visibilityState: 'hidden' as DocumentVisibilityState,
      addEventListener,
      removeEventListener
    })
  }

  function emit(type: string, event: Event) {
    listeners.get(type)?.forEach((handler) => handler(event))
  }

  it('notify шлёт сообщение в BroadcastChannel', () => {
    const channel = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      close: vi.fn()
    }
    stubEnvironment(channel)
    const sync = createCrossTabSync({
      storageKey: 'notes',
      channelName: 'notes-sync',
      onRemoteChange: vi.fn()
    })

    sync.notify()

    expect(channel.postMessage).toHaveBeenCalledWith({ type: 'change', payload: undefined })
  })

  it('notify передаёт payload в сообщение', () => {
    const channel = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      close: vi.fn()
    }
    stubEnvironment(channel)
    const sync = createCrossTabSync<{ id: string }>({
      storageKey: 'notes',
      channelName: 'notes-sync',
      onRemoteChange: vi.fn()
    })

    sync.notify({ id: '1' })

    expect(channel.postMessage).toHaveBeenCalledWith({ type: 'change', payload: { id: '1' } })
  })

  it('вызывает onRemoteChange на storage-событии своего ключа', () => {
    stubEnvironment({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      close: vi.fn()
    })
    const onRemoteChange = vi.fn()
    createCrossTabSync({
      storageKey: 'notes',
      channelName: 'notes-sync',
      onRemoteChange
    })

    emit('storage', { key: 'other' } as StorageEvent)
    expect(onRemoteChange).not.toHaveBeenCalled()

    emit('storage', { key: 'notes' } as StorageEvent)
    expect(onRemoteChange).toHaveBeenCalledOnce()
  })

  it('при возврате на вкладку перечитывает данные', () => {
    stubEnvironment({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      close: vi.fn()
    })
    const onRemoteChange = vi.fn()
    createCrossTabSync({
      storageKey: 'notes',
      channelName: 'notes-sync',
      onRemoteChange
    })

    Object.assign(document, { visibilityState: 'visible' })
    emit('visibilitychange', new Event('visibilitychange'))

    expect(onRemoteChange).toHaveBeenCalledOnce()
  })
})
