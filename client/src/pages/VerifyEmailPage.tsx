import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResendVerificationForm } from "@/features/auth/ResendVerificationForm";
import { verifyEmail } from "@/features/auth/auth.api";

export function VerifyEmailPage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const started = useRef(false);
  const token = new URLSearchParams(hash.slice(1)).get("token");
  const mutation = useMutation({ mutationFn: verifyEmail });

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    // Remove the one-use token from the browser address before sending it in a POST.
    navigate("/verify-email", { replace: true });
    mutation.mutate(token);
  }, [token, navigate, mutation]);

  return (
    <AuthLayout>
      <Card className="border-border/70 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Verify your email</CardTitle>
          <CardDescription>Confirm your address to open your RoleNaviq workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {mutation.isPending && <p role="status" className="text-sm">Checking your link…</p>}
          {mutation.isSuccess && (
            <div role="status" className="rounded-xl border border-brand/20 bg-brand/8 p-4 text-sm">
              <p className="font-medium">Email verified</p>
              <p className="mt-1 text-muted-foreground">You can sign in with your password now.</p>
            </div>
          )}
          {mutation.isError && <p role="alert" className="text-sm text-destructive">This link is invalid or expired. Request another one below.</p>}
          {!token && mutation.isIdle && <p className="text-sm text-muted-foreground">Open the link in your verification email. If you need a fresh link, enter your address below.</p>}
          <Link to="/login" className={buttonVariants({ className: "w-full" })}>Go to sign in</Link>
          {!mutation.isSuccess && <ResendVerificationForm />}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
