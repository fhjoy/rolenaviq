import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageError } from "@/components/common/PageError";
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
import { DEMO_EMAIL } from "@/config/demo";
import { updateProfile } from "@/features/auth/auth.api";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import {
  profileSchema,
  type ProfileFormData,
} from "@/features/settings/profile.schemas";
import type { User } from "@/types/auth";

function ProfileForm({ user }: { user: User }) {
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
      queryClient.setQueryData(["auth", "me"], { user: data.user });
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

  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (!isDemoUser) mutation.mutate(data);
      })}
      className="space-y-6"
    >
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
          <Input id="firstName" autoComplete="given-name" disabled={isDemoUser} {...register("firstName")} />
          {errors.firstName && <p role="alert" className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" autoComplete="family-name" disabled={isDemoUser} {...register("lastName")} />
          {errors.lastName && <p role="alert" className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" disabled={isDemoUser} {...register("email")} />
        {errors.email && <p role="alert" className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" disabled={isDemoUser || !isDirty || mutation.isPending}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="mt-8 h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <PageError
        title="Unable to load settings"
        message="Your profile information could not be loaded."
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <section className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
          <Settings className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage the profile information connected to your RoleNaviq account.
          </p>
        </div>
      </section>

      <Card className="mt-6 border-border/70 bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
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
