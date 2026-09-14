import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

import { logoutUser } from "@/features/auth/auth.api";

export function LogoutButton() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      queryClient.clear();

      setOpen(false);

      toast.success("Signed out successfully");

      navigate("/login", {
        replace: true,
      });
    },

    onError: () => {
      toast.error("Unable to sign out");
    },
  });

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to sign out of RoleNaviq?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={logoutMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
