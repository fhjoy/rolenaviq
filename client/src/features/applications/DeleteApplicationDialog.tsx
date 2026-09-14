import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  company: string;
  position: string;

  isDeleting: boolean;

  onConfirm: () => void;
}

export function DeleteApplicationDialog({
  open,
  onOpenChange,
  company,
  position,
  isDeleting,
  onConfirm,
}: DeleteApplicationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete application?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete your application for{" "}
            <strong>{position}</strong> at <strong>{company}</strong>. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete application"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
