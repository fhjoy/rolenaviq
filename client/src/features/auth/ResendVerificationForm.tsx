import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resendVerification } from "./auth.api";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const mutation = useMutation({ mutationFn: resendVerification });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(email);
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-3 border-t pt-5">
      <p className="text-sm font-medium">Need a new verification link?</p>
      <Label htmlFor="verification-email">Account email</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="verification-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" variant="outline" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending…" : "Send new link"}
        </Button>
      </div>
      {mutation.isSuccess && <p role="status" className="text-sm text-muted-foreground">{mutation.data.message}</p>}
      {mutation.isError && <p role="alert" className="text-sm text-destructive">Unable to request a link right now. Please try again.</p>}
    </form>
  );
}
