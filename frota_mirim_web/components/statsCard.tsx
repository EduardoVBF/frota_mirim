"use client";
import { FadeIn } from "./motion/fadeIn";

type StatsCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconColor: string;
};

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  iconColor,
}) => {
  return (
    <FadeIn>
      <div className="p-3 rounded-2xl bg-alternative-bg border border-border flex items-center justify-start gap-4">
        {}
        <div
          className={`p-3 rounded-xl bg-background border border-border ${iconColor}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        </div>
      </div>
    </FadeIn>
  );
};
