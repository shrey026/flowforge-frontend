import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <Icon className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Coming soon</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This area is being built. Check back soon for the full {title.toLowerCase()} experience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
