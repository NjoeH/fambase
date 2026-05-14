import Icon from "../Icon";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
}

export default function StatCard({ icon, label, value, unit }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-md border border-transparent hover:border-primary-container transition-all">
      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mb-sm">
        <Icon name={icon} className="text-primary" />
      </div>
      <div className="text-xs text-on-surface-variant">{label}</div>
      <div className="text-2xl font-semibold">
        {value}
        {unit && <span className="text-xs font-normal ml-1">{unit}</span>}
      </div>
    </div>
  );
}
