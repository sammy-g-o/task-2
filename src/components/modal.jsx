import { useEffect, useRef } from "react"

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Modal({ open, onClose, titleId, children, labelledBy }) {
    const overlayRef = useRef(null)
    const dialogRef = useRef(null)
    const previouslyFocusedRef = useRef(null)

    useEffect(() => {
        if (!open) return
        previouslyFocusedRef.current = document.activeElement
        const root = dialogRef.current
        if (root) {
            const focusable = root.querySelectorAll(FOCUSABLE)
            const first = focusable[0]
            ;(first || root).focus()
        }
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        function handleKey(e) {
            if (e.key === 'Escape') {
                e.stopPropagation()
                onClose?.()
                return
            }
            if (e.key === 'Tab' && root) {
                const focusable = Array.from(root.querySelectorAll(FOCUSABLE))
                if (focusable.length === 0) {
                    e.preventDefault()
                    return
                }
                const first = focusable[0]
                const last = focusable[focusable.length - 1]
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = prevOverflow
            const prev = previouslyFocusedRef.current
            if (prev && typeof prev.focus === 'function') prev.focus()
        }
    }, [open, onClose])

    if (!open) return null

    function handleOverlayClick(e) {
        if (e.target === overlayRef.current) onClose?.()
    }

    return (
        <div
            ref={overlayRef}
            className="modal__overlay"
            onClick={handleOverlayClick}
        >
            <div
                ref={dialogRef}
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy || titleId}
                tabIndex={-1}
            >
                {children}
            </div>
        </div>
    )
}
export default Modal
