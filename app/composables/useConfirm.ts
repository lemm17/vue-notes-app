interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (result: boolean) => void
}

const request = ref<ConfirmRequest | null>(null)

/**
 * Нналог нативному window.confirm. Возвращает промис с ответом пользователя.
 * Рендерится через ConfirmDialogHost на базе переиспользуемого ModalDialog.
 * Состояние общее для всего приложения, одновременно активен только один запрос на подтверждение.
 */
export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      request.value = { ...options, resolve }
    })
  }

  function respond(result: boolean) {
    request.value?.resolve(result)
    request.value = null
  }

  return { request: readonly(request), confirm, respond }
}
