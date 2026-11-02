import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Are you sure?',
  description,
  itemName,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = () => {
    void onConfirm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isLoading) return
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ||
              `This action cannot be undone. This will permanently delete ${itemName || 'this item'}.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
