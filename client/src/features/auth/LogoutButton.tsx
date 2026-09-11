import { LogOut } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { logoutUser } from "./auth.api";

export function LogoutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      queryClient.clear();

      navigate("/login", {
        replace: true,
      });
    },
  });

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start gap-3"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />

      {logoutMutation.isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
