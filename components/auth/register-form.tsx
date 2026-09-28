"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/errors";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/lib/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    onSuccess: () => {
      setFormError(null);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    },
    onError: (error) => {
      setFormError(getErrorMessage(error));
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setFormError(null);
    mutate(values);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Account created successfully.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {formError ? (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

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
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 h-9 w-full bg-emerald-600 text-white hover:bg-emerald-600/90"
      >
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
