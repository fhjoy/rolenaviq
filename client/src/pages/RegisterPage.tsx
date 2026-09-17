import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { registerUser } from "@/features/auth/auth.api";
import {
  registerSchema,
  type RegisterFormData,
} from "@/features/auth/auth.schemas";
import { ApiError } from "@/services/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => navigate("/login?registered=1"),
  });

  return (
    <AuthLayout>
      <Card className="border-border/70 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl tracking-tight">Create your account</CardTitle>
          <CardDescription>
            Start managing your job applications with RoleNaviq.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-destructive" role="alert">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
                {errors.lastName && <p className="text-sm text-destructive" role="alert">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive" role="alert">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive" role="alert">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-sm text-destructive" role="alert">{errors.confirmPassword.message}</p>}
            </div>

            {registerMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {registerMutation.error instanceof ApiError
                  ? registerMutation.error.message
                  : "Registration failed"}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
