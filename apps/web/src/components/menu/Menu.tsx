import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Plan } from '../PlanBadge'
import { MenuFooter } from './MenuFooter'
import { MenuHeader } from './MenuHeader'
import type { AnalysisRecord } from './main/history/MenuHistory'
import { MenuMain } from './main/MenuMain'

interface MenuProps {
  open: boolean
  onClose: () => void
  plan?: Plan
  records?: AnalysisRecord[]
  isRecordsLoading?: boolean
  isRecordsError?: boolean
  onRetryRecords?: () => void
}

const noop = () => {}

export function Menu({
  open,
  onClose,
  plan = 'free',
  records = [],
  isRecordsLoading = false,
  isRecordsError = false,
  onRetryRecords = noop,
}: MenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const previouslyFocusedElement = document.activeElement
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    dialog?.showModal()
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      dialog?.close()

      if (previouslyFocusedElement instanceof HTMLElement && previouslyFocusedElement.isConnected) {
        previouslyFocusedElement.focus()
      }
    }
  }, [open])

  if (!open) {
    return null
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      id="fullscreen-navigation-menu"
      className="fixed inset-0 m-0 flex h-dvh max-h-none w-full max-w-none flex-col overflow-y-auto overscroll-contain border-0 bg-white p-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-[#191f28]"
      aria-modal="true"
      aria-labelledby="fullscreen-navigation-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
    >
      <MenuHeader closeButtonRef={closeButtonRef} onClose={onClose} />
      <MenuMain
        plan={plan}
        records={records}
        isRecordsLoading={isRecordsLoading}
        isRecordsError={isRecordsError}
        onRetryRecords={onRetryRecords}
        onClose={onClose}
      />
      <MenuFooter />
    </dialog>,
    document.body,
  )
}
