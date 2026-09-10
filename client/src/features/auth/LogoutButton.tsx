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
      queryClient.removeQueries({
        queryKey: ["auth"],
      });

      navigate("/login");
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
