import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface MenuLayoutProps {
  children: ReactNode
  open: boolean
  onClose: () => void
}

export function MenuLayout({ children, open, onClose }: MenuLayoutProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const previouslyFocusedElement = document.activeElement
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    if (import.meta.env.DEV) {
      closeButtonRef.current?.focus()
    } else {
      const firstItem = contentRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')
      const focusTarget = firstItem ?? contentRef.current
      focusTarget?.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus()
      }
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return createPortal(
    <section
      id="fullscreen-navigation-menu"
      className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-navigation-title"
    >
      <header className="shrink-0 px-6">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between">
          <h2 id="fullscreen-navigation-title" className="text-xl font-bold text-[#191f28]">
            전체 메뉴
          </h2>
          {import.meta.env.DEV ? (
            <button
              ref={closeButtonRef}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#4e5968] transition-colors hover:bg-[#f2f4f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182f6]"
              aria-label="메뉴 닫기"
              onClick={onClose}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 5l14 14M19 5 5 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-8 pb-8">
        <div ref={contentRef} tabIndex={-1} className="mx-auto w-full max-w-lg outline-none">
          {children}
        </div>
      </div>
    </section>,
    document.body,
  )
}
