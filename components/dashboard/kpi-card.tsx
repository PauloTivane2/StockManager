"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: "primary" | "success" | "danger" | "warning" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorMap = {
  primary: {
    bg: "bg-primary/10",
    icon: "text-primary",
    gradient: "from-primary/20 to-primary/5",
    border: "border-primary/20",
  },
  success: {
    bg: "bg-success/10",
    icon: "text-success",
    gradient: "from-success/20 to-success/5",
    border: "border-success/20",
  },
  danger: {
    bg: "bg-danger/10",
    icon: "text-danger",
    gradient: "from-danger/20 to-danger/5",
    border: "border-danger/20",
  },
  warning: {
    bg: "bg-warning/10",
    icon: "text-warning",
    gradient: "from-warning/20 to-warning/5",
    border: "border-warning/20",
  },
  info: {
    bg: "bg-info/10",
    icon: "text-info",
    gradient: "from-info/20 to-info/5",
    border: "border-info/20",
  },
};

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  color = "primary",
  trend,
}: KPICardProps) {
  const c = colorMap[color];
  const TrendIcon = trend
    ? trend.value === 0
      ? Minus
      : trend.isPositive
      ? TrendingUp
      : TrendingDown
    : null;

  return (
    <Card className={cn("relative overflow-hidden border", c.border)}>
      {/* Subtle gradient top strip */}
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", c.gradient.replace("from-", "from-").replace("/5", ""))} />
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", c.bg)}>
            <Icon className={cn("h-6 w-6", c.icon)} />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {trend && TrendIcon && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.value === 0
                ? "bg-muted text-muted-foreground"
                : trend.isPositive
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            )}>
              <TrendIcon className="h-3 w-3" />
              {Math.abs(trend.value)}%
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
