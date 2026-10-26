import Button from './Button'
import Modal from './Modal'

// "Are you sure?" dialog built on Modal. `message` may contain JSX.
// While `loading`, it can't be dismissed, so a running request isn't orphaned.
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  loadingLabel,
  variant = 'danger',
  icon,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onCancel} dismissible={!loading}>
      <div className="mb-5 text-sm text-gray-600">{message}</div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={variant}
          icon={icon}
          loading={loading}
          loadingText={loadingLabel}
          onClick={onConfirm}
          data-autofocus
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
