import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/config/demo";
import { loginUser } from "@/features/auth/auth.api";
import { loginSchema, type LoginFormData } from "@/features/auth/auth.schemas";
import { ApiError } from "@/services/api";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isDemoLogin = searchParams.get("demo") === "1";
  const registrationComplete = searchParams.get("registered") === "1";
  const sessionExpired = searchParams.get("expired") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: isDemoLogin
      ? {
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        }
      : undefined,
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], { user: data.user });
      navigate("/dashboard");
    },
  });

  return (
    <AuthLayout>
      <Card className="border-border/70 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl tracking-tight">
            {isDemoLogin ? "Explore the demo" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isDemoLogin
              ? "The demo credentials are already filled in. Sign in to explore the dashboard, board and calendar."
              : "Sign in to continue managing your job search."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sessionExpired && !isDemoLogin && (
            <div
              className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              role="status"
            >
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Session expired</p>
                <p className="mt-1 opacity-90">
                  Please sign in again to continue using RoleNaviq.
                </p>
              </div>
            </div>
          )}

          {registrationComplete && !isDemoLogin && !sessionExpired && (
            <div
              className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              role="status"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Account created</p>
                <p className="mt-1 opacity-90">
                  You can sign in with your new account now.
                </p>
              </div>
            </div>
          )}

          {isDemoLogin && (
            <div className="mb-5 rounded-xl border border-brand/20 bg-brand/8 p-4 text-sm">
              <p className="font-medium">Public demo account</p>
              <p className="mt-1 text-muted-foreground">
                Feel free to move applications and explore the workflow. Demo data is restored on the next demo login, while the demo profile itself stays protected.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {loginMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {loginMutation.error instanceof ApiError
                  ? loginMutation.error.message
                  : "Login failed"}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? "Signing in..."
                : isDemoLogin
                  ? "Enter demo"
                  : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
