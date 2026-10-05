"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check, LogOut } from "lucide-react";

import { PageHeader, Panel } from "@/components/layout/page-header";
import { useOrganizationContext } from "@/components/providers/organization-provider";
import { useTheme, type Theme } from "@/components/providers/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatEnumLabel, getInitials } from "@/lib/format";
import { useAuth, useLogout } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-x-10 gap-y-4 border-t border-border py-8 first:border-t-0 first:pt-0 lg:grid-cols-[16rem_minmax(0,1fr)]"
    >
      <div>
        <h2 id={id} className="text-sm font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 flex-col justify-center gap-0.5 border-b border-border px-4 py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-[13px] text-foreground">
        {children}
      </dd>
    </div>
  );
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** Miniature of the app shell, drawn in the theme it represents. */
function ThemePreview({ theme }: { theme: Theme }) {
  const isDark = theme === "dark";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-20 overflow-hidden rounded-md border",
        isDark ? "border-[#252a27] bg-[#0b0d0c]" : "border-[#e4e8e4] bg-[#f7f8f6]"
      )}
    >
      <span
        className={cn(
          "flex w-1/4 flex-col gap-1.5 border-r p-2",
          isDark ? "border-[#252a27]" : "border-[#e4e8e4]"
        )}
      >
        <span className={cn("h-1.5 w-3/4 rounded-full", isDark ? "bg-[#21b875]" : "bg-[#16a36a]")} />
        <span className={cn("h-1 w-full rounded-full", isDark ? "bg-[#2f3531]" : "bg-[#d8ddd8]")} />
        <span className={cn("h-1 w-2/3 rounded-full", isDark ? "bg-[#2f3531]" : "bg-[#d8ddd8]")} />
      </span>
      <span className="flex flex-1 flex-col gap-1.5 p-2">
        <span className={cn("h-1.5 w-1/3 rounded-full", isDark ? "bg-[#f2f5f3]" : "bg-[#111412]")} />
        <span
          className={cn(
            "flex-1 rounded-sm border",
            isDark ? "border-[#252a27] bg-[#111413]" : "border-[#e4e8e4] bg-white"
          )}
        />
      </span>
    </span>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { activeOrganization, isLoading: isOrganizationLoading } =
    useOrganizationContext();
  const { theme, setTheme } = useTheme();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Your account, appearance and workspace details."
      />

      <div>
        <SettingsSection
          id="settings-profile"
          title="Profile"
          description="How you appear to the people you work with."
        >
          <Panel>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Avatar size="lg">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                <AvatarFallback>
                  {user ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.name}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <dl>
              <Field label="Name">{user?.name}</Field>
              <Field label="Email">{user?.email}</Field>
              {user && (
                <Field label="Member since">{formatDate(user.createdAt)}</Field>
              )}
            </dl>
          </Panel>
        </SettingsSection>

        <SettingsSection
          id="settings-appearance"
          title="Appearance"
          description="Choose how FlowForge looks on this device."
        >
          <div
            role="radiogroup"
            aria-labelledby="settings-appearance"
            className="grid max-w-md grid-cols-2 gap-3"
          >
            {THEME_OPTIONS.map((option) => {
              const isSelected = theme === option.value;

              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2.5 rounded-xl border bg-card p-2.5 transition-colors duration-150 ease-out has-focus-visible:ring-2 has-focus-visible:ring-ring/35",
                    isSelected
                      ? "border-brand"
                      : "border-border hover:border-input"
                  )}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setTheme(option.value)}
                    className="sr-only"
                  />
                  <ThemePreview theme={option.value} />
                  <span className="flex items-center justify-between px-0.5 text-[13px] font-medium text-foreground">
                    {option.label}
                    {isSelected && (
                      <Check className="size-3.5 text-brand" aria-hidden="true" />
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </SettingsSection>

        <SettingsSection
          id="settings-workspace"
          title="Workspace"
          description="The organization you're currently working in. Switch organizations from the sidebar."
        >
          <Panel>
            {isOrganizationLoading ? (
              <div className="flex flex-col gap-3 p-4" role="status" aria-label="Loading workspace">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ) : activeOrganization ? (
              <dl>
                <Field label="Name">{activeOrganization.name}</Field>
                <Field label="Slug">
                  <span className="font-mono text-xs">
                    {activeOrganization.slug}
                  </span>
                </Field>
                <Field label="Your role">
                  {formatEnumLabel(activeOrganization.role)}
                </Field>
                <Field label="Joined">
                  {formatDate(activeOrganization.joinedAt)}
                </Field>
              </dl>
            ) : (
              <p className="px-4 py-3.5 text-[13px] text-muted-foreground">
                No organization selected.
              </p>
            )}
          </Panel>
          {activeOrganization && (
            <Link
              href="/members"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3"
              )}
            >
              View members
            </Link>
          )}
        </SettingsSection>

        <SettingsSection
          id="settings-session"
          title="Session"
          description="Sign out of FlowForge on this device."
        >
          <Button
            variant="outline"
            disabled={isLoggingOut}
            onClick={() => logout()}
          >
            <LogOut />
            {isLoggingOut ? "Logging out…" : "Log out"}
          </Button>
        </SettingsSection>
      </div>
    </div>
  );
}
