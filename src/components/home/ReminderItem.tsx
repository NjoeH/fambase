import Icon from "../Icon";

type Urgency = "high" | "medium" | "low";

interface ReminderItemProps {
  icon: string;
  title: string;
  subtitle: string;
  urgency: Urgency;
  urgencyLabel: string;
}

const urgencyStyles: Record<Urgency, { bar: string; icon: string; text: string }> = {
  high:   { bar: "bg-error",   icon: "text-error",   text: "text-error" },
  medium: { bar: "bg-tertiary", icon: "text-tertiary", text: "text-tertiary" },
  low:    { bar: "bg-primary",  icon: "text-primary",  text: "text-primary" },
};

export default function ReminderItem({ icon, title, subtitle, urgency, urgencyLabel }: ReminderItemProps) {
  const s = urgencyStyles[urgency];
  return (
    <div className="bg-surface flex items-center p-md rounded-lg gap-md relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${s.bar}`} />
      <Icon name={icon} className={s.icon} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant">{subtitle}</p>
      </div>
      <span className={`text-sm font-semibold ${s.text}`}>{urgencyLabel}</span>
    </div>
  );
}
