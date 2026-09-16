import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

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
import { Skeleton } from "@/components/ui/skeleton";
import { PageError } from "@/components/common/PageError";
import { DEMO_EMAIL } from "@/config/demo";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { updateProfile } from "@/features/auth/auth.api";
import {
  profileSchema,
  type ProfileFormData,
} from "@/features/settings/profile.schemas";
import type { User } from "@/types/auth";

interface ProfileFormProps {
  user: User;
}

function ProfileForm({ user }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const isDemoUser = user.email === DEMO_EMAIL;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),

    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], {
        user: data.user,
      });

      reset({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
      });

      toast.success("Profile updated");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Unable to update profile");
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (isDemoUser) {
      return;
    }

    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isDemoUser && (
        <div className="flex gap-3 rounded-xl border border-brand/20 bg-brand/8 p-4 text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="font-medium">Demo profile is protected</p>
            <p className="mt-1 text-muted-foreground">
              You can explore applications, the board and the calendar, but the public demo account details cannot be changed.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>

          <Input
            id="firstName"
            autoComplete="given-name"
            disabled={isDemoUser}
            {...register("firstName")}
          />

          {errors.firstName && (
            <p role="alert" className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>

          <Input
            id="lastName"
            autoComplete="family-name"
            disabled={isDemoUser}
            {...register("lastName")}
          />

          {errors.lastName && (
            <p role="alert" className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isDemoUser}
          {...register("email")}
        />

        {errors.email && (
          <p role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isDemoUser || !isDirty || mutation.isPending}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function SettingsPage() {
  const { data, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-4 w-80" />

        <div className="mt-8 rounded-xl border p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-4 w-64" />

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-9 w-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-9 w-full" />
            </div>
          </div>

          <div className="mt-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-9 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <PageError
        title="Unable to load settings"
        message="Your profile information could not be loaded."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <p className="mt-2 text-muted-foreground">
          Manage your RoleNaviq profile and account information.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <CardTitle>Profile</CardTitle>

              <CardDescription>
                Update your personal information.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ProfileForm user={data.user} />
        </CardContent>
      </Card>
    </div>
  );
}
