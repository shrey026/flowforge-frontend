"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/errors";
import { authQueryKey } from "@/lib/hooks/use-auth";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation/auth";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: LoginFormValues) => loginUser(values),
    onSuccess: async (user) => {
      setFormError(null);
      // Drop any cached data from a previous session in this tab (e.g. a
      // different account's organization roles) before seeding the new
      // one, so stale permissions can't leak across users.
      queryClient.clear();
      queryClient.setQueryData(authQueryKey, user);
      router.push("/dashboard");
    },
    onError: (error) => {
      setFormError(getErrorMessage(error));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null);
    mutate(values);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {formError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-1 h-9 w-full"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
