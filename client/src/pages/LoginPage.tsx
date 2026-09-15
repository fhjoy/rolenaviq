import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
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

import { loginUser } from "@/features/auth/auth.api";
import { loginSchema, type LoginFormData } from "@/features/auth/auth.schemas";
import { ApiError } from "@/services/api";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], {
        user: data.user,
      });

      navigate("/dashboard");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout>
      <Card className="border-border/70 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl tracking-tight">
            Welcome back
          </CardTitle>

          <CardDescription>
            Sign in to continue managing your job search.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
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
