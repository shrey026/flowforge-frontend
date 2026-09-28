"use client";

import { FolderKanban, ListChecks, Users, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const OVERVIEW_CARDS = [
  { label: "Projects", icon: FolderKanban },
  { label: "Tasks", icon: ListChecks },
  { label: "Team Members", icon: Users },
  { label: "Completed Tasks", icon: CheckCircle2 },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {getGreeting()}
          {user ? `, ${user.name}` : ""}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_CARDS.map(({ label, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardAction>
                <Icon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">--</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Updates from your projects and tasks will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
