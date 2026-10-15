import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageError } from "@/components/common/PageError";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { getAuthProviders, updateProfile } from "@/features/auth/auth.api";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import {
  profileSchema,
  type ProfileFormData,
} from "@/features/settings/profile.schemas";
import type { User } from "@/types/auth";

function ProfileForm({ user, emailVerificationEnabled }: { user: User; emailVerificationEnabled: boolean }) {
  const queryClient = useQueryClient();
  const isDemoUser = user.isDemo || user.email === DEMO_EMAIL;

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
              You can explore applications, the board and the calendar. Demo profile details cannot be changed.
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
        <Input id="email" type="email" autoComplete="email" disabled={isDemoUser || user.googleLinked || emailVerificationEnabled} {...register("email")} />
        {user.googleLinked && <p className="text-sm text-muted-foreground">This email belongs to your connected Google account.</p>}
        {!user.googleLinked && emailVerificationEnabled && !isDemoUser && <p className="text-sm text-muted-foreground">Email changes are paused until we can verify the new address. You can still update your name.</p>}
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
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = useCurrentUser();
  const { data: providers } = useQuery({
    queryKey: ["auth", "providers"],
    queryFn: getAuthProviders,
    retry: false,
  });

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
      <section className="workspace-page-intro flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
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
          <ProfileForm user={data.user} emailVerificationEnabled={Boolean(providers?.emailVerification)} />
        </CardContent>
      </Card>

      {(providers?.google || data.user.googleLinked) && !data.user.isDemo && data.user.email !== DEMO_EMAIL && (
        <Card className="mt-6 border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Google sign-in</CardTitle>
            <CardDescription>Use your Google account to sign in to this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchParams.get("google") === "linked" && (
              <p role="status" className="text-sm text-brand">Google is connected to your account.</p>
            )}
            {searchParams.get("google") === "conflict" && (
              <p role="alert" className="text-sm text-destructive">Use the Google account with the same verified email as this profile. An account already using Google cannot be linked again.</p>
            )}
            {data.user.googleLinked ? (
              <p className="text-sm text-muted-foreground">Connected. You can sign in with Google next time.</p>
            ) : (
              <a href={`${import.meta.env.VITE_API_URL}/auth/google/link`} className={buttonVariants({ variant: "outline" })}>
                Connect Google account
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
